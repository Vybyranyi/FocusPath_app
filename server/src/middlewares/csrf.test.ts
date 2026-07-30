import request from 'supertest';
import app from '@app';
import { signUp, validUser } from '../testUtils';

// SameSite already blocks most cross-site writes when the app and API share a
// site. These cases cover the deployment where they do not — where SameSite is
// relaxed to none and the double-submit token becomes the actual defence.

describe('CSRF protection', () => {
    it('refuses a state-changing request from a session that cannot echo the token', async () => {
        const { agent } = await signUp();

        // The cookies ride along, as they would on a cross-site form post; what
        // an attacker's page cannot do is read them to fill in the header.
        const response = await agent
            .patch('/auth/profile')
            .send({ name: 'Hijacked' })
            .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
        expect(response.body.error.message).toBe('CSRF token missing or invalid');
    });

    it('refuses a header that does not match the cookie', async () => {
        const { agent } = await signUp();

        await agent
            .patch('/auth/profile')
            .set('X-CSRF-Token', 'a-value-of-my-own-choosing')
            .send({ name: 'Hijacked' })
            .expect(403);
    });

    it('allows the request when the header matches the cookie', async () => {
        const { agent, csrf } = await signUp();

        const response = await agent
            .patch('/auth/profile')
            .set('X-CSRF-Token', csrf)
            .send({ name: 'Renamed' })
            .expect(200);

        expect(response.body.data.user.name).toBe('Renamed');
    });

    it('leaves reads alone, since they change nothing', async () => {
        const { agent } = await signUp();

        await agent.get('/auth/me').expect(200);
        await agent.get('/habits/').expect(200);
    });

    it('lets sign-in through, where there is no session to ride yet', async () => {
        await request(app).post('/auth/register').send(validUser).expect(201);

        await request(app)
            .post('/auth/login')
            .send({ email: validUser.email, password: validUser.password })
            .expect(200);
    });

    it('protects habit writes too, not only account ones', async () => {
        const { agent } = await signUp();

        await agent
            .post('/habits/')
            .send({
                title: 'Read daily',
                startDate: new Date().toISOString(),
                duration: 5,
                type: 'build',
                color: 'blue',
                icon: 'books',
            })
            .expect(403);
    });
});
