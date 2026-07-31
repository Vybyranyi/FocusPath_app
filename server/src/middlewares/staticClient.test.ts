import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';
import request from 'supertest';
import { DEFAULT_CLIENT_DIST, clientHandlers } from '@middlewares/staticClient';
import { errorHandler, notFoundHandler } from '@middlewares/errorHandler';

/**
 * Built against a fixture directory rather than the real frontend/dist: that
 * directory exists on a developer's machine after a build and never in CI, and
 * a suite whose result depends on which of those it is would be worthless.
 */
const makeApp = (distDir: string) => {
    const client = clientHandlers(distDir);
    const app = express();

    app.use(client.assets);
    // Stands in for the real API, so the pass-through rules can be checked.
    app.get('/habits', (_req, res) => {
        res.json({ success: true, data: { habits: [] } });
    });
    app.use(client.fallback);
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};

describe('serving the client', () => {
    let distDir: string;
    let app: express.Express;

    beforeAll(() => {
        distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'focuspath-dist-'));
        fs.writeFileSync(path.join(distDir, 'index.html'), '<!doctype html><title>FocusPath</title>');
        fs.mkdirSync(path.join(distDir, 'assets'));
        fs.writeFileSync(path.join(distDir, 'assets', 'index-abc123.js'), 'console.log(1);');

        app = makeApp(distDir);
    });

    afterAll(() => {
        fs.rmSync(distDir, { recursive: true, force: true });
    });

    describe('detecting a build', () => {
        it('reports a build when index.html is there', () => {
            expect(clientHandlers(distDir).hasBuild).toBe(true);
        });

        it('reports none when the directory does not exist', () => {
            expect(clientHandlers(path.join(distDir, 'nope')).hasBuild).toBe(false);
        });

        it('points the default at the frontend package, not into thin air', () => {
            // The relative depth has to hold for both src/middlewares (ts-node,
            // Jest) and dist/middlewares (compiled). An off-by-one here fails
            // silently: hasBuild goes false and every navigation gets a JSON
            // 404 instead of the app, with nothing in the logs to say why.
            const frontendRoot = path.dirname(DEFAULT_CLIENT_DIST);

            expect(path.basename(DEFAULT_CLIENT_DIST)).toBe('dist');
            expect(fs.existsSync(path.join(frontendRoot, 'vite.config.ts'))).toBe(true);
            expect(fs.existsSync(path.join(frontendRoot, 'package.json'))).toBe(true);
        });
    });

    describe('assets', () => {
        it('serves a hashed asset and lets it be cached', async () => {
            const response = await request(app)
                .get('/assets/index-abc123.js')
                .expect(200);

            expect(response.headers['cache-control']).toContain('max-age=31536000');
        });

        it('refuses to let index.html be cached', async () => {
            // It names every other file by content hash, so a cached copy would
            // keep pointing browsers at a bundle the last deploy removed.
            const response = await request(app)
                .get('/index.html')
                .expect(200);

            expect(response.headers['cache-control']).toBe('no-store');
        });
    });

    describe('client-side routes', () => {
        it('answers a browser navigation with the app shell', async () => {
            const response = await request(app)
                .get('/profile')
                .set('Accept', 'text/html,application/xhtml+xml')
                .expect(200);

            expect(response.text).toContain('<title>FocusPath</title>');
            expect(response.headers['cache-control']).toBe('no-store');
        });

        it('does not cache the shell', async () => {
            const response = await request(app)
                .get('/main')
                .set('Accept', 'text/html')
                .expect(200);

            expect(response.headers['cache-control']).toBe('no-store');
        });
    });

    describe('what the fallback must not swallow', () => {
        it('leaves a real API route alone', async () => {
            const response = await request(app)
                .get('/habits')
                .set('Accept', 'text/html')
                .expect(200);

            expect(response.body.data).toEqual({ habits: [] });
        });

        it('lets an unknown API path fail as an API path', async () => {
            // Answering HTML here would reach the client as "unreadable
            // response" rather than the 404 the server meant.
            const response = await request(app)
                .get('/habits/does-not-exist')
                .set('Accept', 'text/html')
                .expect(404);

            expect(response.body.error.code).toBe('NOT_FOUND');
        });

        it('does not treat a lookalike prefix as an API path', async () => {
            const response = await request(app)
                .get('/authentication-guide')
                .set('Accept', 'text/html')
                .expect(200);

            expect(response.text).toContain('FocusPath');
        });

        it('gives a JSON client the error envelope, not the shell', async () => {
            const response = await request(app)
                .get('/not-a-route')
                .set('Accept', 'application/json')
                .expect(404);

            expect(response.body.error.code).toBe('NOT_FOUND');
        });

        it('gives a caller with no Accept header the error envelope', async () => {
            const response = await request(app)
                .get('/not-a-route')
                .expect(404);

            expect(response.body.error.code).toBe('NOT_FOUND');
        });

        it('never answers a non-GET with the shell', async () => {
            const response = await request(app)
                .post('/profile')
                .set('Accept', 'text/html')
                .expect(404);

            expect(response.body.error.code).toBe('NOT_FOUND');
        });
    });
});
