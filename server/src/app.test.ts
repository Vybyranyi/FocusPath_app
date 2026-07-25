import request from 'supertest';
import app from '@app';
import User from '@models/User';

const validUser = {
    name: 'Test',
    surname: 'User',
    birthday: '1990-01-01T00:00:00.000Z',
    gender: 'male',
    email: 'testuser@example.com',
    password: 'password123',
};

describe('Application hardening', () => {

    describe('security headers', () => {
        it('sets helmet defaults on responses', async () => {
            const response = await request(app).get('/auth/token');

            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
            // Express advertises itself by default; helmet removes the header.
            expect(response.headers).not.toHaveProperty('x-powered-by');
        });

        it('allows the API to be read cross-origin', async () => {
            const response = await request(app).get('/auth/token');

            expect(response.headers['cross-origin-resource-policy']).toBe('cross-origin');
        });
    });

    describe('CORS', () => {
        it('accepts an origin on the allowlist', async () => {
            const response = await request(app)
                .get('/auth/token')
                .set('Origin', 'http://localhost:5173');

            expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
            expect(response.headers['access-control-allow-credentials']).toBe('true');
        });

        it('withholds CORS headers from an origin that is not allowed', async () => {
            const response = await request(app)
                .get('/auth/token')
                .set('Origin', 'https://evil.example.com');

            expect(response.headers).not.toHaveProperty('access-control-allow-origin');
        });

        it('does not gate callers that send no Origin at all', async () => {
            // curl, health checks and server-to-server calls are not browser
            // cross-origin requests and have no Origin to check.
            const response = await request(app).get('/auth/token');

            expect(response.status).toBe(401);
        });
    });

    describe('unknown routes', () => {
        it('answers with JSON rather than an HTML error page', async () => {
            const response = await request(app)
                .get('/does-not-exist')
                .expect(404);

            expect(response.body).toEqual({ message: 'Not found' });
        });
    });

    describe('request body limits', () => {
        it('rejects a body beyond the configured limit', async () => {
            const response = await request(app)
                .post('/auth/')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify({ ...validUser, note: 'x'.repeat(3 * 1024 * 1024) }));

            expect(response.status).toBe(413);
        });
    });

    describe('NoSQL injection', () => {
        beforeEach(async () => {
            await request(app).post('/auth/').send(validUser).expect(201);
        });

        it('does not let an operator object stand in for an email at login', async () => {
            const response = await request(app)
                .post('/auth/token')
                .send({ email: { $ne: null }, password: 'password123' })
                .expect(400);

            // Unguarded, this matches whichever user comes first and turns login
            // into a guess-any-password attack.
            expect(response.body).not.toHaveProperty('token');
        });

        it('does not let an operator object bypass the duplicate-email check', async () => {
            const response = await request(app)
                .post('/auth/')
                .send({ ...validUser, email: { $ne: null } })
                .expect(400);

            expect(response.body).not.toHaveProperty('token');
            expect(await User.countDocuments()).toBe(1);
        });
    });

    describe('password storage', () => {
        it('leaves the hash out of ordinary queries', async () => {
            await request(app).post('/auth/').send(validUser).expect(201);

            const user = await User.findOne({ email: validUser.email });

            expect(user).not.toBeNull();
            expect(user?.password).toBeUndefined();
        });

        it('still returns the hash when a caller explicitly asks for it', async () => {
            await request(app).post('/auth/').send(validUser).expect(201);

            const user = await User.findOne({ email: validUser.email }).select('+password');

            expect(user?.password).toEqual(expect.any(String));
            expect(user?.password).not.toBe(validUser.password);
        });

        it('rejects a password longer than bcrypt can hash', async () => {
            const response = await request(app)
                .post('/auth/')
                .send({ ...validUser, password: 'a'.repeat(73) })
                .expect(400);

            expect(response.body.message).toBe('Password must not exceed 72 bytes');
        });
    });

    describe('mass assignment', () => {
        it('ignores schema fields the caller was not invited to set', async () => {
            const response = await request(app)
                .post('/auth/')
                .send({ ...validUser, avatar: 'data:image/png;base64,AAAA' })
                .expect(201);

            // avatar is a real schema path, so a spread of req.body would have
            // written it. Registration accepts a fixed set of fields instead.
            expect(response.body.user.avatar).toBeUndefined();
        });
    });

    describe('avatar uploads', () => {
        let token: string;

        beforeEach(async () => {
            const res = await request(app).post('/auth/').send(validUser).expect(201);
            token = res.body.token;
        });

        it('accepts a png data URI', async () => {
            const response = await request(app)
                .patch('/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ avatar: 'data:image/png;base64,iVBORw0KGgo=' })
                .expect(200);

            expect(response.body.user.avatar).toBe('data:image/png;base64,iVBORw0KGgo=');
        });

        it('rejects a payload that is not an image data URI', async () => {
            const response = await request(app)
                .patch('/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ avatar: 'https://example.com/avatar.png' })
                .expect(400);

            expect(response.body.message).toBe(
                'Avatar must be a base64 data URI of type png, jpeg or webp',
            );
        });

        it('rejects an svg data URI, which can carry script', async () => {
            const response = await request(app)
                .patch('/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ avatar: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' })
                .expect(400);

            expect(response.body.message).toContain('png, jpeg or webp');
        });
    });
});
