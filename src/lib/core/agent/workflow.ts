import { generateChanges } from "./changes";
import { generatePlan } from "./plan";
import { Memo } from "../storage";
import { Role } from "@11labs/client";

export async function updateState(messages: Array<{ message: string; source: Role }>, memos: Memo[]) {
    console.log('Updating state');
    
    // First generate implementation plan
    let plan = await generatePlan(messages, memos);
    console.log('Generated implementation plan:', JSON.stringify(plan, null, 2));

    let planObject = plan.object;
    let retryCount = 0;
    const maxRetries = 3;

    // Retry if no files returned
    while ((!planObject || !planObject.files || planObject.files.length === 0) && retryCount < maxRetries) {
        console.log(`No files in plan, retrying (attempt ${retryCount + 1}/${maxRetries})`);
        plan = await generatePlan(messages, memos);
        planObject = plan.object;
        retryCount++;
    }

    if (!planObject || !planObject.files || planObject.files.length === 0) {
        console.warn('Still no files after retries');
        return { files: [] };
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