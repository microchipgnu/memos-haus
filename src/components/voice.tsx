"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function Voice() {
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false) // Start with false to avoid hydration issues
  const [selectedVoice, setSelectedVoice] = useState("voice1")

  useEffect(() => {
    // Ensure window is available (client-side only)
    const updateSize = () => setIsDesktop(window.innerWidth >= 768)
    updateSize() // Set initial value
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  const VoiceOptions = () => (
    <RadioGroup
      value={selectedVoice}
      onValueChange={setSelectedVoice}
      className="space-y-3 p-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="voice1" id="voice1" />
        <Label htmlFor="voice1">Voice 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="voice2" id="voice2" />
        <Label htmlFor="voice2">Voice 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="voice3" id="voice3" />
        <Label htmlFor="voice3">Voice 3</Label>
      </div>
    </RadioGroup>
  )

  return (
    <>
      <Button
        variant="secondarycustom"
        className="w-14 h-14 p-0 text-xs font-medium"
        onClick={() => setOpen(true)}
      >
        VOICE
      </Button>

      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Voice Settings</DialogTitle>
              <DialogDescription>
                Select your preferred voice option
              </DialogDescription>
            </DialogHeader>
            <VoiceOptions />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="px-4">
            <DrawerHeader>
              <DrawerTitle>Voice Settings</DrawerTitle>
              <DrawerDescription>
                Select your preferred voice option
              </DrawerDescription>
            </DrawerHeader>
            <VoiceOptions />
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}