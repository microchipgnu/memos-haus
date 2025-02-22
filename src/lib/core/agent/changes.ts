import { Role } from "@11labs/client";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { Memo } from "../storage";
import { config } from "./config";
import { planSchema } from "./plan";
import { writeAIM } from "./write-aim";

const memoEvalSchema = z.object({
    qualityScore: z.number(),
    structureValid: z.boolean(),
    contentClear: z.boolean(),
    purposeServed: z.boolean(),
    specificIssues: z.array(z.string()),
    improvementSuggestions: z.array(z.string())
});

export async function generateChanges(plan: z.infer<typeof planSchema>, messages: Array<{ message: string; source: Role }>, memos: Memo[]) {
    console.log('Generating changes for plan:', JSON.stringify(plan, null, 2));
    console.log(memos)

    const systemPrompt = await writeAIM(messages, memos);

    const changes = await Promise.all(plan.files.map(async file => {
        console.log('Processing file:', JSON.stringify(file, null, 2));

        let currentContent = '';
        let iterations = 0;
        const MAX_ITERATIONS = 3;

        // Initial content generation
        const { text: initialContent } = await generateText({
            model: config.openai('o3-mini'),
            system: systemPrompt,
            prompt: `Implement the changes for ${file.filePath} to support:
            ${file.purpose}
            
            Consider the conversation context:
            ${JSON.stringify(messages)}`
        });

        currentContent = initialContent;
        console.log('Generated initial content');

        // Quality improvement loop
        while (iterations < MAX_ITERATIONS) {
            console.log('Starting iteration', JSON.stringify(iterations + 1, null, 2));

            const { object: evaluation } = await generateObject({
                model: config.openai('o3-mini'),
                schema: memoEvalSchema,
                system: systemPrompt,
                prompt: `Evaluate this memo content:
                ${currentContent}
                
                Consider:
                1. Overall quality
                2. AIM format structure
                3. Content clarity
                4. Purpose fulfillment`
            });

            console.log('Content evaluation:', JSON.stringify(evaluation, null, 2));

            if (
                evaluation.qualityScore >= 8 &&
                evaluation.structureValid &&
                evaluation.contentClear &&
                evaluation.purposeServed
            ) {
                console.log('Quality criteria met, breaking loop');
                break;
            }

            const { text: improvedContent } = await generateText({
                model: config.openai('o3-mini'),
                system: systemPrompt,
                prompt: `Improve this memo content based on the following feedback:
                ${evaluation.specificIssues.join('\n')}
                ${evaluation.improvementSuggestions.join('\n')}
                
                Current content:
                ${currentContent}`
            });

            currentContent = improvedContent;
            console.log('Generated improved content');
            iterations++;
        }

        console.log('Finished processing file:', file.filePath);
        return {
            file,
            implementation: {
                explanation: 'Generated with quality feedback loop',
                code: currentContent
            }
        };
    }));

    return changes;
}
