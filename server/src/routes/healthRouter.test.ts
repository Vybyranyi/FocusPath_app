import mongoose from 'mongoose';
import request from 'supertest';
import app from '@app';

describe('health check', () => {
    it('reports ok while the database is connected', async () => {
        const response = await request(app).get('/healthz').expect(200);

        expect(response.body).toEqual({ success: true, data: { status: 'ok' } });
    });

    it('answers a caller that does not ask for HTML', async () => {
        // The platform's checker sends Accept: */*. If this ever fell through
        // to the SPA fallback it would get a JSON 404, and a healthy deploy
        // would be rolled back.
        const response = await request(app)
            .get('/healthz')
            .set('Accept', '*/*')
            .expect(200);

        expect(response.body.data.status).toBe('ok');
    });

    it('answers HEAD, which is what an uptime monitor typically sends', async () => {
        await request(app).head('/healthz').expect(200);
    });

    it('refuses while the database is unreachable', async () => {
        // readyState is not an own property of the connection, so shadowing it
        // with one and deleting it afterwards restores the original lookup
        // exactly — jest.spyOn cannot reach it and would tear down the shared
        // connection the rest of the suite depends on.
        Object.defineProperty(mongoose.connection, 'readyState', {
            value: 0,
            configurable: true,
        });

        try {
            const response = await request(app).get('/healthz').expect(503);

            // An instance that listens but cannot reach Mongo serves nothing
            // but 500s; keeping it out of rotation is the point.
            expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE');
        } finally {
            delete (mongoose.connection as unknown as Record<string, unknown>).readyState;
        }

        expect(mongoose.connection.readyState).toBe(1);
    });
});
