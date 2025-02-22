import { generateObject } from "ai";
import { z } from "zod";
import { Role } from "@11labs/client";
import { Memo } from "../storage";
import { writeAIM } from "./write-aim";
import { models } from "./config";

export const planSchema = z.object({
    files: z.array(z.object({
        purpose: z.string().describe('The purpose of the file'),
        filePath: z.string().describe('The path to the file'), 
        changeType: z.enum(['create', 'modify', 'delete']).describe('The type of change to make to the file')
    })),
    estimatedComplexity: z.enum(['low', 'medium', 'high']).describe('The estimated complexity of the changes')
});

export async function generatePlan(messages: Array<{ message: string; source: Role }>, memos: Memo[]) {
    console.log('Generating implementation plan with', JSON.stringify(memos, null, 2));
    
    const systemPrompt = await writeAIM(messages, memos);

    const result = await generateObject({
        model: models.reasoning,
        schema: planSchema,
        system: systemPrompt,
        prompt: `Analyze this conversation and plan memo changes or new files to create:
        
        ## Messages

        ${JSON.stringify(messages)}

        ## Current Memos

         ${JSON.stringify(memos)}
         
         ---

         ALWAYS return a plan with AT LEAST one file to modify, create, or delete. DO NOT include any other text or questions.
         `
    });

    console.log('Generated plan:', JSON.stringify(result, null, 2));
    return result;
}
