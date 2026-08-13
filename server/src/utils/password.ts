import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

export const MIN_PASSWORD_LENGTH = 8;

/**
 * bcrypt hashes at most 72 bytes and silently discards everything after that,
 * which would let two different long passwords authenticate one another.
 * Rejecting is the only honest option.
 */
export const MAX_PASSWORD_BYTES = 72;

/**
 * Read once at import. Tests lower it so the suite is not dominated by key
 * derivation; anything else gets a cost that is actually worth paying.
 */
const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

/** Returns a message describing the first problem, or null when the password is acceptable. */
export const validatePassword = (password: unknown): string | null => {
    if (typeof password !== 'string') {
        return 'Password must be a string';
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
    }
    if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
        return `Password must not exceed ${MAX_PASSWORD_BYTES} bytes`;
    }
    return null;
};

export const hashPassword = (password: string): Promise<string> =>
    bcrypt.hash(password, rounds);

let placeholder: Promise<string> | null = null;

/**
 * A hash nothing can match, for spending the same time on a sign-in attempt for
 * an address that has no account as on one that does.
 *
 * Without it the miss returns before bcrypt ever runs, and the gap — single
 * milliseconds against hundreds of them at cost 12 — answers "does this address
 * have an account here?" just as plainly as a distinct status code would, and
 * survives making the two replies identical.
 *
 * Derived from random bytes, so no input verifies against it, and at the
 * configured cost, so the comparison takes exactly as long as a real one. Built
 * on first use rather than at import: a process that never sees a miss should
 * not pay for it, and the promise is cached rather than the string so two
 * concurrent misses derive it once.
 */
export const placeholderHash = (): Promise<string> =>
    (placeholder ??= bcrypt.hash(randomBytes(32).toString('hex'), rounds));

export const verifyPassword = (password: string, hash: string): Promise<boolean> =>
    bcrypt.compare(password, hash);
