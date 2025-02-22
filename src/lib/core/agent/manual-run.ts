// run this with bun run src/lib/core/agent/manual-run.ts

import { generateAIResponse } from "./workflow";
import type { Role } from "@11labs/client";

const memos = [
    { content: "AIM is nice", name: "AIM_nice", id: "1" },
];

const messages = [
    { message: "AIM is nice", source: "user" as Role },
    { message: "Go ahead...", source: "ai" as Role },
    { message: "I need to create code that gets data from the wikipedia", source: "user" as Role },
];

const response = await generateAIResponse(messages, memos);

console.log("RESPONSE", JSON.stringify(response, null, 2));