"use client"

import { useState, useEffect } from "react"
import { Command as CommandIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"

interface SplitButtonProps {
  updateCount: number | string
  commandShortcut: string
  mobile?: boolean
  className?: string
}

export default function SplitButton({
  updateCount,
  commandShortcut,
  mobile = false,
  className = "",
}: SplitButtonProps) {
  const [open, setOpen] = useState(false)

  // Open the command dialog on Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group w-14 h-14 rounded-md overflow-hidden flex flex-col ${className}`}
      >
        {/* Top half: always displays updateCount */}
        <div className="flex-1 bg-[#FC7434] flex items-center justify-center text-xs font-black tracking-wide text-white transition-colors group-hover:bg-[#FC7434] group-hover:text-white">
          {updateCount}
        </div>
        {/* Bottom half: displays "OPEN" on mobile, otherwise shows the Command icon and shortcut */}
        {mobile ? (
          <div className="flex-1 bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium transition-colors group-hover:bg-[#FC7434] group-hover:text-white">
            OPEN
          </div>
        ) : (
          <div className="flex-1 bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium transition-colors group-hover:bg-[#FC7434] group-hover:text-white">
            <CommandIcon className="w-4 h-4" />
            <span className="ml-1">{commandShortcut}</span>
          </div>
        )}
      </button>

      {/* Command Dialog using shadcn Command */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0">
          {/* Hidden DialogTitle for accessibility */}
          <DialogTitle className="sr-only">Command</DialogTitle>
          <Command className="rounded-lg">
            <CommandInput
              placeholder="Type a command or search..."
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  const target = e.target as HTMLInputElement
                  if (target.value === "") {
                    setOpen(false)
                    e.stopPropagation()
                  }
                }
              }}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem onSelect={() => console.log("Command Item 1 selected")}>
                  Command Item 1
                </CommandItem>
                <CommandItem onSelect={() => console.log("Command Item 2 selected")}>
                  Command Item 2
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
