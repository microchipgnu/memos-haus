import { aim, defaultRuntimeOptions } from "@aim-sdk/core"
import { codeAdapter } from "@aim-sdk/adapters-code-e2b";
import { getToolsPlugin } from "@aim-sdk/plugins-get-tools";

export function createAim(content: string, files: { path: string; content: string }[], abortSignal: AbortSignal) {
    return aim({
        content,
        options: {
            ...defaultRuntimeOptions,
            signals: {
                abort: abortSignal,
            },
            timeout: 1000 * 60 * 5,
            experimental_files: files.reduce((acc, file) => {
                acc[file.path] = { content: file.content };
                return acc;
            }, {} as Record<string, { content: string }>),
            env: {
                "OPENAI_API_KEY": process.env.OPENAI_API_KEY || "",
                "E2B_API_KEY": process.env.E2B_API_KEY || "",
                "REPLICATE_API_KEY": process.env.REPLICATE_API_KEY || "",
                "OPENROUTER_API_KEY": process.env.OPENROUTER_API_KEY || "",
            },
            events: {
                onError: (error) => {
                    console.error(error);
                },
                onLog: (message) => {
                    console.log(message);
                },
            },
            adapters: [
                codeAdapter,
            ],
            tools: {},
            plugins: [
                {
                    plugin: getToolsPlugin
                },
                {
                    plugin: {
                        name: "time",
                        version: "0.0.1",
                        tags: {
                            "wait": {
                                render: "wait",
                                execute: async function* () {
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                },
                            },
                        },
                    },
                },
            ],
        },
    });
}