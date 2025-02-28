"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer"
import { useStorage } from "@/hooks/use-storage"
import { Memo } from "@/lib/core/storage"
import { configurePrismSyntax } from "@/lib/prism"
import MonacoEditor from '@monaco-editor/react'
import React from "react"
import yaml from 'yaml'

interface EditorDialogProps {
    memo: Memo | null
    result: string 
    isRunning: boolean
    onClose: () => void
    onCodeChange: (value: string | undefined) => void
    onRun: (inputs?: Record<string, any>) => void
    onBack: () => void
}

export function EditorDialog({
    memo,
    result,
    isRunning,
    onClose,
    onCodeChange,
    onRun,
    onBack
}: EditorDialogProps) {
    const { saveMemo } = useStorage()

    const [showInputDialog, setShowInputDialog] = React.useState(false)
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const [inputValues, setInputValues] = React.useState<Record<string, any>>({})
    const resultRef = React.useRef<HTMLDivElement>(null)
    const [hasChanges, setHasChanges] = React.useState(false)
    const [currentCode, setCurrentCode] = React.useState<string | undefined>(memo?.content || "")
    const [isDesktop, setIsDesktop] = React.useState(true)

    React.useEffect(() => {
        const updateSize = () => setIsDesktop(window.innerWidth >= 768)
        updateSize()
        window.addEventListener("resize", updateSize)
        return () => window.removeEventListener("resize", updateSize)
    }, [memo])

    React.useEffect(() => {
        if (memo?.content) {
            setCurrentCode(memo.content)
        }
    }, [memo?.content, memo])

    // Parse frontmatter if present and extract input fields
    const hasFrontmatter = memo?.content.trim().startsWith('---')
    const frontmatterInputs = React.useMemo(() => {
        if (!hasFrontmatter) return null

        try {
            // Extract content between first two --- markers
            const matches = memo?.content.match(/^---\n([\s\S]*?)\n---/)
            if (!matches) return null

            const frontmatterContent = matches[1]
            const parsed = yaml.parse(frontmatterContent)

            // Check if input field exists and is an array
            if (!parsed?.input || !Array.isArray(parsed.input)) {
                return null
            }

            // Validate and transform input fields
            const inputs = parsed.input.map((field: {
                type?: string
                name?: string
                description?: string
                required?: boolean
                default?: any
            }) => {
                if (typeof field !== 'object') return null

                // Ensure required properties exist
                if (!field.type || !field.name) return null

                return {
                    type: field.type,
                    name: field.name,
                    description: field.description || '',
                    required: field.required ?? true,
                    default: field.default
                }
            }).filter(Boolean)

            return inputs.length > 0 ? inputs : null

        } catch (e) {
            console.error('Error parsing frontmatter:', e)
            return null
        }
    }, [memo?.content, hasFrontmatter])

    const handleRunClick = () => {
        if (frontmatterInputs) {
            setShowInputDialog(true)
        } else {
            onRun()
        }
    }

    const handleInputSubmit = () => {
        setShowInputDialog(false)
        onRun(inputValues)
    }

    const handleCodeChange = (value: string | undefined) => {
        if (value) {
            setCurrentCode(value)
            setHasChanges(value !== memo?.content)
            onCodeChange(value)
        }
    }

    const handleSaveChanges = () => {
        if (memo && currentCode) {
            saveMemo({
                id: memo.id,
                content: currentCode,
                name: memo.name
            })
            setHasChanges(false)
        }
    }

    // Auto-scroll to bottom when new content arrives
    React.useEffect(() => {
        if (resultRef.current) {
            const scrollToBottom = () => {
                resultRef.current?.scrollTo({
                    top: resultRef.current.scrollHeight,
                    behavior: 'smooth'
                })
            }
            scrollToBottom()
            // Add a small delay to ensure content is rendered
            const timeoutId = setTimeout(scrollToBottom, 100)
            return () => clearTimeout(timeoutId)
        }
    }, [result])

    const renderContent = () => (
        <>
            <div className={`relative h-[70vh] ${isRunning ? 'bg-[#FC7434]/5 transition-colors duration-1000' : ''}`}>
                {!result ? (
                    <MonacoEditor
                        height="100%"
                        defaultLanguage="aim"
                        theme="aim-dark"
                        value={currentCode}
                        onChange={handleCodeChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            lineNumbers: 'on',
                            padding: { top: 8 },
                            fontFamily: 'JetBrains Mono, monospace',
                        }}
                        beforeMount={configurePrismSyntax}
                    />
                ) : (
                    <div className="h-full overflow-y-auto overflow-x-auto" ref={resultRef}>
                        <div className="output-preview h-full p-4 bg-zinc-900/50 rounded-md text-sm text-zinc-300 whitespace-pre-wrap break-words" style={{ maxWidth: '100%' }}>
                            <style scoped>
                                {`
                                .output-preview div {
                                    word-wrap: break-word;
                                    overflow-wrap: break-word;
                                    max-width: 100%;
                                }

                                .output-preview h1 {
                                    font-size: 1.5rem;
                                    font-weight: 600;
                                    color: rgb(244, 244, 245);
                                    padding-top: 0.75rem;
                                    padding-bottom: 0.75rem;
                                    margin-top: 0.75rem;
                                    margin-bottom: 0.75rem;
                                    line-height: 1.75;
                                }
                            
                                .output-preview h2 {
                                    font-size: 1.25rem;
                                    font-weight: 600;
                                    color: rgb(244, 244, 245);
                                    padding-top: 0.75rem;
                                    padding-bottom: 0.75rem;
                                    margin-top: 0.75rem;
                                    margin-bottom: 0.75rem;
                                    line-height: 1.75;
                                }

                                .output-preview p {
                                    display: block;
                                    padding: 0.5rem 0;
                                    margin: 0.5rem 0;
                                    color: rgb(228, 228, 231);
                                    line-height: 1.6;
                                    font-size: 1rem;
                                    word-wrap: break-word;
                                    overflow-wrap: break-word;
                                }

                                .output-preview ai {
                                    display: block;
                                    padding: 0.75rem 1rem;
                                    margin: 0.5rem 0.25rem;
                                    border: 1px solid #FC7434;
                                    border-radius: 0.375rem;
                                    background-color: rgba(252, 116, 52, 0.1);
                                    color: #FC7434;
                                    font-weight: 500;
                                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
                                    transition: all 0.2s ease;
                                    cursor: pointer;
                                    position: relative;
                                    word-wrap: break-word;
                                    overflow-wrap: break-word;
                                }

                                .output-preview ai:before {
                                    content: "▼";
                                    position: absolute;
                                    right: 1rem;
                                    top: 0.75rem;
                                    transition: transform 0.2s ease;
                                }

                                .output-preview ai.collapsed:before {
                                    transform: rotate(-90deg);
                                }

                                .output-preview ai.collapsed > *:not(:first-child) {
                                    display: none;
                                }

                                .output-preview ai:hover {
                                    background-color: rgba(252, 116, 52, 0.2);
                                    border-color: #CD5C27;
                                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                                }

                                .output-preview if {
                                    display: block;
                                    padding: 0.75rem;
                                    margin: 0.5rem 0;
                                    border: 2px solid #FC7434;
                                    border-radius: 0.375rem;
                                    background-color: rgba(252, 116, 52, 0.1);
                                    position: relative;
                                    word-wrap: break-word;
                                    overflow-wrap: break-word;
                                }

                                .output-preview else {
                                    display: block;
                                    padding: 0.75rem;
                                    margin: 0.5rem 0;
                                    border: 1px solid #FC7434;
                                    border-radius: 0.375rem;
                                    background-color: rgba(252, 116, 52, 0.1);
                                    color: #FC7434;
                                    font-weight: 500;
                                    word-wrap: break-word;
                                    overflow-wrap: break-word;
                                }

                                .output-preview loop {
                                    display: block;
                                    padding: 1rem;
                                    margin: 1rem 0;
                                    border: 2px solid rgb(63, 63, 70);
                                    border-radius: 0.5rem;
                                    background-color: rgba(39, 39, 42, 0.5);
                                    position: relative;
                                    word-wrap: break-word;
                                    overflow-wrap: break-word;
                                }

                                .output-preview .loading {
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    height: 1.5rem;
                                    width: 1.5rem;
                                }

                                .output-preview .loading div {
                                    animation: spin 1s linear infinite;
                                    height: 1rem;
                                    width: 1rem;
                                    border-radius: 9999px;
                                    border-bottom: 2px solid #FC7434;
                                }

                                @keyframes spin {
                                    to {
                                        transform: rotate(360deg);
                                    }
                                }

                                .animate-fadeIn {
                                    animation: fadeIn 0.2s ease-in;
                                }

                                @keyframes fadeIn {
                                    from {
                                        opacity: 0;
                                    }
                                    to {
                                        opacity: 1;
                                    }
                                }
                                `}
                            </style>
                            <div className="max-h-[500px] overflow-auto w-full animate-fadeIn" style={{ maxWidth: '100%', wordBreak: 'break-word' }}>
                                <div dangerouslySetInnerHTML={{ __html: result }} />
                                {isRunning && (
                                    <div className="sticky bottom-0 p-2 flex justify-center">
                                        <div className="loading">
                                            <div />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 flex justify-end space-x-2">
                {hasChanges && (
                    <Button
                        onClick={handleSaveChanges}
                        className="bg-[#FC7434] hover:bg-[#CD5C27] text-white"
                    >
                        Save Changes
                    </Button>
                )}
                {!result || isRunning ? (
                    <Button
                        onClick={handleRunClick}
                        disabled={isRunning}
                        className={`bg-[#FC7434] hover:bg-[#CD5C27] text-white ${isRunning ? 'animate-pulse' : ''}`}
                    >
                        {isRunning ? (
                            <>
                                <div className="loading mr-2">
                                    <div />
                                </div>
                                Running...
                            </>
                        ) : (
                            'Run Code'
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={onBack}
                        className="bg-[#FC7434] hover:bg-[#CD5C27] text-white"
                    >
                        Back to Code
                    </Button>
                )}
            </div>
        </>
    )

    return (
        <>
            {isDesktop ? (
                <Dialog open={memo !== null} onOpenChange={(open) => !open && onClose()}>
                    <DialogContent className="max-w-4xl bg-zinc-900">
                        <DialogTitle className="text-zinc-100 mb-4">
                            {memo?.id}
                        </DialogTitle>
                        {renderContent()}
                    </DialogContent>
                </Dialog>
            ) : (
                <Drawer open={memo !== null} onOpenChange={(open) => !open && onClose()}>
                    <DrawerContent className="bg-zinc-900 p-4">
                        <DrawerHeader className="p-0">
                            <DialogTitle className="text-zinc-100 mb-4">
                                {memo?.id}
                            </DialogTitle>
                        </DrawerHeader>
                        {renderContent()}
                    </DrawerContent>
                </Drawer>
            )}

            {/* Input Dialog */}
            <Dialog open={showInputDialog} onOpenChange={setShowInputDialog}>
                <DialogContent className="bg-zinc-900">
                    <DialogTitle className="text-zinc-100">Enter Input Values</DialogTitle>
                    <div className="space-y-4">
                        {frontmatterInputs?.map((field: {
                            type: string;
                            name: string;
                            description: string;
                            required: boolean;
                            default: any;
                        }) => (
                            <div key={field.name} className="space-y-2">
                                <label className="text-sm text-zinc-300">
                                    {field.name}
                                    {field.description && (
                                        <span className="ml-2 text-zinc-500">{field.description}</span>
                                    )}
                                </label>
                                <input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100"
                                    defaultValue={field.default}
                                    required={field.required}
                                    onChange={(e) => setInputValues(prev => ({
                                        ...prev,
                                        [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value
                                    }))}
                                />
                            </div>
                        ))}
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button onClick={() => setShowInputDialog(false)} variant="outline">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleInputSubmit}
                                className="bg-[#FC7434] hover:bg-[#CD5C27] text-white"
                            >
                                Run
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}