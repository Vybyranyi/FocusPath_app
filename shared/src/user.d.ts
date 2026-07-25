export type Gender = "male" | "female";

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
    createdAt: string;
    updatedAt: string;
}
