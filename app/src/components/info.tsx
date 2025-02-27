"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function Info() {
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const updateSize = () => setIsDesktop(window.innerWidth >= 768)
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Shared content for both Dialog and Drawer
  const infoContent = (
    <div className="mt-4 space-y-6 text-gray-500">
      <p className="font-semibold" style={{ color: "#000000" }}>
        Intelligent voice memos that generate personal software<span style={{ color: "#FC7434" }}>.</span>
      </p>
      <hr className="border-t border-gray-300" />
      <p>
        Press <span style={{ color: "#000000" }} className="font-semibold">SPEAK</span> and say anything that you wish to record as a voice memo.
      </p>
      <p>All your memos will be organized and maintained by AI Agents.</p>
      <p>
        Press <span style={{ color: "#000000" }} className="font-semibold">CMMD + K</span> (or click{" "}
        <span style={{ color: "#000000" }} className="font-semibold">OPEN</span> on mobile) to access your memos.
      </p>
      <p>
        You can create simple apps with memo context using{" "}
        <a
          href="https://aim.tools/"
          target="_blank"
          rel="noreferrer"
          className="hover:underline text-[#FC7434] hover:text-[#BF6236]"
        >
          AIM
        </a>.
      </p>
      <hr className="border-t border-gray-300" />
      <p>
        Memos was built by{" "}
        <a
          href="https://www.microchipgnu.pt/"
          target="_blank"
          rel="noreferrer"
          className="hover:underline text-[#FC7434] hover:text-[#BF6236]"
        >
          @microchipgnu
        </a>{" "}
        and{" "}
        <a
          href="https://marcelokunze.com"
          target="_blank"
          rel="noreferrer"
          className="hover:underline text-[#FC7434] hover:text-[#BF6236]"
        >
          @marcelokunze
        </a>{" "}
        for the {" "}
        <a
          href="https://hackathon.elevenlabs.io/"
          target="_blank"
          rel="noreferrer"
          className="hover:underline text-[#FC7434] hover:text-[#BF6236]"
        >
          ElevenLabs Worldwide Hackathon
        </a>.
      </p>
    </div>
  )

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="secondarycustom"
        className="w-14 h-14 p-0 text-xs font-medium"
        onClick={() => setOpen(true)}
      >
        INFO
      </Button>

      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader className="flex flex-col items-start">
              <DialogTitle>
                <VisuallyHidden>Information</VisuallyHidden>
              </DialogTitle>
              <div className="w-full text-left">
                <img
                  src="/memos-logo-typeface.svg"
                  alt="Memos Logo"
                  className="w-auto h-8 opacity-80"
                />
              </div>
            </DialogHeader>
            <div className="text-gray-900">{infoContent}</div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="p-4">
            <DrawerHeader className="flex flex-col items-start">
            <DialogTitle>
                <VisuallyHidden>Information</VisuallyHidden>
              </DialogTitle>
              <div className="w-full text-left">
                <img
                  src="/memos-logo-typeface.svg"
                  alt="Memos Logo"
                  className="w-auto h-8 opacity-80"
                />
              </div>
            </DrawerHeader>
            <div className="text-gray-900">{infoContent}</div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
