export type Gender = "male" | "female";

/**
 * What a user is allowed to do beyond their own account.
 *
 * Optional because mongoose fills a default on write, not on read: a document
 * created before the field existed simply has none, and `role === "admin"` is
 * false for it — which is exactly the safe reading.
 */
export type UserRole = "user" | "admin";

/**
 * A user as the API exposes it. The password hash is never part of this shape —
 * the server strips it before serialising.
 */
export interface User {
    _id: string;
    name: string;
    surname: string;
    /** ISO 8601 date string. */
    birthday: string;
    gender: Gender;
    email: string;
    /** Data URI of the uploaded image, absent until the user picks one. */
    avatar?: string;
    role?: UserRole;
    /**
     * The only name a published plan may ever carry, and only if its author
     * turned it on. `name`, `surname`, `email`, `birthday` and `gender` are
     * never public: someone signed up for a habit tracker, not a social
     * network, and "Ivan Petrenko quit smoking" under a real name is medical
     * information about a specific person.
     */
    displayName?: string;
    createdAt: string;
    updatedAt: string;
}
