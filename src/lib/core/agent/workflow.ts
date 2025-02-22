import { generateChanges } from "./changes";
import { generatePlan } from "./plan";
import { Memo } from "../storage";
import { Role } from "@11labs/client";

export async function generateAIResponse(messages: Array<{ message: string; source: Role }>, memos: Memo[]) {
    console.log('Generating AI response');
    
    // First generate implementation plan
    const plan = await generatePlan(messages, memos);
    console.log('Generated implementation plan:', JSON.stringify(plan, null, 2));

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
    console.log('Generated changes:', JSON.stringify(changes, null, 2));

    // Convert changes to final response format
    const files = changes.map(change => ({
        id: change.file.filePath,
        name: change.file.filePath.split('/').pop() || '',
        content: change.implementation.code
    }));

    console.log('Mapped changes to files format:', JSON.stringify(files, null, 2));
    return { files };
}