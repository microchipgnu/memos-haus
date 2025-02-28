import { aim, defaultRuntimeOptions } from "@aim-sdk/core"
import { getToolsPlugin } from "@aim-sdk/plugins-get-tools";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { zeroEx } from "@goat-sdk/plugin-0x";
import { erc20 } from "@goat-sdk/plugin-erc20";
import { viem } from "@goat-sdk/wallet-viem";
import { Sandbox } from "@e2b/code-interpreter";
import { z } from "zod";
import { mantle } from "viem/chains";
import { wagmi } from "./goat-wagmi-wallet-provider";
import { config } from "./reown/config";

export async function createAim(content: string, files: { path: string; content: string }[], abortSignal: AbortSignal, context: { accountDetails: string }) {

    const goatOnchainTools = await getOnChainTools({
        wallet: wagmi(config),
        plugins: [
            zeroEx({
                apiKey: process.env.ZEROEX_API_KEY as string,
            }),
            erc20({
                tokens: [
                    {
                        chains: {
                            [mantle.id]: {
                                contractAddress: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8",
                            }
                        },
                        symbol: "MNT",
                        name: "MNT",
                        decimals: 18
                    }
                ]
            })
        ]
    })

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
                ...goatOnchainTools
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