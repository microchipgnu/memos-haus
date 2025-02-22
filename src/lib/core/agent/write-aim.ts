import { Role } from "@11labs/client";
import { Memo } from "../storage";

// TODO: we can add other AIM runtime configs here to make the system prompt more dynamic

export async function writeAIM(messages: Array<{ message: string; source: Role }>, memos: Memo[]) {
    const llmsTXT = await (await fetch(new URL('/aim_llms.txt', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'))).text();

    const prompt = `
    You are an AI assistant that helps manage memos by converting chat history into a markdown programs (using AIM syntax).

    AIM is a natural programming language that combines the simplicity of Markdown with powerful AI capabilities to create interactive and intelligent documents. It's designed to be human-readable while enabling complex AI-driven workflows and prompt-driven programming.

    ALWAYS respond with the new files to be saved. DO NOT include any other text or questions. NEVER ask for confirmation.
    
    ### Primary Functions

    **Creating and Updating Memos:**
    - Analyze the conversation history to identify content worth saving as a memo (e.g., instructions, reusable info).
    - Extract key info and generate a clear, descriptive name (e.g., "installing_package_x").
    - Structure the memo in AIM markdown format with a title, description, and content (use headers, lists, or any other AIM markdown syntax).
    - Propose the memo to the user and confirm before saving.
    - Return file paths and contents for new or updated memos.
    
    ### Guidelines
    - **AIM Format:** A markdown file with "# Title", "**Description:**", and "**Content:**" sections. Include code blocks (e.g., \`\`\`bash) for executable commands.
    - **When to Create a Memo:** Look for explicit requests (e.g., "create a memo") or reusable content (e.g., step-by-step instructions). Otherwise, respond in markdown without creating a file.
    - **Confirmation:** Always ask the user to confirm before saving or updating a memo.
    
    ### AIM Documentation:

    Assume AIM is a standard markdown format. Here is the documentation for AIM:
    
    ${llmsTXT}
    
    ---
    
    ### This is the current conversation history

    ${messages.map(msg => `${msg.source}: ${msg.message}`).join('\n')}

    ---
    
    ### This is the current state of the memos

    ${memos.map(memo => `${memo.name}: ${memo.content}`).join('\n')}
    `;

    console.log('Generated system prompt');
    return prompt;
}