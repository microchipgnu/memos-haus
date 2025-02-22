import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@11labs/react';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { Memo } from '@/lib/core/storage';

// Extend timeout for long-running operations
export const maxDuration = 300; // 5 minutes in seconds


console.log('Initializing schemas and types');

// Schema for the AI response
// const responseSchema = z.object({
//     files: z.array(z.object({
//         id: z.string(),
//         name: z.string(),
//         content: z.string()
//     }))
// });

// Schema for the implementation plan
const planSchema = z.object({
    files: z.array(z.object({
        purpose: z.string(),
        filePath: z.string(), 
        changeType: z.enum(['create', 'modify', 'delete'])
    })),
    estimatedComplexity: z.enum(['low', 'medium', 'high'])
});

// Schema for file changes
// const changeSchema = z.object({
//     explanation: z.string(),
//     code: z.string()
// });

// Schema for memo quality evaluation
const memoEvalSchema = z.object({
    qualityScore: z.number(),
    structureValid: z.boolean(),
    contentClear: z.boolean(),
    purposeServed: z.boolean(),
    specificIssues: z.array(z.string()),
    improvementSuggestions: z.array(z.string())
});

// Get system prompt for the AI
// async function getSystemPrompt(messages: Array<{ message: string; source: Role }>, memos: Memo[]) {
//     console.log('Getting system prompt with messages:', messages.length, 'and memos:', memos.length);
//     
//     const llmsList = await (await fetch(new URL('/aim_llms.txt', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'))).text();
//     console.log('Fetched LLMs list:', llmsList);
//
//     const prompt = `
//     You are an AI assistant that helps manage memos by converting chat history into a markdown program (AIM) or responding in markdown when no memo is needed.
//     
//     ### Primary Functions:
//     **Creating and Updating Memos:**
//        - Analyze the conversation history to identify content worth saving as a memo (e.g., instructions, reusable info).
//        - Extract key info and generate a clear, descriptive name (e.g., "installing_package_x").
//        - Structure the memo in AIM markdown format with a title, description, and content (use headers, lists, or code blocks as needed).
//        - Propose the memo to the user and confirm before saving.
//        - Return file paths and contents for new or updated memos.
//     
//     ### Guidelines:
//     - **AIM Format:** A markdown file with "# Title", "**Description:**", and "**Content:**" sections. Include code blocks (e.g., \`\`\`bash) for executable commands.
//     - **When to Create a Memo:** Look for explicit requests (e.g., "create a memo") or reusable content (e.g., step-by-step instructions). Otherwise, respond in markdown without creating a file.
//     - **Confirmation:** Always ask the user to confirm before saving or updating a memo.
//     - **Response Format:** For memos to save, include a "**New Memo**" or "**Update Memo**" section with "**File Path:**" and "**Content:**". For regular responses, use markdown.
//     
//     ### AIM Documentation:
//     Assume AIM is a standard markdown format unless specified by ${llmsList}, which may list compatible LLMs or additional formatting rules.
//     
//     ---
//     
//     ### This is the conversation history:
//     ${messages.map(msg => `${msg.source}: ${msg.message}`).join('\n')}
//     ---
//     
//     ### This is the current state of the memos:
//     ${memos.map(memo => `${memo.name}: ${memo.content}`).join('\n')}
//     ---
//
//     ALWAYS respond with the new files to be saved.
//     `;
//
//     console.log('Generated system prompt');
//     return prompt;
// }

// Validate request body
function validateRequest(messages: unknown): messages is Array<{ message: string; source: Role }> {
    console.log('Validating request messages:', messages);
    const isValid = Array.isArray(messages);
    console.log('Request validation result:', isValid);
    return isValid;
}

// Generate implementation plan
async function generatePlan(messages: Array<{ message: string; source: Role }>, memos: Memo[]) {
    console.log('Generating implementation plan with', memos.length, 'memos');
    
    const openAIClient = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('Created OpenAI client');

    // const systemPrompt = await getSystemPrompt(messages, memos);

    const result = await generateObject({
        model: openAIClient('o3-mini'),
        schema: planSchema,
        // system: systemPrompt,
        prompt: `Analyze this conversation and plan memo changes:
        Messages: ${JSON.stringify(messages)}
        Current Memos: ${JSON.stringify(memos)}`
    });

    console.log('Generated plan:', result);
    return result;
}

// Generate file changes based on plan with quality feedback loop
async function generateChanges(plan: z.infer<typeof planSchema>, messages: Array<{ message: string; source: Role }>, memos: Memo[]) {
    console.log('Generating changes for plan:', plan);
    console.log(memos)
    
    const openAIClient = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    // const systemPrompt = await getSystemPrompt(messages, memos);

    const changes = await Promise.all(plan.files.map(async file => {
        console.log('Processing file:', file);
        
        let currentContent = '';
        let iterations = 0;
        const MAX_ITERATIONS = 3;

        // Initial content generation
        const { text: initialContent } = await generateText({
            model: openAIClient('o3-mini'),
            // system: systemPrompt,
            prompt: `Implement the changes for ${file.filePath} to support:
            ${file.purpose}
            
            Consider the conversation context:
            ${JSON.stringify(messages)}`
        });

        currentContent = initialContent;
        console.log('Generated initial content');

        // Quality improvement loop
        while (iterations < MAX_ITERATIONS) {
            console.log('Starting iteration', iterations + 1);
            
            const { object: evaluation } = await generateObject({
                model: openAIClient('o3-mini'),
                schema: memoEvalSchema,
                // system: systemPrompt,
                prompt: `Evaluate this memo content:
                ${currentContent}
                
                Consider:
                1. Overall quality
                2. AIM format structure
                3. Content clarity
                4. Purpose fulfillment`
            });

            console.log('Content evaluation:', evaluation);

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
                model: openAIClient('o3-mini'),
                // system: systemPrompt,
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

// Generate AI response
async function generateAIResponse(messages: Array<{ message: string; source: Role }>, memos: Memo[]) {
    console.log('Generating AI response');
    
    // const systemPrompt = await getSystemPrompt(messages, memos);
    console.log('Got system prompt');
    
    // First generate implementation plan
    const plan = await generatePlan(messages, memos);
    console.log('Generated implementation plan:', plan);

    let planObject = plan.object;
    if (!planObject || !planObject.files || planObject.files.length === 0) {
        // If no files to change, create a default memo from the conversation
        const defaultMemo = {
            filePath: 'conversation-memo.md',
            purpose: 'Capture conversation content', 
            changeType: 'create' as const
        };
        planObject = {
            files: [defaultMemo],
            estimatedComplexity: 'low' as const
        };
    }
    
    // Then generate specific changes
    const changes = await generateChanges(planObject, messages, memos);
    console.log('Generated changes:', changes);

    // Convert changes to final response format
    const files = changes.map(change => ({
        id: change.file.filePath,
        name: change.file.filePath.split('/').pop() || '',
        content: change.implementation.code
    }));

    console.log('Mapped changes to files format:', files);
    return { files };
}

export async function POST(req: NextRequest) {
    try {
        console.log('Processing POST request to /api/agent');
        
        const body = await req.json();
        const { messages, localStorage } = body;

        console.log('Received messages:', messages);
        console.log('Received localStorage:', localStorage);

        if (!validateRequest(messages)) {
            console.warn('Invalid messages format received');
            return NextResponse.json(
                { error: 'Invalid messages format' },
                { status: 400 }
            );
        }

        const result = await generateAIResponse(messages, localStorage);
        console.log('Agent response:', result);

        if (!result.files || result.files.length === 0) {
            console.warn('No files generated');
            return NextResponse.json({
                response: 'No changes required',
                memos: []
            });
        }

        return NextResponse.json({ 
            response: 'Successfully generated memos',
            memos: result.files
        });

    } catch (error) {
        console.error('Error processing agent request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
