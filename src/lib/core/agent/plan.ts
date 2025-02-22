import { generateObject } from "ai";
import { z } from "zod";
import { config } from "./config";
import { Role } from "@11labs/client";
import { Memo } from "../storage";

export const planSchema = z.object({
    files: z.array(z.object({
        purpose: z.string(),
        filePath: z.string(), 
        changeType: z.enum(['create', 'modify', 'delete'])
    })),
    estimatedComplexity: z.enum(['low', 'medium', 'high'])
});

export async function generatePlan(messages: Array<{ message: string; source: Role }>, memos: Memo[]) {
    console.log('Generating implementation plan with', JSON.stringify(memos, null, 2));
    
    const result = await generateObject({
        model: config.openai('o3-mini'),
        schema: planSchema,
        prompt: `Analyze this conversation and plan memo changes:
        
        ## Messages

        ${JSON.stringify(messages)}

        ## Current Memos

         ${JSON.stringify(memos)}`
    });

    console.log('Generated plan:', JSON.stringify(result, null, 2));
    return result;
}
