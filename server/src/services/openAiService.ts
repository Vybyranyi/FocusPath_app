import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export interface DailyTask {
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
    duration?: number
): Promise<AIHabitResponse> => {
    try {
        const prompt = duration
            ? `Create a ${duration}-day habit plan for "${title}" (type: ${type}).
               Return a JSON object with:
               {
                 "duration": ${duration},
                 "dailyTasks": [
                   {"dayTitle": "Day 1 task description", "completed": false},
                   {"dayTitle": "Day 2 task description", "completed": false},
                   ...
                 ]
               }
               
               Each dayTitle should be a specific, actionable task for that day.
               Create exactly ${duration} daily tasks.
               Return ONLY valid JSON, no additional text.`
            : `Create an optimal habit plan for "${title}" (type: ${type}).
               Determine the best duration (between 21 and 90 days) and create daily tasks.
               Return a JSON object with:
               {
                 "duration": <optimal_duration_number>,
                 "dailyTasks": [
                   {"dayTitle": "Day 1 task description", "completed": false},
                   {"dayTitle": "Day 2 task description", "completed": false},
                   ...
                 ]
               }
               
               Each dayTitle should be a specific, actionable task for that day.
               The number of daily tasks must match the duration.
               Return ONLY valid JSON, no additional text.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a habit formation expert. Create personalized daily tasks for habits.
                             For 'build' type: focus on progressive skill development and positive reinforcement.
                             For 'quit' type: focus on gradual reduction and alternative behaviors.
                             Return ONLY valid JSON without markdown formatting.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error('No response from OpenAI');
        }

        // Parse and validate response
        const response = JSON.parse(content) as AIHabitResponse;

        if (!response.duration || !Array.isArray(response.dailyTasks)) {
            throw new Error('Invalid response format from OpenAI');
        }

        if (response.dailyTasks.length !== response.duration) {
            throw new Error('Duration does not match number of daily tasks');
        }

        return response;
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('Failed to generate habit plan with AI');
    }
};