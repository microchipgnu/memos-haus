"use client"

import { useState } from "react"
import { EditorDialog } from "@/components/editor-dialog"
import { CodeFile } from "@/lib/filesystem"

interface FileEditorProps {
  files: CodeFile[]
}

export function FileEditor({ files }: FileEditorProps) {
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleEditorChange = (value: string | undefined) => {
    if (value && selectedFile) {
      setCode(value);
    }
  }

  const handleRun = async (inputs?: Record<string, any>) => {
    setIsRunning(true);
    setResult(""); // Clear previous results
    
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: code, inputs: inputs, files: files }),
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

  const openFile = (file: CodeFile) => {
    setSelectedFile(file);
    setCode(file.content);
    setResult("");
    setIsRunning(false);
  }

  const closeFile = () => {
    setSelectedFile(null);
    setCode("");
    setResult("");
    setIsRunning(false);
  }

  return (
    <>
      <EditorDialog
        file={selectedFile}
        code={code}
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