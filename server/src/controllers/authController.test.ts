import request from 'supertest';
import app from '@app';
import User from '@models/User';
import mongoose from 'mongoose';
import { cookieValue, hasCookieFlag, signUp, validUser } from '../testUtils';

// The session lives in cookies rather than the response body, so tests drive a
// supertest agent — it keeps a cookie jar the way a browser does — and echo the
// readable CSRF value back in a header on anything that changes state.

describe('Auth Controller', () => {

    describe('POST /auth/register', () => {
        it('creates the account and starts a session', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send(validUser)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(validUser.email);

            const user = await User.findOne({ email: validUser.email });
            expect(user).not.toBeNull();
        });

        it('puts the session in httpOnly cookies and never in the body', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send(validUser)
                .expect(201);

            expect(cookieValue(response, 'access_token')).not.toBe('');
            expect(cookieValue(response, 'refresh_token')).not.toBe('');
            expect(hasCookieFlag(response, 'access_token', 'HttpOnly')).toBe(true);
            expect(hasCookieFlag(response, 'refresh_token', 'HttpOnly')).toBe(true);

            // Nothing a script could pick up and carry off.
            expect(JSON.stringify(response.body)).not.toContain('token');
        });

        it('leaves the CSRF cookie readable, since the client must echo it', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send(validUser)
                .expect(201);

            expect(cookieValue(response, 'csrf_token')).not.toBe('');
            expect(hasCookieFlag(response, 'csrf_token', 'HttpOnly')).toBe(false);
        });

        it('never exposes the password hash or the token version', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send(validUser)
                .expect(201);

            expect(response.body.data.user).not.toHaveProperty('password');
            expect(response.body.data.user).not.toHaveProperty('tokenVersion');
        });

        it('names every missing field at once rather than the first', async () => {
            const { surname, gender, ...incomplete } = validUser;

            const response = await request(app)
                .post('/auth/register')
                .send(incomplete)
                .expect(400);

            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(Object.keys(response.body.error.details).sort()).toEqual(['gender', 'surname']);
        });

        it('accepts an address that arrived with surrounding whitespace', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({ ...validUser, email: `  ${validUser.email}  ` })
                .expect(201);

            expect(response.body.data.user.email).toBe(validUser.email);
        });

        it('rejects an email that is not an address', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({ ...validUser, email: 'not-an-email' })
                .expect(400);

            expect(response.body.error.details.email).toEqual(['Must be a valid email address']);
        });

        it('drops fields the caller was never offered', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({ ...validUser, avatar: 'data:image/png;base64,AAAA', role: 'admin' })
                .expect(201);

            expect(response.body.data.user.avatar).toBeUndefined();
            expect(response.body.data.user.role).toBeUndefined();
        });

        it('refuses a duplicate address', async () => {
            await request(app).post('/auth/register').send(validUser).expect(201);

            const response = await request(app)
                .post('/auth/register')
                .send(validUser)
                .expect(409);

            expect(response.body.error.code).toBe('CONFLICT');
        });

        it('reports a Mongoose validation error field by field', async () => {
            const validationError = new mongoose.Error.ValidationError();
            validationError.errors = {
                name: new mongoose.Error.ValidatorError({
                    message: 'Name is not valid',
                    path: 'name',
                    value: 'Test',
                }),
            };

            jest.spyOn(User, 'create').mockImplementationOnce(() => {
                throw validationError;
            });

            const response = await request(app)
                .post('/auth/register')
                .send(validUser)
                .expect(400);

            expect(response.body.error.details).toEqual({ name: ['Name is not valid'] });
            expect(JSON.stringify(response.body)).not.toContain('ValidatorError');

            jest.restoreAllMocks();
        });

        it('keeps the detail of an unexpected failure out of the response', async () => {
            jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
                throw new Error('Simulated database connection error');
            });

            const response = await request(app)
                .post('/auth/register')
                .send(validUser)
                .expect(500);

            expect(response.body.error.message).toBe('Something went wrong on our side');
            expect(JSON.stringify(response.body)).not.toContain('Simulated database');

            jest.restoreAllMocks();
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/auth/register').send(validUser).expect(201);
        });

        it('starts a session for correct credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({ email: validUser.email, password: validUser.password })
                .expect(200);

            expect(response.body.data.user.email).toBe(validUser.email);
            expect(cookieValue(response, 'access_token')).not.toBe('');
        });

        it('refuses a wrong password without starting one', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({ email: validUser.email, password: 'wrongpassword' })
                .expect(400);

            expect(response.body.error.message).toBe('Invalid credentials');
            expect(cookieValue(response, 'access_token')).toBe('');
        });

        it('reports an unknown address as not found', async () => {
            await request(app)
                .post('/auth/login')
                .send({ email: 'nobody@example.com', password: 'password123' })
                .expect(404);
        });

        it('requires both fields', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({ email: validUser.email })
                .expect(400);

            expect(response.body.error.details.password).toEqual(['Password is required']);
        });
    });

    describe('GET /auth/me', () => {
        it('answers with the signed-in user', async () => {
            const { agent } = await signUp();

            const response = await agent.get('/auth/me').expect(200);

            expect(response.body.data.user.email).toBe(validUser.email);
        });

        it('refuses a caller with no session', async () => {
            const response = await request(app).get('/auth/me').expect(401);

            expect(response.body.error.code).toBe('UNAUTHORIZED');
            expect(response.body.error.message).toBe('Not authenticated');
        });

        it('refuses a forged access cookie', async () => {
            const response = await request(app)
                .get('/auth/me')
                .set('Cookie', 'access_token=not-a-real-token')
                .expect(401);

            expect(response.body.error.message).toBe('Invalid token');
        });

        it('no longer accepts a bearer token', async () => {
            const { agent, csrf } = await signUp();
            const refreshed = await agent
                .post('/auth/refresh')
                .set('X-CSRF-Token', csrf)
                .expect(200);
            const stolen = cookieValue(refreshed, 'access_token');

            // The header route is gone entirely; only the cookie counts.
            await request(app)
                .get('/auth/me')
                .set('Authorization', `Bearer ${stolen}`)
                .expect(401);
        });

        it('reports a valid session whose user has been removed', async () => {
            const { agent } = await signUp();
            await User.deleteOne({ email: validUser.email });

            await agent.get('/auth/me').expect(404);
        });
    });

    describe('POST /auth/refresh', () => {
        it('issues a new session from the refresh cookie', async () => {
            const { agent, csrf } = await signUp();

            const response = await agent
                .post('/auth/refresh')
                .set('X-CSRF-Token', csrf)
                .expect(200);

            expect(response.body.data.user.email).toBe(validUser.email);
            expect(cookieValue(response, 'access_token')).not.toBe('');
        });

        it('rotates the refresh cookie on every use', async () => {
            const { agent, csrf } = await signUp();

            // Each response re-issues the CSRF cookie too, so the value to echo
            // is whatever the previous call handed back.
            const first = await agent.post('/auth/refresh').set('X-CSRF-Token', csrf).expect(200);
            const second = await agent
                .post('/auth/refresh')
                .set('X-CSRF-Token', cookieValue(first, 'csrf_token'))
                .expect(200);

            expect(cookieValue(first, 'refresh_token')).not.toBe('');
            expect(cookieValue(second, 'refresh_token')).not.toBe(
                cookieValue(first, 'refresh_token'),
            );
        });

        it('refuses a caller with no refresh cookie', async () => {
            await request(app).post('/auth/refresh').expect(401);
        });

        it('refuses a refresh token that has already been spent', async () => {
            const { agent, csrf, refreshToken } = await signUp();

            await agent.post('/auth/refresh').set('X-CSRF-Token', csrf).expect(200);

            // Replaying the token the first refresh consumed. Rotation only
            // means something if the old one stops working — otherwise it is
            // just handing out a second valid key.
            const response = await request(app)
                .post('/auth/refresh')
                .set('Cookie', [`refresh_token=${refreshToken}`, 'csrf_token=echo'])
                .set('X-CSRF-Token', 'echo')
                .expect(401);

            expect(response.body.error.message).toBe('Session is no longer valid');
        });

        it('keeps the session usable after the access cookie is dropped', async () => {
            const { agent, csrf } = await signUp();

            // Stands in for the access token expiring: the browser still holds
            // the refresh cookie, which is exactly the case the client renews from.
            await agent.post('/auth/refresh').set('X-CSRF-Token', csrf).expect(200);
            await agent.get('/auth/me').expect(200);
        });
    });

    describe('POST /auth/logout', () => {
        it('clears the session cookies', async () => {
            const { agent, csrf } = await signUp();

            const response = await agent
                .post('/auth/logout')
                .set('X-CSRF-Token', csrf)
                .expect(200);

            expect(cookieValue(response, 'access_token')).toBe('');
            expect(cookieValue(response, 'refresh_token')).toBe('');

            await agent.get('/auth/me').expect(401);
        });

        it('signs out one device without touching the others', async () => {
            const laptop = await signUp();

            const phone = request.agent(app);
            const phoneSession = await phone
                .post('/auth/login')
                .send({ email: validUser.email, password: validUser.password })
                .expect(200);
            const phoneCsrf = cookieValue(phoneSession, 'csrf_token');

            await laptop.agent
                .post('/auth/logout')
                .set('X-CSRF-Token', laptop.csrf)
                .expect(200);

            // Signing out of one place should not evict every other place.
            await phone.post('/auth/refresh').set('X-CSRF-Token', phoneCsrf).expect(200);
        });

        it('revokes the signed-out device even if its cookies are replayed', async () => {
            const { agent, csrf, refreshToken } = await signUp();

            await agent.post('/auth/logout').set('X-CSRF-Token', csrf).expect(200);

            await request(app)
                .post('/auth/refresh')
                .set('Cookie', [`refresh_token=${refreshToken}`, 'csrf_token=echo'])
                .set('X-CSRF-Token', 'echo')
                .expect(401);
        });
    });

    describe('PATCH /auth/password', () => {
        it('changes the password and keeps this session working', async () => {
            const { agent, csrf } = await signUp();

            await agent
                .patch('/auth/password')
                .set('X-CSRF-Token', csrf)
                .send({ currentPassword: validUser.password, newPassword: 'newpassword456' })
                .expect(200);

            // The device that made the change is not thrown out.
            await agent.get('/auth/me').expect(200);

            await request(app)
                .post('/auth/login')
                .send({ email: validUser.email, password: 'newpassword456' })
                .expect(200);
        });

        it('ends every other session', async () => {
            const { agent, csrf } = await signUp();

            // A second device signed in with the same account.
            const other = request.agent(app);
            const otherSession = await other
                .post('/auth/login')
                .send({ email: validUser.email, password: validUser.password })
                .expect(200);
            const otherCsrf = cookieValue(otherSession, 'csrf_token');

            await agent
                .patch('/auth/password')
                .set('X-CSRF-Token', csrf)
                .send({ currentPassword: validUser.password, newPassword: 'newpassword456' })
                .expect(200);

            // Its refresh token no longer matches the account's version, so the
            // moment it needs renewing it is done — rather than staying live for
            // the remaining days of its lifetime.
            await other.post('/auth/refresh').set('X-CSRF-Token', otherCsrf).expect(401);
        });

        it('refuses a wrong current password', async () => {
            const { agent, csrf } = await signUp();

            const response = await agent
                .patch('/auth/password')
                .set('X-CSRF-Token', csrf)
                .send({ currentPassword: 'not-it', newPassword: 'newpassword456' })
                .expect(400);

            expect(response.body.error.message).toBe('Current password is incorrect');
        });
    });

    describe('DELETE /auth/account', () => {
        it('requires the password before destroying anything', async () => {
            const { agent, csrf } = await signUp();

            const response = await agent
                .delete('/auth/account')
                .set('X-CSRF-Token', csrf)
                .send({ password: 'not-it' })
                .expect(400);

            expect(response.body.error.message).toBe('Password is incorrect');
            expect(await User.countDocuments()).toBe(1);
        });

        it('refuses when no password is supplied at all', async () => {
            const { agent, csrf } = await signUp();

            await agent
                .delete('/auth/account')
                .set('X-CSRF-Token', csrf)
                .send({})
                .expect(400);

            expect(await User.countDocuments()).toBe(1);
        });

        it('removes the account once the password checks out', async () => {
            const { agent, csrf } = await signUp();

            const response = await agent
                .delete('/auth/account')
                .set('X-CSRF-Token', csrf)
                .send({ password: validUser.password })
                .expect(200);

            expect(await User.countDocuments()).toBe(0);
            expect(cookieValue(response, 'access_token')).toBe('');
        });
    });
});
