import { createOpenAI } from "@ai-sdk/openai";

export const config = {
    openai: createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    }),
}