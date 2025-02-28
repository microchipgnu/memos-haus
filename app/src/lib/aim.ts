import { aim, defaultRuntimeOptions } from "@aim-sdk/core"
import { codeAdapter } from "@aim-sdk/adapters-code-e2b";
import { getToolsPlugin } from "@aim-sdk/plugins-get-tools";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { zeroEx } from "@goat-sdk/plugin-0x";
import { erc20 } from "@goat-sdk/plugin-erc20";
import { viem } from "@goat-sdk/wallet-viem";
import { Sandbox } from "@e2b/code-interpreter";
import { z } from "zod";

export function createAim(content: string, files: { path: string; content: string }[], abortSignal: AbortSignal, context: { accountDetails: string }) {
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
                {
                    type: "code",
                    handlers: {
                        eval: async ({ code, language, variables }) => {
                            const sbx = await Sandbox.create({
                                apiKey: process.env.E2B_API_KEY || "", logger: console
                            });
                            const execution = await sbx.runCode(code, { language });
                            await sbx.kill();
                            return execution.toJSON();
                        }
                    }
                }
            ],
            tools: {
                accountDetails: {
                    description: "Get account details",
                    parameters: z.object({}),
                    execute: async () => {
                        return context.accountDetails;
                    },
                },
            },
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