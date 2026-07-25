/**
 * Avatars arrive as base64 data URIs inside the JSON body. Only these three
 * prefixes are accepted, which also rules out `javascript:` and `text/html`
 * payloads reaching an <img src> on the client.
 */
const ALLOWED_PREFIXES = [
    'data:image/png;base64,',
    'data:image/jpeg;base64,',
    'data:image/webp;base64,',
] as const;

/** Comfortably below the JSON body limit, so a valid avatar always fits. */
export const MAX_AVATAR_BYTES = 1024 * 1024;

/**
 * Returns a message describing the first problem, or null when the avatar is
 * acceptable. Deliberately does no regex matching: the input can be megabytes
 * of attacker-controlled text, and a prefix check plus arithmetic is linear
 * and impossible to backtrack.
 */
export const validateAvatar = (avatar: unknown): string | null => {
    if (typeof avatar !== 'string') {
        return 'Avatar must be a base64 data URI string';
    }

    const prefix = ALLOWED_PREFIXES.find(candidate => avatar.startsWith(candidate));
    if (!prefix) {
        return 'Avatar must be a base64 data URI of type png, jpeg or webp';
    }

    const encodedLength = avatar.length - prefix.length;
    if (encodedLength === 0) {
        return 'Avatar payload is empty';
    }

    const padding = avatar.endsWith('==') ? 2 : avatar.endsWith('=') ? 1 : 0;
    const decodedBytes = Math.floor((encodedLength * 3) / 4) - padding;

    if (decodedBytes > MAX_AVATAR_BYTES) {
        return `Avatar must not exceed ${MAX_AVATAR_BYTES / 1024 / 1024} MB`;
    }

    return null;
};
