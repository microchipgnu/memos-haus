import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

import dotenv from 'dotenv';

dotenv.config();

export const providers = {
    openai: createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    }),
    anthropic: createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    }),
}

export const models = {
    reasoning: providers.openai('o3-mini'),
    writing: providers.openai('gpt-4o'),
    writingClaude: providers.anthropic('claude-3-7-sonnet-20250219'),
}