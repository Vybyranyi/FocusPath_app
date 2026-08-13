import Plan from '@models/Plan';
import { signUp, type Client } from '../testUtils';

jest.mock('@services/moderationService', () => ({
    MODERATION_MODEL: 'test-model',
    reviewPlan: jest.fn(),
}));

import { reviewPlan } from '@services/moderationService';

const mockedReview = reviewPlan as jest.MockedFunction<typeof reviewPlan>;

const todayUtc = () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
};

const dayKey = (offset: number) => {
    const date = todayUtc();
    date.setUTCDate(date.getUTCDate() + offset);
    return date.toISOString().slice(0, 10);
};

const write = (client: Client, method: 'post' | 'put' | 'patch' | 'delete', path: string) =>
    client.agent[method](path).set('X-CSRF-Token', client.csrf);

const createHabit = async (client: Client, overrides: Record<string, unknown> = {}) => {
    const response = await write(client, 'post', '/habits/')
        .send({
            title: 'Read daily',
            startDate: dayKey(0),
            duration: 2,
            type: 'build',
            color: 'blue',
            icon: 'books',
            ...overrides,
        })
        .expect(201);

    return response.body.data.habit;
};

/** A published plan, and the habit it came from. */
const publishPlan = async (client: Client, overrides: Record<string, unknown> = {}) => {
    const habit = await createHabit(client, overrides);
    const response = await write(client, 'post', '/plans')
        .send({ habitId: habit._id, category: 'learning' })
        .expect(201);

    return { habit, plan: response.body.data.plan };
};

const takePlan = async (
    client: Client,
    planId: string,
    body: Record<string, unknown> = {},
) => {
    const response = await write(client, 'post', '/habits/from-plan')
        .send({ planId, startDate: dayKey(0), ...body })
        .expect(201);

    return response.body.data.habit;
};

/** Marks every day of a habit, in schedule order. */
const markAll = async (client: Client, habit: { _id: string; dailyCompletions: Array<{ date: string }> }, status: string) => {
    for (const day of habit.dailyCompletions) {
        await write(client, 'patch', `/habits/${habit._id}/complete`)
            .send({ date: day.date.slice(0, 10), status })
            .expect(200);
    }
};

/** Moves a habit into the past so its last day is behind us. */
const backdate = async (client: Client, habitId: string, startOffset: number) => {
    const response = await write(client, 'put', `/habits/${habitId}`)
        .send({ startDate: dayKey(startOffset) })
        .expect(200);

    return response.body.data.habit;
};

const counters = async (planId: string) => {
    const plan = await Plan.findById(planId);
    return { clones: plan?.cloneCount ?? -1, completed: plan?.completedCloneCount ?? -1, proven: plan?.proven };
};

describe('Taking a plan', () => {
    let author: Client;
    let taker: Client;

    beforeEach(async () => {
        mockedReview.mockResolvedValue({ language: 'en', verdict: 'allow' });
        author = await signUp({ email: 'author@example.com' });
        taker = await signUp({ email: 'taker@example.com' });
    });

    it('copies the plan into a habit of the taker’s own', async () => {
        const { plan } = await publishPlan(author);
        const habit = await takePlan(taker, plan._id);

        expect(habit.title).toBe('Read daily');
        expect(habit.duration).toBe(2);
        expect(habit.dailyCompletions).toHaveLength(2);
        expect(habit.dailyCompletions[0].dayTitle).toBe(plan.days[0].dayTitle);
        expect(habit.fromPlanId).toBe(plan._id);
        expect(habit.dailyCompletions.every((day: { status: string }) => day.status === 'pending')).toBe(true);
    });

    it('starts on the day the taker asked for', async () => {
        const { plan } = await publishPlan(author);
        const habit = await takePlan(taker, plan._id, { startDate: dayKey(3) });

        expect(habit.startDate.slice(0, 10)).toBe(dayKey(3));
    });

    it('counts one take per person, not per habit', async () => {
        const { plan } = await publishPlan(author);

        await takePlan(taker, plan._id);
        expect((await counters(plan._id)).clones).toBe(1);

        // The same plan twice is one person's opinion, not two.
        await takePlan(taker, plan._id);
        expect((await counters(plan._id)).clones).toBe(1);

        const second = await signUp({ email: 'second@example.com' });
        await takePlan(second, plan._id);
        expect((await counters(plan._id)).clones).toBe(2);
    });

    it('refuses a plan that has been withdrawn', async () => {
        const { plan } = await publishPlan(author);
        await write(author, 'delete', `/plans/${plan._id}`).expect(200);

        await write(taker, 'post', '/habits/from-plan')
            .send({ planId: plan._id, startDate: dayKey(0) })
            .expect(404);
    });

    it('refuses a start date in the past', async () => {
        const { plan } = await publishPlan(author);

        const response = await write(taker, 'post', '/habits/from-plan')
            .send({ planId: plan._id, startDate: dayKey(-5) })
            .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
});

describe('Clone statistics', () => {
    let author: Client;
    let taker: Client;

    beforeEach(async () => {
        mockedReview.mockResolvedValue({ language: 'en', verdict: 'allow' });
        author = await signUp({ email: 'author@example.com' });
        taker = await signUp({ email: 'taker@example.com' });
    });

    it('counts a finished clone, and stops counting it if it is undone', async () => {
        const { plan } = await publishPlan(author);
        const habit = await takePlan(taker, plan._id);

        await markAll(taker, habit, 'done');
        expect((await counters(plan._id)).completed).toBe(1);

        await write(taker, 'patch', `/habits/${habit._id}/complete`)
            .send({ date: habit.dailyCompletions[0].date.slice(0, 10), status: 'pending' })
            .expect(200);

        expect((await counters(plan._id)).completed).toBe(0);
    });

    it('excludes a clone whose length was changed', async () => {
        const { plan } = await publishPlan(author);
        const habit = await takePlan(taker, plan._id, { duration: 1 });

        await markAll(taker, habit, 'done');

        // Someone who did one day of a two-day plan did not walk that plan.
        expect((await counters(plan._id)).completed).toBe(0);
        expect((await counters(plan._id)).clones).toBe(1);
    });

    it('drops a finished clone once its days are rewritten', async () => {
        const { plan } = await publishPlan(author);
        const habit = await takePlan(taker, plan._id);

        await markAll(taker, habit, 'done');
        expect((await counters(plan._id)).completed).toBe(1);

        await write(taker, 'patch', `/habits/${habit._id}/day`)
            .send({ date: habit.dailyCompletions[0].date.slice(0, 10), dayTitle: 'My own idea' })
            .expect(200);

        expect((await counters(plan._id)).completed).toBe(0);
    });

    it('counts only the first take of a person who took the plan twice', async () => {
        const { plan } = await publishPlan(author);
        const first = await takePlan(taker, plan._id);
        const second = await takePlan(taker, plan._id);

        await markAll(taker, second, 'done');
        expect((await counters(plan._id)).completed).toBe(0);

        await markAll(taker, first, 'done');
        expect((await counters(plan._id)).completed).toBe(1);
    });
});

describe('The proven badge', () => {
    let author: Client;

    beforeEach(async () => {
        mockedReview.mockResolvedValue({ language: 'en', verdict: 'allow' });
        author = await signUp({ email: 'author@example.com' });
    });

    it('arrives when the source habit finishes past its last day', async () => {
        const { habit, plan } = await publishPlan(author);
        expect(plan.proven).toBe(false);

        const moved = await backdate(author, habit._id, -5);
        await markAll(author, moved, 'done');

        expect((await counters(plan._id)).proven).toBe(true);
    });

    it('stays away while the plan is still running', async () => {
        const { habit, plan } = await publishPlan(author);

        await markAll(author, habit, 'done');

        // Every day is ticked, but the last one is today — the plan is not over.
        expect((await counters(plan._id)).proven).toBe(false);
    });

    it('stays away when the schedule no longer matches what was published', async () => {
        const { habit, plan } = await publishPlan(author);

        await write(author, 'patch', `/habits/${habit._id}/day`)
            .send({ date: dayKey(0), dayTitle: 'Rewritten after publishing' })
            .expect(200);

        const moved = await backdate(author, habit._id, -5);
        await markAll(author, moved, 'done');

        expect((await counters(plan._id)).proven).toBe(false);
    });

    it('is also checked when the author opens their own page', async () => {
        // The first trigger never fires for someone who walked away and marked
        // nothing since; opening the cabinet is the next moment anyone looks.
        const { habit, plan } = await publishPlan(author, { duration: 3 });

        const moved = await backdate(author, habit._id, -10);
        for (const day of moved.dailyCompletions.slice(0, 2)) {
            await write(author, 'patch', `/habits/${habit._id}/complete`)
                .send({ date: day.date.slice(0, 10), status: 'done' })
                .expect(200);
        }

        // Two of three days is 67%, below the threshold.
        expect((await counters(plan._id)).proven).toBe(false);

        await Plan.updateOne({ _id: plan._id }, { $set: { proven: false } });
        await write(author, 'patch', `/habits/${habit._id}/complete`)
            .send({ date: moved.dailyCompletions[2].date.slice(0, 10), status: 'done' })
            .expect(200);
        await Plan.updateOne({ _id: plan._id }, { $set: { proven: false, provenAt: undefined } });

        const response = await author.agent.get('/plans/mine').expect(200);
        expect(response.body.data.plans[0].proven).toBe(true);
    });
});
