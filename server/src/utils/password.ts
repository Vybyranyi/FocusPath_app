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

export const verifyPassword = (password: string, hash: string): Promise<boolean> =>
    bcrypt.compare(password, hash);
