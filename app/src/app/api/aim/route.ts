import { createAim } from "@/lib/aim";
import { Memo } from "@/lib/core/storage";
import { type RenderableTreeNode, renderers } from "@aim-sdk/core";
import { type NextRequest, NextResponse } from 'next/server';

export const maxDuration = 800;
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        // Create an AbortController for the request
        const controller = new AbortController();
        const { signal } = controller;

        // Set a timeout to abort after maxDuration seconds
        const timeout = setTimeout(() => {
            controller.abort();
        }, maxDuration * 1000);

        const body = await request.json();

        const files = body.files;
        const context = body.context;

        const aimFiles = files.map((file: Memo) => ({
            path: file.id,
            content: file.content
        }));

        const content = body.content;
        const inputs = body.inputs;

        console.log("INPUTS:", inputs)

        const aimDoc = createAim(content, aimFiles, signal, context);

        // Create a TransformStream for streaming
        const stream = new TransformStream();
        const writer = stream.writable.getWriter();
        
        // Start processing in the background
        (async () => {
            try {
                const encoder = new TextEncoder();
                
                for await (const chunk of aimDoc.executeWithGenerator({ 
                    input: {
                        ...inputs,
                    } 
                })) {
                    if (signal.aborted) {
                        throw new Error('Request aborted');
                    }
                    console.log(chunk);
                    // Convert chunk to HTML and send it
                    const html = renderers.html([chunk] as RenderableTreeNode[]);
                    await writer.write(encoder.encode(html));
                }
            } catch (error) {
                console.error('Streaming Error:', error);
            } finally {
                clearTimeout(timeout);
                await writer.close();
            }
        })();

        // Return the readable stream
        return new Response(stream.readable, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Transfer-Encoding': 'chunked'
            }
        });
        
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error },
            { status: 500 }
        );
    }
}