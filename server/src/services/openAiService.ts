import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

interface DailyTask {
    dayTitle: string;
    date?: Date;
    completed: boolean;
}

interface AIHabitResponse {
    duration: number;
    dailyTasks: DailyTask[];
}

export const generateHabitPlan = async (
    title: string,
    type: 'build' | 'quit',
    duration?: number,
    retryCount: number = 0
): Promise<AIHabitResponse> => {
    const MAX_RETRIES = 2;

    try {
        const prompt = duration
            ? `You must create EXACTLY ${duration} daily tasks for the habit "${title}" (type: ${type}).

CRITICAL REQUIREMENT: The array MUST contain exactly ${duration} items.

Return a JSON object:
{
  "duration": ${duration},
  "dailyTasks": [
    {"dayTitle": "Specific task for day 1", "completed": false},
    {"dayTitle": "Specific task for day 2", "completed": false},
    ... continue until you have ${duration} tasks total
  ]
}

Rules:
- For "build" type: Progressive skill development, start easy and gradually increase difficulty
- For "quit" type: Gradual reduction strategies and healthy alternatives
- Each dayTitle must be specific and actionable (e.g., "Practice 10 Spanish verbs" not "Study Spanish")
- Number each task implicitly through progression, not explicitly in text
- VERIFY: Your dailyTasks array length MUST equal ${duration}`
            : `Create an optimal habit plan for "${title}" (type: ${type}).

Choose the best duration between 21 and 90 days based on habit complexity.

Return a JSON object:
{
  "duration": <your_chosen_number>,
  "dailyTasks": [
    {"dayTitle": "Specific task for day 1", "completed": false},
    {"dayTitle": "Specific task for day 2", "completed": false},
    ... continue until you have <your_chosen_number> tasks total
  ]
}

Rules:
- For "build" type: Progressive skill development
- For "quit" type: Gradual reduction and alternatives
- Each dayTitle must be specific and actionable
- CRITICAL: dailyTasks array length MUST EXACTLY match the duration number you choose`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a habit formation expert who creates personalized daily task plans.

CRITICAL RULES:
1. The dailyTasks array length MUST EXACTLY match the duration number
2. Return ONLY valid JSON, no markdown, no explanations
3. For 'build' habits: Focus on progressive skill building
4. For 'quit' habits: Focus on gradual reduction and replacement behaviors
5. Make each task specific and achievable

Double-check your response before returning it.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: duration ? Math.min(4000, duration * 50) : 4000,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error('No response from OpenAI');
        }

        console.log('OpenAI raw response:', content);

        // Parse and validate response
        const response = JSON.parse(content) as AIHabitResponse;

        if (!response.duration || !Array.isArray(response.dailyTasks)) {
            throw new Error('Invalid response format from OpenAI');
        }

        // Validate that each task has required fields
        const invalidTasks = response.dailyTasks.filter(
            task => !task.dayTitle || typeof task.completed !== 'boolean'
        );

        if (invalidTasks.length > 0) {
            throw new Error('Some tasks are missing required fields');
        }

        // CRITICAL: Check if lengths match
        if (response.dailyTasks.length !== response.duration) {
            console.error('Duration mismatch:', {
                expected: response.duration,
                received: response.dailyTasks.length,
                tasks: response.dailyTasks
            });

            // Try to fix the mismatch
            if (response.dailyTasks.length < response.duration) {
                // AI returned too few tasks - pad with generic tasks
                const remaining = response.duration - response.dailyTasks.length;
                for (let i = 0; i < remaining; i++) {
                    response.dailyTasks.push({
                        dayTitle: `Continue working on: ${response.dailyTasks[response.dailyTasks.length - 1]?.dayTitle || 'your habit'}`,
                        completed: false
                    });
                }
            } else {
                // AI returned too many tasks - trim to duration
                response.dailyTasks = response.dailyTasks.slice(0, response.duration);
            }
        }

        return response;
    } catch (error) {
        console.error('OpenAI API error:', error);

        // Retry logic if duration mismatch occurred
        if (retryCount < MAX_RETRIES && error instanceof Error) {
            if (error.message.includes('Duration') || error.message.includes('parse')) {
                console.log(`Retrying AI request (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                return generateHabitPlan(title, type, duration, retryCount + 1);
            }
        }

        throw new Error('Failed to generate habit plan with AI');
    }
};