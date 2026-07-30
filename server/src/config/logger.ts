import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export const logger = pino({
    // Silent under test so a suite that deliberately provokes failures does not
    // bury its own output in stack traces.
    level: process.env.LOG_LEVEL ?? (isTest ? 'silent' : 'info'),

    // Credentials must never reach a log file, however the object was shaped
    // when it got here.
    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers["set-cookie"]',
            '*.password',
            '*.currentPassword',
            '*.newPassword',
            '*.token',
            'password',
            'token',
        ],
        censor: '[redacted]',
    },

    // Human-readable while developing; newline-delimited JSON in production,
    // where something else is doing the parsing.
    transport: isProduction || isTest
        ? undefined
        : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } },
});
