import { generateAIResponse } from '@/lib/core/agent/main';
import { Role } from '@11labs/react';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes in seconds

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
