// Runs as a `setupFiles` entry: before the test framework installs, and before
// any module under test is imported. That ordering matters — several modules
// read process.env at import time, so setting these later would leave them
// holding `undefined`. The database itself is provided per-run by
// mongodb-memory-server in jest.setup.ts, so no MONGO_URI is needed here.

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ||= 'test-jwt-secret-not-used-outside-tests';

// The lowest cost bcrypt accepts. Production uses 12; hashing at that cost in
// every fixture would make the suite several times slower for no added signal.
process.env.BCRYPT_ROUNDS ||= '4';

process.env.CORS_ORIGIN ||= 'http://localhost:5173';
