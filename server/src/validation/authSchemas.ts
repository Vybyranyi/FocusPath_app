import { z } from 'zod';
import { MAX_PASSWORD_BYTES, MIN_PASSWORD_LENGTH } from '@utils/password';
import { validateAvatar } from '@utils/avatar';

/**
 * Requiring a string here is what actually closes NoSQL injection: an operator
 * object such as {"$ne": null} fails the type check long before it can reach a
 * query. sanitizeFilter remains as a second line, not the first.
 */
// Trimmed before the format check, not after: z.email().trim() would reject a
// perfectly good address that arrived with a trailing space, and no form on the
// client trims for us.
const email = z.string().trim().pipe(z.email('Must be a valid email address'));

const password = z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
    .refine(
        value => Buffer.byteLength(value, 'utf8') <= MAX_PASSWORD_BYTES,
        // bcrypt discards anything past this, which would make two different
        // long passwords authenticate one another.
        `Password must not exceed ${MAX_PASSWORD_BYTES} bytes`,
    );

const name = z.string().trim().min(1, 'Required').max(50, 'Must be 50 characters or fewer');

/** Reuses the size and MIME rules so there is one definition of a valid avatar. */
const avatar = z.string().superRefine((value, ctx) => {
    const problem = validateAvatar(value);
    if (problem) {
        ctx.addIssue({ code: 'custom', message: problem });
    }
});

export const registerSchema = z.object({
    name,
    surname: name,
    birthday: z.coerce.date('Must be a valid date'),
    gender: z.enum(['male', 'female']),
    email,
    password,
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    // Deliberately not the strict email format: an existing account should get
    // "invalid credentials", not a lecture about its address.
    email: z.string('Email is required').trim().min(1, 'Email is required'),
    password: z.string('Password is required').min(1, 'Password is required'),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const updateProfileSchema = z
    .object({
        name: name.optional(),
        surname: name.optional(),
        birthday: z.coerce.date('Must be a valid date').optional(),
        gender: z.enum(['male', 'female']).optional(),
        email: email.optional(),
        avatar: avatar.optional(),
    })
    .refine(
        body => Object.values(body).some(value => value !== undefined),
        'Provide at least one field to update',
    );
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
    currentPassword: z.string('Current password is required').min(1, 'Current password is required'),
    newPassword: password,
});
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
