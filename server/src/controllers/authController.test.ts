import request from 'supertest';
import app from '@app';
import User from '@models/User';
import mongoose from 'mongoose';

// Route paths follow authRoutes.ts: registration is POST /auth/, and the token
// is treated as a resource — POST /auth/token to mint one, GET /auth/token to
// validate it. Every response travels in the {success, data} / {success, error}
// envelope, so assertions read through one of those two branches.

const validUser = {
    name: 'Test',
    surname: 'User',
    birthday: '1990-01-01T00:00:00.000Z',
    gender: 'male',
    email: 'testuser@example.com',
    password: 'password123',
};

describe('Auth Controller', () => {

    describe('POST /auth/', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/auth/')
                .send(validUser)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.email).toBe(validUser.email);

            const user = await User.findOne({ email: validUser.email });
            expect(user).not.toBeNull();
            expect(user?.email).toBe(validUser.email);
        });

        it('should not expose the password hash in the response', async () => {
            const response = await request(app)
                .post('/auth/')
                .send(validUser)
                .expect(201);

            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('should return 400 if required fields are missing', async () => {
            const { surname, gender, ...incompleteData } = validUser;

            const response = await request(app)
                .post('/auth/')
                .send(incompleteData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('BAD_REQUEST');
            expect(response.body.error.message).toBe('All fields are required');
        });

        it('should return 409 if user with email already exists', async () => {
            await request(app).post('/auth/').send(validUser).expect(201);

            const response = await request(app)
                .post('/auth/')
                .send(validUser)
                .expect(409);

            expect(response.body.error.code).toBe('CONFLICT');
            expect(response.body.error.message).toBe('User already exists');
        });

        it('should return 400 if password is less than 8 characters', async () => {
            const response = await request(app)
                .post('/auth/')
                .send({ ...validUser, password: 'pass' })
                .expect(400);

            expect(response.body.error.message).toBe('Password must be at least 8 characters long');
        });

        it('should report a Mongoose validation error field by field', async () => {
            const mockValidationError = new mongoose.Error.ValidationError();
            mockValidationError.errors = {
                gender: new mongoose.Error.ValidatorError({
                    message: 'Gender is not valid',
                    path: 'gender',
                    value: 'invalid',
                }),
            };

            jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => {
                throw mockValidationError;
            });

            const response = await request(app)
                .post('/auth/')
                .send({ ...validUser, gender: 'invalid' })
                .expect(400);

            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            // Only the messages travel — not Mongoose's internal validator state.
            expect(response.body.error.details).toEqual({ gender: ['Gender is not valid'] });

            jest.restoreAllMocks();
        });

        it('should keep the detail of an unexpected failure out of the response', async () => {
            jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
                throw new Error('Simulated database connection error');
            });

            const response = await request(app)
                .post('/auth/')
                .send(validUser)
                .expect(500);

            expect(response.body.error.code).toBe('INTERNAL_ERROR');
            expect(response.body.error.message).toBe('Something went wrong on our side');
            expect(JSON.stringify(response.body)).not.toContain('Simulated database');

            jest.restoreAllMocks();
        });
    });

    describe('POST /auth/token', () => {
        it('should return 200 if logged in successfully', async () => {
            await request(app).post('/auth/').send(validUser).expect(201);

            const response = await request(app)
                .post('/auth/token')
                .send({ email: validUser.email, password: validUser.password })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.email).toBe(validUser.email);
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        it('should return 400 if email or password is missing', async () => {
            const response = await request(app)
                .post('/auth/token')
                .send({ email: validUser.email })
                .expect(400);

            expect(response.body.error.message).toBe('Email and password are required');
        });

        it('should return 404 if user not found', async () => {
            const response = await request(app)
                .post('/auth/token')
                .send({ email: 'nonexistent@example.com', password: 'password123' })
                .expect(404);

            expect(response.body.error.code).toBe('NOT_FOUND');
            expect(response.body.error.message).toBe('User not found');
        });

        it('should return 400 if password is invalid', async () => {
            await request(app).post('/auth/').send(validUser).expect(201);

            const response = await request(app)
                .post('/auth/token')
                .send({ email: validUser.email, password: 'wrongpassword' })
                .expect(400);

            expect(response.body.error.message).toBe('Invalid credentials');
        });

        it('should keep the detail of an unexpected failure out of the response', async () => {
            jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
                throw new Error('Simulated database find error');
            });

            const response = await request(app)
                .post('/auth/token')
                .send({ email: 'anyuser@example.com', password: 'anypassword' })
                .expect(500);

            expect(response.body.error.message).toBe('Something went wrong on our side');

            jest.restoreAllMocks();
        });
    });

    describe('GET /auth/token', () => {
        let token: string;

        beforeEach(async () => {
            const res = await request(app)
                .post('/auth/')
                .send(validUser)
                .expect(201);

            token = res.body.data.token;
        });

        it('should return 200 if token is valid', async () => {
            const response = await request(app)
                .get('/auth/token')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(validUser.email);
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/auth/token')
                .expect(401);

            expect(response.body.error.code).toBe('UNAUTHORIZED');
            expect(response.body.error.message).toBe('No token provided');
        });

        it('should return 401 if the Authorization header is not a bearer token', async () => {
            const response = await request(app)
                .get('/auth/token')
                .set('Authorization', token)
                .expect(401);

            expect(response.body.error.message).toBe('No token provided');
        });

        it('should return 401 if token is invalid', async () => {
            const response = await request(app)
                .get('/auth/token')
                .set('Authorization', 'Bearer invalidtoken123')
                .expect(401);

            expect(response.body.error.message).toBe('Invalid token');
        });

        it('should return 404 if the user behind a valid token is gone', async () => {
            await User.deleteOne({ email: validUser.email });

            const response = await request(app)
                .get('/auth/token')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);

            expect(response.body.error.message).toBe('User not found');
        });

        it('should keep the detail of an unexpected failure out of the response', async () => {
            jest.spyOn(User, 'findById').mockImplementationOnce(() => {
                throw new Error('Simulated DB error');
            });

            const response = await request(app)
                .get('/auth/token')
                .set('Authorization', `Bearer ${token}`)
                .expect(500);

            expect(response.body.error.message).toBe('Something went wrong on our side');

            jest.restoreAllMocks();
        });
    });

});
