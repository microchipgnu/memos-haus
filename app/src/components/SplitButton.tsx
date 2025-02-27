"use client"

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
import { DialogTitle } from "@radix-ui/react-dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Command as CommandIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface SplitButtonProps {
  updateCount: number | string
  commandShortcut: string
  mobile?: boolean
  className?: string
  onMemoSelect?: (memo: Memo) => void
}

export default function SplitButton({
  updateCount,
  commandShortcut,
  mobile = false,
  className = "",
  onMemoSelect,
}: SplitButtonProps) {

  const { memos, search } = useStorage();

  const [open, setOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<Memo[]>(memos)
  const [query, setQuery] = useState("")

  // Only add keyboard shortcut handler for desktop version
  useEffect(() => {
    if (mobile) return; // Skip event listener for mobile version

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [mobile]) // Add mobile as dependency

  // Search memos when query changes
  useEffect(() => {
    if (query) {
      const results = search(query);
      setSearchResults(results);
    } else {
      setSearchResults(memos);
    }
  }, [query, memos]);

  // Handle memo selection
  const handleMemoSelect = useCallback((memo: Memo) => {
    onMemoSelect?.(memo)
    setOpen(false)
    setQuery("")
  }, [onMemoSelect])

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
          placeholder="Search memos..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No memos found.</CommandEmpty>
          <CommandGroup heading="Commands">
            {searchResults.map((memo) => (
              <CommandItem
                key={memo.id}
                onSelect={() => handleMemoSelect(memo)}
              >
                {memo.id}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

// Separate button content component
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
