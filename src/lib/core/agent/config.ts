import { createOpenAI } from "@ai-sdk/openai";

export const providers = {
    openai: createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    }),
}

export const models = {
    o3Mini: providers.openai('o3-mini'),
    gpt4o: providers.openai('gpt-4o'),
}