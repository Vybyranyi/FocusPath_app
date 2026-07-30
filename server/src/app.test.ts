import request from 'supertest';
import app from '@app';
import User from '@models/User';
import { signUp, validUser } from './testUtils';

describe('Application hardening', () => {

    describe('security headers', () => {
        it('sets helmet defaults on responses', async () => {
            const response = await request(app).get('/auth/me');

            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
            // Express advertises itself by default; helmet removes the header.
            expect(response.headers).not.toHaveProperty('x-powered-by');
        });

        it('allows the API to be read cross-origin', async () => {
            const response = await request(app).get('/auth/me');

            expect(response.headers['cross-origin-resource-policy']).toBe('cross-origin');
        });
    });

    describe('CORS', () => {
        it('accepts an origin on the allowlist', async () => {
            const response = await request(app)
                .get('/auth/me')
                .set('Origin', 'http://localhost:5173');

            expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
            expect(response.headers['access-control-allow-credentials']).toBe('true');
        });

        it('withholds CORS headers from an origin that is not allowed', async () => {
            const response = await request(app)
                .get('/auth/me')
                .set('Origin', 'https://evil.example.com');

            expect(response.headers).not.toHaveProperty('access-control-allow-origin');
        });

        it('does not gate callers that send no Origin at all', async () => {
            // curl, health checks and server-to-server calls are not browser
            // cross-origin requests and have no Origin to check.
            const response = await request(app).get('/auth/me');

            expect(response.status).toBe(401);
        });
    });

    describe('unknown routes', () => {
        it('answers with the error envelope rather than an HTML error page', async () => {
            const response = await request(app)
                .get('/does-not-exist')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('NOT_FOUND');
            expect(response.body.error.message).toBe('Cannot GET /does-not-exist');
        });
    });

    describe('request body limits', () => {
        it('rejects a body beyond the configured limit', async () => {
            const response = await request(app)
                .post('/auth/register')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify({ ...validUser, note: 'x'.repeat(3 * 1024 * 1024) }))
                .expect(413);

            expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
        });

        it('reports malformed JSON as a bad request rather than a crash', async () => {
            const response = await request(app)
                .post('/auth/register')
                .set('Content-Type', 'application/json')
                .send('{"email": ')
                .expect(400);

            expect(response.body.error.message).toBe('Request body is not valid JSON');
        });
    });

    describe('NoSQL injection', () => {
        beforeEach(async () => {
            await request(app).post('/auth/register').send(validUser).expect(201);
        });

        it('does not let an operator object stand in for an email at login', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({ email: { $ne: null }, password: 'password123' })
                .expect(400);

            // Unguarded, this matches whichever user comes first and turns login
            // into a guess-any-password attack.
            expect(response.body).not.toHaveProperty('data');
        });

        it('does not let an operator object bypass the duplicate-email check', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({ ...validUser, email: { $ne: null } })
                .expect(400);

            expect(response.body).not.toHaveProperty('data');
            expect(await User.countDocuments()).toBe(1);
        });
    });

    describe('password storage', () => {
        it('leaves the hash out of ordinary queries', async () => {
            await request(app).post('/auth/register').send(validUser).expect(201);

            const user = await User.findOne({ email: validUser.email });

            expect(user).not.toBeNull();
            expect(user?.password).toBeUndefined();
        });

        it('still returns the hash when a caller explicitly asks for it', async () => {
            await request(app).post('/auth/register').send(validUser).expect(201);

            const user = await User.findOne({ email: validUser.email }).select('+password');

            expect(user?.password).toEqual(expect.any(String));
            expect(user?.password).not.toBe(validUser.password);
        });

        it('rejects a password longer than bcrypt can hash', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({ ...validUser, password: 'a'.repeat(73) })
                .expect(400);

            expect(response.body.error.details.password).toEqual([
                'Password must not exceed 72 bytes',
            ]);
        });
    });

    describe('mass assignment', () => {
        it('ignores schema fields the caller was not invited to set', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({ ...validUser, avatar: 'data:image/png;base64,AAAA' })
                .expect(201);

            // avatar is a real model path, so a spread of req.body would have
            // written it. The request schema does not list it, so it is stripped
            // before any handler sees the body.
            expect(response.body.data.user.avatar).toBeUndefined();
        });
    });

    describe('avatar uploads', () => {
        let client: Awaited<ReturnType<typeof signUp>>;

        beforeEach(async () => {
            client = await signUp();
        });

        it('accepts a png data URI', async () => {
            const response = await client.agent
                .patch('/auth/profile')
                .set('X-CSRF-Token', client.csrf)
                .send({ avatar: 'data:image/png;base64,iVBORw0KGgo=' })
                .expect(200);

            expect(response.body.data.user.avatar).toBe('data:image/png;base64,iVBORw0KGgo=');
        });

        it('rejects a payload that is not an image data URI', async () => {
            const response = await client.agent
                .patch('/auth/profile')
                .set('X-CSRF-Token', client.csrf)
                .send({ avatar: 'https://example.com/avatar.png' })
                .expect(400);

            expect(response.body.error.details.avatar).toEqual([
                'Avatar must be a base64 data URI of type png, jpeg or webp',
            ]);
        });

        it('rejects an svg data URI, which can carry script', async () => {
            const response = await client.agent
                .patch('/auth/profile')
                .set('X-CSRF-Token', client.csrf)
                .send({ avatar: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' })
                .expect(400);

            expect(response.body.error.details.avatar[0]).toContain('png, jpeg or webp');
        });
    });
});
