import OpenAI from 'openai';

let client: OpenAI | null = null;

/**
 * Built on first use, never at import time. Constructing eagerly throws whenever
 * OPENAI_API_KEY is absent, which takes down the whole server — and the test
 * suite with it — over a key only this path and habit generation need.
 */
const getClient = (): OpenAI => {
    if (!client) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI is not configured: OPENAI_API_KEY is missing');
        }
        client = new OpenAI({ apiKey });
    }
    return client;
};

export const MODERATION_MODEL = 'gpt-4o-mini';

export interface ModerationVerdict {
    /** ISO 639-1 tag for the language the plan is written in. */
    language: string;
    verdict: 'allow' | 'reject';
    /** Present when rejected: short enough to show the author verbatim. */
    reason?: string;
}

export interface PlanForReview {
    title: string;
    description: string;
    dayTitles: readonly string[];
}

const SYSTEM_PROMPT = `You review user-submitted habit plans for a public library and detect their language.

Return ONLY valid JSON, no markdown, of exactly this shape:
{"language": "<ISO 639-1 code>", "verdict": "allow" | "reject", "reason": "<short explanation, only when rejecting>"}

Reject a plan when it contains:
- content that could damage health: extreme fasting, dangerous doses, anything organised around disordered eating or self-harm
- spam, advertising, or links
- insults, harassment, or hate
- meaningless strings that are not a plan at all

Allow anything else, including ordinary ambitious plans. The reason is shown to the
author verbatim, so keep it to one plain sentence and make it actionable.

The language code describes the language the plan is written in, not the language
of this instruction.`;

const LANGUAGE_PATTERN = /^[a-z]{2}$/;

/**
 * Reviews a plan and detects its language in a single call.
 *
 * One request rather than two on purpose: the model is already reading the whole
 * plan for the safety verdict, and the language tag falls out of the same read.
 *
 * Throws on anything unexpected — an unset key, a network failure, a reply that
 * does not parse. The caller turns that into a refusal to publish, because this
 * gate is fail-closed: publishing is not urgent, unlike habit generation, and an
 * unreviewed plan in a public library is the one outcome worth avoiding.
 */
export const reviewPlan = async ({
    title,
    description,
    dayTitles,
}: PlanForReview): Promise<ModerationVerdict> => {
    const completion = await getClient().chat.completions.create({
        model: MODERATION_MODEL,
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
                role: 'user',
                content: JSON.stringify({ title, description, days: dayTitles }),
            },
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error('Moderation returned an empty response');
    }

    const parsed = JSON.parse(content) as Partial<ModerationVerdict>;

    if (parsed.verdict !== 'allow' && parsed.verdict !== 'reject') {
        throw new Error('Moderation returned no usable verdict');
    }

    // A malformed tag is not worth failing a publication over, but it must not
    // reach the database either — a filter over free-form language strings is
    // exactly the mess the fixed category list exists to avoid.
    const language =
        typeof parsed.language === 'string' && LANGUAGE_PATTERN.test(parsed.language.toLowerCase())
            ? parsed.language.toLowerCase()
            : 'en';

    return {
        language,
        verdict: parsed.verdict,
        reason: typeof parsed.reason === 'string' ? parsed.reason.slice(0, 300) : undefined,
    };
};
