"use client"

import { Conversation } from "@/components/conversation"
import { EditorDialog } from "@/components/editor-dialog"
import { Memo } from "@/lib/core/storage"
import { useState } from "react"
import { useStorage } from "@/hooks/use-storage"

export function FileEditor() {
  const { memos } = useStorage();
  const [selectedFile, setSelectedFile] = useState<Memo | null>(null);
  const [result, setResult] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleEditorChange = (value: string | undefined) => {
    if (value && selectedFile) {
      setSelectedFile({
        ...selectedFile,
        content: value
      });
    }
  }

  const handleRun = async (inputs?: Record<string, any>) => {
    setIsRunning(true);
    setResult(""); // Clear previous results

    try {
      const response = await fetch('/api/aim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: selectedFile?.content, inputs: inputs, files: memos }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        setResult(prev => prev + chunk);
      }

    } catch (error) {
      console.error('Error running code:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsRunning(false);
    }
  }

  const openFile = (memo: Memo) => {
    console.log('_____Memo OPEN:', memo)
    setSelectedFile(memo);
    setResult("");
    setIsRunning(false);
  }

  const closeFile = () => {
    setSelectedFile(null);
    setResult("");
    setIsRunning(false);
  }

  return (
    <>
      <Conversation onMemoSelect={openFile} />
      <EditorDialog
        memo={selectedFile}
        result={result}
        isRunning={isRunning}
        onClose={closeFile}
        onCodeChange={handleEditorChange}
        onRun={handleRun}
        onBack={() => setResult("")}
      />
    </>
  )
}