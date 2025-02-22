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
import { elevenlabsVoices } from "@/lib/elevenlabs/config"

export default function Voice({ setSelectedVoice, selectedVoice }: { setSelectedVoice: (voice: string) => void, selectedVoice: string }) {
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false) // Start with false to avoid hydration issues


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
      {elevenlabsVoices.map(voice => (
        <div key={voice.id} className="flex items-center space-x-2">
          <RadioGroupItem value={voice.id} id={voice.id} />
          <Label htmlFor={voice.id}>{voice.name}</Label>
        </div>
      ))}
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