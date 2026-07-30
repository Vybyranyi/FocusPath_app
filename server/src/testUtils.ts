import request from 'supertest';
import type { Response } from 'supertest';
import app from '@app';

export const validUser = {
    name: 'Test',
    surname: 'User',
    birthday: '1990-01-01T00:00:00.000Z',
    gender: 'male',
    email: 'owner@example.com',
    password: 'password123',
};

/** Reads a cookie the response set, or an empty string if it set none. */
export const cookieValue = (response: Response, name: string): string => {
    const header = response.headers['set-cookie'];
    const cookies: string[] = Array.isArray(header) ? header : header ? [header] : [];
    const match = cookies.find(cookie => cookie.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.split(';')[0].split('=').slice(1).join('=')) : '';
};

export const hasCookieFlag = (response: Response, name: string, flag: string): boolean => {
    const header = response.headers['set-cookie'];
    const cookies: string[] = Array.isArray(header) ? header : header ? [header] : [];
    const match = cookies.find(cookie => cookie.startsWith(`${name}=`));
    return Boolean(match?.toLowerCase().includes(flag.toLowerCase()));
};

/**
 * A signed-in caller.
 *
 * The agent keeps the session cookies the way a browser would, and `csrf` is
 * the value that has to be echoed back in a header on anything that changes
 * state — so tests exercise the same double-submit the real client does.
 */
export interface Client {
    agent: ReturnType<typeof request.agent>;
    csrf: string;
    userId: string;
    /** The refresh token as first issued, so a test can try to replay it. */
    refreshToken: string;
}

export const signUp = async (
    overrides: Partial<typeof validUser> = {},
): Promise<Client> => {
    const agent = request.agent(app);
    const response = await agent
        .post('/auth/register')
        .send({ ...validUser, ...overrides })
        .expect(201);

    return {
        agent,
        csrf: cookieValue(response, 'csrf_token'),
        userId: response.body.data.user._id,
        refreshToken: cookieValue(response, 'refresh_token'),
    };
};
