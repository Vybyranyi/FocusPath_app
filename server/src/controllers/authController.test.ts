import request from 'supertest';
import app from '@app';
import User from '@models/User';
import mongoose from 'mongoose';

describe('Auth Controller', () => {

    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                name: 'Test',
                surname: 'User',
                birthday: '1990-01-01T00:00:00.000Z',
                gender: 'male',
                email: 'testuser@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.message).toBe('User registered successfully');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(userData.email);

            const user = await User.findOne({ email: userData.email });
            expect(user).toBeDefined();
            expect(user?.email).toBe(userData.email);
        });

        it('should return 400 if required fields are missing', async () => {
            const incompleteData = {
                name: 'Test',
                birthday: '1990-01-01T00:00:00.000Z',
                email: 'testuser@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(incompleteData)
                .expect(400);

            expect(response.body.message).toBe('All fields are required');
        });

        it('should return 400 if user with email already exists', async () => {
            const userData = {
                name: 'Existing',
                surname: 'User',
                birthday: '1990-01-01T00:00:00.000Z',
                gender: 'male',
                email: 'existinguser@example.com',
                password: 'password123'
            };

            await request(app)
                .post('/auth/register')
                .send(userData);

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.message).toBe('User already exists');
        });

        it('should return 400 if password is less than 8 characters', async () => {
            const userData = {
                name: 'Test',
                surname: 'User',
                birthday: '1990-01-01T00:00:00.000Z',
                gender: 'male',
                email: 'testuser@example.com',
                password: 'pass'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.message).toBe('Password must be at least 8 characters long');
        });

        it('should register a new user successfully', async () => {
            const userData = {
                name: 'Test',
                surname: 'User',
                birthday: '1990-01-01T00:00:00.000Z',
                gender: 'male',
                email: 'testuser@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.message).toBe('User registered successfully');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(userData.email);

            const user = await User.findOne({ email: userData.email });
            expect(user).toBeDefined();
            expect(user?.email).toBe(userData.email);
        });

        it('should return 400 if required fields are missing', async () => {
            const incompleteData = {
                name: 'Test',
                birthday: '1990-01-01T00:00:00.000Z',
                email: 'testuser@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(incompleteData)
                .expect(400);

            expect(response.body.message).toBe('All fields are required');
        });

        it('should return 400 if user with email already exists', async () => {
            const userData = {
                name: 'Existing',
                surname: 'User',
                birthday: '1990-01-01T00:00:00.000Z',
                gender: 'male',
                email: 'existinguser@example.com',
                password: 'password123'
            };

            await request(app)
                .post('/auth/register')
                .send(userData);

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.message).toBe('User already exists');
        });

        it('should return 400 if password is less than 8 characters', async () => {
            const userData = {
                name: 'Test',
                surname: 'User',
                birthday: '1990-01-01T00:00:00.000Z',
                gender: 'male',
                email: 'testuser@example.com',
                password: 'pass'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.message).toBe('Password must be at least 8 characters long');
        });

        it('should return 400 for a Mongoose validation error', async () => {
            const mockValidationError = new mongoose.Error.ValidationError();
            mockValidationError.errors = {
                gender: new mongoose.Error.ValidatorError({
                    message: 'Gender is not valid',
                    path: 'gender',
                    value: 'invalid'
                })
            };

            jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => {
                throw mockValidationError;
            });

            const userData = {
                name: 'Test',
                surname: 'User',
                birthday: '1990-01-01T00:00:00.000Z',
                gender: 'invalid',
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.message).toBe('Validation error');
            expect(response.body).toHaveProperty('errors');

            jest.restoreAllMocks();
        });

        it('should return 500 for a general server error', async () => {
            jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
                throw new Error('Simulated database connection error');
            });

            const userData = {
                name: 'Error',
                surname: 'User',
                birthday: '1990-01-01T00:00:00.000Z',
                gender: 'male',
                email: 'erroruser@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
                .expect(500);

            expect(response.body.message).toBe('Server error during registration');

            jest.restoreAllMocks();
        });
    });

    describe('POST /auth/login', () => {
        const RegisterData = {
            name: 'Test',
            surname: 'User',
            birthday: '1990-01-01T00:00:00.000Z',
            gender: 'male',
            email: 'testuser@example.com',
            password: 'password123'
        };

        it('should return 200 if logined successfully', async () => {
            await request(app)
                .post('/auth/register')
                .send(RegisterData)
                .expect(201);

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: RegisterData.email,
                    password: RegisterData.password
                })
                .expect(200);


            expect(response.body.message).toBe('Login successful');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(RegisterData.email);

            const user = await User.findOne({ email: RegisterData.email });
            expect(user).toBeDefined();
            expect(user?.email).toBe(RegisterData.email);
        });

        it('should return 400 if email or password is missing', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: RegisterData.email,
                })
                .expect(400);

            expect(response.body.message).toBe('Email and password are required');
        });

        it('should return 404 if user not found', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                })
                .expect(404);

            expect(response.body.message).toBe('User not found');
        });

        it('should return 400 if password is invalid', async () => {
            await request(app)
                .post('/auth/register')
                .send(RegisterData)
                .expect(201);

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: RegisterData.email,
                    password: 'wrongpassword'
                })
                .expect(400);

            expect(response.body.message).toBe('Invalid credentials');
        });

        it('should return 500 for a server error', async () => {
            jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
                throw new Error('Simulated database find error');
            });

            const userData = {
                email: 'anyuser@example.com',
                password: 'anypassword'
            };

            const response = await request(app)
                .post('/auth/login')
                .send(userData)
                .expect(500);

            expect(response.body.message).toBe('Server error during login');

            jest.restoreAllMocks();
        });
    });

    describe('GET /auth/verify-token', () => {
        const RegisterData = {
            name: 'Verify',
            surname: 'User',
            birthday: '1990-01-01T00:00:00.000Z',
            gender: 'male',
            email: 'verifyuser@example.com',
            password: 'password123'
        };

        let token: string;

        beforeEach(async () => {
            const res = await request(app)
                .post('/auth/register')
                .send(RegisterData)
                .expect(201);

            token = res.body.token;
        });

        it('should return 200 if token is valid', async () => {
            const response = await request(app)
                .get('/auth/verify-token')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.message).toBe('Token is valid');
            expect(response.body.user.email).toBe(RegisterData.email);
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/auth/verify-token')
                .expect(401);

            expect(response.body.message).toBe('No token provided');
        });

        it('should return 401 if token is invalid', async () => {
            const response = await request(app)
                .get('/auth/verify-token')
                .set('Authorization', 'Bearer invalidtoken123')
                .expect(401);

            expect(response.body.message).toBe('Invalid token');
        });

        it('should return 404 if user not found', async () => {
            // створюємо юзера і беремо токен
            const res = await request(app)
                .post('/auth/register')
                .send({
                    ...RegisterData,
                    email: 'deleted@example.com'
                })
                .expect(201);

            const tempToken = res.body.token;

            // видаляємо користувача з БД
            await User.deleteOne({ email: 'deleted@example.com' });

            const response = await request(app)
                .get('/auth/verify-token')
                .set('Authorization', `Bearer ${tempToken}`)
                .expect(404);

            expect(response.body.message).toBe('User not found');
        });

        it('should return 500 if database throws error', async () => {
            jest.spyOn(User, 'findById').mockImplementationOnce(() => {
                throw new Error('Simulated DB error');
            });

            const response = await request(app)
                .get('/auth/verify-token')
                .set('Authorization', `Bearer ${token}`)
                .expect(500);

            expect(response.body.message).toBe('Server error during token verification');

            jest.restoreAllMocks();
        });
    });

});
