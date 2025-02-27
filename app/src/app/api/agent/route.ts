import { updateState } from '@/lib/core/agent/workflow';
import { Role } from '@11labs/react';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 800; // 5 minutes in seconds

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
        const { messages, memos } = body;

        console.log('Received messages:', messages);
        console.log('Received memos:', memos);

        if (!validateRequest(messages)) {
            console.warn('Invalid messages format received');
            return NextResponse.json(
                { error: 'Invalid messages format' },
                { status: 400 }
            );
        }

        const result = await updateState(messages, memos);
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
