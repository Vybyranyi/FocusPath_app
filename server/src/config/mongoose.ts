import mongoose from 'mongoose';

/**
 * Wraps filter values in $eq, so an operator object arriving as JSON cannot
 * change what a query means. Without it, `User.findOne({ email })` with a body
 * of {"email": {"$ne": null}} matches whatever user happens to come first
 * instead of matching nothing.
 *
 * Applied at import rather than inside connectDB because the test suite opens
 * its own connection and must not be left unprotected.
 */
mongoose.set('sanitizeFilter', true);
