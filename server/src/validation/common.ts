import mongoose from 'mongoose';
import { z } from 'zod';

/**
 * An id that Mongo will actually accept.
 *
 * Requiring a string is what closes NoSQL injection here: an operator object
 * like `{"$ne": null}` fails the type check long before it can reach a query.
 * The label goes into the message, so a failure names which id was wrong.
 */
export const objectId = (label: string) =>
    z.string().refine(value => mongoose.Types.ObjectId.isValid(value), `Invalid ${label}`);
