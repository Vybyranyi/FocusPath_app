import { MAX_AVATAR_BYTES, validateAvatar } from '@utils/avatar';

/** Builds a data URI whose decoded payload is `bytes` long. */
const avatarOfSize = (bytes: number, prefix = 'data:image/png;base64,') =>
    prefix + 'A'.repeat(Math.ceil(bytes / 3) * 4);

describe('validateAvatar', () => {
    it.each(['png', 'jpeg', 'webp'])('accepts a %s data URI', type => {
        expect(validateAvatar(`data:image/${type};base64,iVBORw0KGgo=`)).toBeNull();
    });

    it.each([
        ['a plain URL', 'https://example.com/a.png'],
        ['an svg, which can carry script', 'data:image/svg+xml;base64,PHN2Zz4='],
        ['a text payload', 'data:text/html;base64,PHNjcmlwdD4='],
        ['a bare string', 'not-a-data-uri'],
    ])('rejects %s', (_case, value) => {
        expect(validateAvatar(value)).toContain('png, jpeg or webp');
    });

    it.each([
        ['a number', 42],
        ['null', null],
        ['an object', { toString: () => 'data:image/png;base64,AAAA' }],
    ])('rejects %s outright', (_case, value) => {
        expect(validateAvatar(value)).toBe('Avatar must be a base64 data URI string');
    });

    it('rejects a prefix with nothing behind it', () => {
        expect(validateAvatar('data:image/png;base64,')).toBe('Avatar payload is empty');
    });

    it('accepts a payload right at the size ceiling', () => {
        expect(validateAvatar(avatarOfSize(MAX_AVATAR_BYTES - 3))).toBeNull();
    });

    it('rejects a payload past the size ceiling', () => {
        expect(validateAvatar(avatarOfSize(MAX_AVATAR_BYTES + 1024))).toContain(
            'must not exceed',
        );
    });
});
