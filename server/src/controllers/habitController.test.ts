import request from 'supertest';
import app from '@app';

/** Today at midnight UTC — the earliest start date a new habit is allowed. */
const todayUtc = () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
};

const daysFromToday = (days: number) => {
    const date = todayUtc();
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString();
};

const validHabit = () => ({
    title: 'Read daily',
    startDate: daysFromToday(0),
    duration: 5,
    type: 'build',
    color: 'blue',
    icon: 'books',
});

const registerUser = async (email: string): Promise<string> => {
    const response = await request(app)
        .post('/auth/')
        .send({
            name: 'Test',
            surname: 'User',
            birthday: '1990-01-01T00:00:00.000Z',
            gender: 'male',
            email,
            password: 'password123',
        })
        .expect(201);

    return response.body.data.token;
};

const createHabit = async (token: string, overrides: Record<string, unknown> = {}) => {
    const response = await request(app)
        .post('/habits/')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validHabit(), ...overrides })
        .expect(201);

    return response.body.data.habit;
};

describe('Habit Controller', () => {
    let token: string;

    beforeEach(async () => {
        token = await registerUser('owner@example.com');
    });

    describe('POST /habits/', () => {
        it('generates one scheduled day per day of the duration', async () => {
            const habit = await createHabit(token, { duration: 7 });

            expect(habit.dailyCompletions).toHaveLength(7);
            expect(habit.dailyCompletions.every((day: { completed: boolean }) => !day.completed)).toBe(true);
            expect(habit.currentStreak).toBe(0);
        });

        it('never exposes the owner link', async () => {
            const habit = await createHabit(token);

            expect(habit).not.toHaveProperty('userId');
            expect(habit).not.toHaveProperty('__v');
        });

        it('refuses a start date in the past', async () => {
            const response = await request(app)
                .post('/habits/')
                .set('Authorization', `Bearer ${token}`)
                .send({ ...validHabit(), startDate: daysFromToday(-1) })
                .expect(400);

            expect(response.body.error.details.startDate).toEqual([
                'Start date cannot be in the past',
            ]);
        });

        it.each([0, 366, 1.5])('refuses a duration of %s', async duration => {
            const response = await request(app)
                .post('/habits/')
                .set('Authorization', `Bearer ${token}`)
                .send({ ...validHabit(), duration })
                .expect(400);

            expect(response.body.error.details).toHaveProperty('duration');
        });

        it('refuses a type outside the allowed set', async () => {
            const response = await request(app)
                .post('/habits/')
                .set('Authorization', `Bearer ${token}`)
                .send({ ...validHabit(), type: 'sideways' })
                .expect(400);

            expect(response.body.error.details.type).toEqual([
                'Type must be either "build" or "quit"',
            ]);
        });

        it('reports a failure inside a step at its own path', async () => {
            const response = await request(app)
                .post('/habits/')
                .set('Authorization', `Bearer ${token}`)
                .send({ ...validHabit(), steps: [{ title: 'ok' }, { title: '' }] })
                .expect(400);

            // Passed as an array so Jest treats the dots as part of the key
            // rather than as a lookup path into the object.
            expect(response.body.error.details).toHaveProperty(['steps.1.title']);
        });

        it('requires authentication', async () => {
            await request(app).post('/habits/').send(validHabit()).expect(401);
        });
    });

    describe('ownership', () => {
        it('does not let one user read another user\'s habit', async () => {
            const habit = await createHabit(token);
            const otherToken = await registerUser('stranger@example.com');

            await request(app)
                .get(`/habits/${habit._id}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .expect(404);
        });

        it('does not let one user delete another user\'s habit', async () => {
            const habit = await createHabit(token);
            const otherToken = await registerUser('stranger@example.com');

            await request(app)
                .delete(`/habits/${habit._id}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .expect(404);

            await request(app)
                .get(`/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });

        it('lists only the requesting user\'s habits', async () => {
            await createHabit(token);
            const otherToken = await registerUser('stranger@example.com');

            const response = await request(app)
                .get('/habits/')
                .set('Authorization', `Bearer ${otherToken}`)
                .expect(200);

            expect(response.body.data.habits).toEqual([]);
        });
    });

    describe('GET /habits/:id', () => {
        it('refuses an id that is not an ObjectId', async () => {
            const response = await request(app)
                .get('/habits/not-an-id')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);

            expect(response.body.error.details.id).toEqual(['Invalid habit ID']);
        });

        it('reports a well-formed id that matches nothing as not found', async () => {
            await request(app)
                .get('/habits/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });
    });

    describe('GET /habits/daily', () => {
        it('returns the entry for the requested day', async () => {
            await createHabit(token, { duration: 3 });

            const response = await request(app)
                .get(`/habits/daily?date=${daysFromToday(0).slice(0, 10)}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.data.habits).toHaveLength(1);
            expect(response.body.data.habits[0].dayInfo).toMatchObject({ completed: false });
            expect(response.body.data.habits[0].completedCount).toBe(0);
        });

        it('omits habits whose schedule has not started', async () => {
            await createHabit(token, { startDate: daysFromToday(5) });

            const response = await request(app)
                .get(`/habits/daily?date=${daysFromToday(0).slice(0, 10)}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.data.habits).toEqual([]);
        });

        it('refuses a date it cannot parse', async () => {
            const response = await request(app)
                .get('/habits/daily?date=not-a-date')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);

            expect(response.body.error.details).toHaveProperty('date');
        });
    });

    describe('PATCH /habits/:id/complete', () => {
        it('marks a scheduled day and counts it', async () => {
            const habit = await createHabit(token, { duration: 3 });

            const response = await request(app)
                .patch(`/habits/${habit._id}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send({ date: daysFromToday(0), completed: true })
                .expect(200);

            const completed = response.body.data.habit.dailyCompletions.filter(
                (day: { completed: boolean }) => day.completed,
            );
            expect(completed).toHaveLength(1);
        });

        it('refuses a day outside the schedule', async () => {
            const habit = await createHabit(token, { duration: 3 });

            const response = await request(app)
                .patch(`/habits/${habit._id}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send({ date: daysFromToday(30), completed: true })
                .expect(400);

            expect(response.body.error.message).toBe('Date is outside habit duration');
        });

        it('requires the completed flag', async () => {
            const habit = await createHabit(token);

            const response = await request(app)
                .patch(`/habits/${habit._id}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send({ date: daysFromToday(0) })
                .expect(400);

            expect(response.body.error.details).toHaveProperty('completed');
        });

        it('marks the habit complete once every day is done', async () => {
            const habit = await createHabit(token, { duration: 2 });

            for (const offset of [0, 1]) {
                await request(app)
                    .patch(`/habits/${habit._id}/complete`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({ date: daysFromToday(offset), completed: true })
                    .expect(200);
            }

            const response = await request(app)
                .get(`/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.data.habit.isCompleted).toBe(true);
        });
    });

    describe('PATCH /habits/:id/steps/:stepId', () => {
        it('flips a step and reports its new state', async () => {
            const habit = await createHabit(token, {
                steps: [{ title: 'Open the book' }],
            });
            const stepId = habit.steps[0]._id;

            const first = await request(app)
                .patch(`/habits/${habit._id}/steps/${stepId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(first.body.data.completed).toBe(true);

            const second = await request(app)
                .patch(`/habits/${habit._id}/steps/${stepId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(second.body.data.completed).toBe(false);
        });

        it('reports a step that does not belong to the habit as not found', async () => {
            const habit = await createHabit(token);

            await request(app)
                .patch(`/habits/${habit._id}/steps/507f1f77bcf86cd799439011`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });
    });

    describe('DELETE /habits/:id', () => {
        it('removes the habit and returns its id', async () => {
            const habit = await createHabit(token);

            const response = await request(app)
                .delete(`/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.data.habitId).toBe(habit._id);

            await request(app)
                .get(`/habits/${habit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });
    });
});
