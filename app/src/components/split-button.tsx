"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { Command as CommandIcon, FileText, File } from "lucide-react"
import { DialogTitle } from "@radix-ui/react-dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useStorage } from "@/hooks/use-storage"
import { Memo } from "@/lib/core/storage"

// Types
interface SplitButtonProps {
  updateCount: number | string
  commandShortcut: string
  mobile?: boolean
  className?: string
  onMemoSelect?: (memo: Memo) => void
  onCreateFile?: (name: string) => void
  onCreateDocument?: (name: string) => void
}

// Component for button appearance
function ButtonContent({
  updateCount,
  commandShortcut,
  mobile,
  className,
  onClick,
}: {
  updateCount: number | string
  commandShortcut: string
  mobile: boolean
  className: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-14 h-14 rounded-md overflow-hidden flex flex-col ${className}`}
    >
      <div className="flex-1 w-full bg-[#FC7434] flex items-center justify-center text-xs font-black tracking-wide text-white transition-colors group-hover:bg-[#FC7434] group-hover:text-white">
        {updateCount}
      </div>
      {mobile ? (
        <div className="flex-1 w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium transition-colors group-hover:bg-[#FC7434] group-hover:text-white">
          OPEN
        </div>
      ) : (
        <div className="flex-1 w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium transition-colors group-hover:bg-[#FC7434] group-hover:text-white">
          <CommandIcon className="w-4 h-4" />
          <span className="ml-1">{commandShortcut}</span>
        </div>
      )}
    </button>
  )
}

// Main component
export default function SplitButton({
  updateCount,
  commandShortcut,
  mobile = false,
  className = "",
  onMemoSelect,
  onCreateFile,
  onCreateDocument,
}: SplitButtonProps) {
  // State
  const { memos, search } = useStorage();
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  // Debug flags
  const hasQuery = !!query.trim();
  const hasCreateFileHandler = !!onCreateFile;
  const hasCreateDocHandler = !!onCreateDocument;
  
  // Log values in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && open) {
      console.log('SplitButton Debug:', {
        hasQuery,
        hasCreateFileHandler,
        hasCreateDocHandler,
        memoCount: memos.length,
        searchResults: !query ? memos : search(query)
      });
    }
  }, [open, hasQuery, hasCreateFileHandler, hasCreateDocHandler, memos, query, search]);

  // Memo search logic
  const searchResults = useMemo(() => {
    if (!query) return memos;
    return search(query);
  }, [query, memos, search]);

  // Keyboard shortcut handler
  useEffect(() => {
    if (mobile) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [mobile]);

  // Action handlers
  const handleMemoSelect = useCallback((memo: Memo) => {
    onMemoSelect?.(memo)
    setOpen(false)
    setQuery("")
  }, [onMemoSelect]);

  const handleCreateFile = useCallback(() => {
    if (query.trim() && onCreateFile) {
      onCreateFile(query.trim())
      setOpen(false)
      setQuery("")
    }
  }, [query, onCreateFile]);

  const handleCreateDocument = useCallback(() => {
    if (query.trim() && onCreateDocument) {
      onCreateDocument(query.trim())
      setOpen(false)
      setQuery("")
    }
  }, [query, onCreateDocument]);

  // Always show the actions if there's a query and any handler
  const showActions = hasQuery && (hasCreateFileHandler || hasCreateDocHandler);

  return (
    <>
      <ButtonContent
        updateCount={updateCount}
        commandShortcut={commandShortcut}
        mobile={mobile}
        className={className}
        onClick={() => setOpen(true)}
      />

      <CommandDialog open={open} onOpenChange={setOpen}>
        <VisuallyHidden>
          <DialogTitle>Search Memos</DialogTitle>
        </VisuallyHidden>
        
        <CommandInput
          placeholder="Type to search or create..."
          value={query}
          onValueChange={setQuery}
          autoFocus
        />
        
        <CommandList className="max-h-[300px]">
          <CommandEmpty>
            <div className="py-2 px-2">
              No memos found. 
              {hasQuery && (
                <div className="mt-2 flex flex-col gap-2">
                  {hasCreateFileHandler && (
                    <button 
                      className="text-blue-500 hover:underline flex items-center"
                      onClick={() => {
                        console.log("Create file button clicked");
                        onCreateFile(query.trim());
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <File className="w-4 h-4 mr-2" />
                      Create file "{query.trim()}"
                    </button>
                  )}
                  {hasCreateDocHandler && (
                    <button 
                      className="text-green-500 hover:underline flex items-center"
                      onClick={() => {
                        console.log("Create document button clicked");
                        onCreateDocument(query.trim());
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Create document "{query.trim()}"
                    </button>
                  )}
                </div>
              )}
            </div>
          </CommandEmpty>
          
          {searchResults.length > 0 && (
            <CommandGroup heading="Memos">
              {searchResults.map((memo) => (
                <CommandItem
                  key={memo.id}
                  onSelect={() => handleMemoSelect(memo)}
                >
                  {memo.id}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {/* Force the Actions section to be visible when appropriate */}
          {hasQuery && (
            <CommandGroup heading="Actions">
              {hasCreateFileHandler && (
                <CommandItem 
                  onSelect={handleCreateFile}
                  className="text-blue-500"
                >
                  <File className="w-4 h-4 mr-2" />
                  Create new file: "{query.trim()}"
                </CommandItem>
              )}
              {hasCreateDocHandler && (
                <CommandItem 
                  onSelect={handleCreateDocument}
                  className="text-green-500"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Create new document: "{query.trim()}"
                </CommandItem>
              )}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
