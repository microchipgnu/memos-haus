import { createOpenAI } from "@ai-sdk/openai";

export const providers = {
    openai: createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    }),
}

export const models = {
    reasoning: providers.openai('o3-mini'),
    writing: providers.openai('gpt-4o'),
}