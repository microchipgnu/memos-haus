"use client"

import { Button } from "@/components/ui/button"
import Info from "./info"
import Voice from "./voice"
import SplitButton from "./SplitButton"

export interface MicrophoneProps {
  title?: string
  commandShortcut?: string
  updateCount?: number
  buttonText?: string
  statusText?: string
  onSpeakClick?: () => void
  className?: string
}

export default function Microphone({
  title = "MEMOS",
  commandShortcut = "K",
  updateCount = 3.211,
  buttonText = "SPEAK",
  statusText = "READY TO LISTEN",
  onSpeakClick = () => console.log("Speak button clicked"),
  className = "",
}: MicrophoneProps) {
  return (
    <>
      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden md:block">
        <div
          className={`mx-auto w-[600px] border rounded-3xl overflow-hidden shadow-lg ${className}`}
        >
          {/* Header */}
          <div className="bg-zinc-900 px-8 py-4 text-white flex justify-between items-center">
            <img
              src="/memos-logo.svg"
              alt="Memos Logo"
              className="h-12 w-auto"
            />
            <span className="text-sm font-semibold tracking-wide">
              {statusText}
            </span>
          </div>

          {/* 2-column body */}
          <div className="grid grid-cols-[auto_1fr] items-stretch">
            {/* Left: microphone */}
            <div className="bg-[#F2F2F2] flex items-center justify-center p-0">
              <img
                src="/mic.svg"
                alt="Microphone"
                className="w-48 h-auto"
              />
            </div>

            {/* Right: Speak button + controls */}
            <div className="bg-[#F2F2F2] p-8 flex flex-col gap-4 justify-center">
              <Button
                className="h-14 px-6 text-xl tracking-widest font-medium bg-[#FC7434] hover:bg-[#CD5C27] text-white rounded-lg"
                onClick={onSpeakClick}
              >
                {buttonText}
              </Button>

              <div className="flex items-center justify-between">
                {/* Left group: Info & Voice triggers */}
                <div className="flex gap-4">
                  <Info />
                  <Voice />
                </div>

                {/* Right group: Split button (desktop version) */}
                <div>
                  <SplitButton
                    updateCount={updateCount}
                    commandShortcut={commandShortcut}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MOBILE LAYOUT ========== */}
      <div className="block md:hidden">
        <div
          className={`mx-auto w-full max-w-[360px] border rounded-3xl overflow-hidden shadow-lg ${className}`}
        >
          {/* Header */}
          <div className="bg-zinc-900 px-4 py-2 text-white flex justify-between items-center">
            <img
              src="/memos-logo.svg"
              alt="Memos Logo"
              className="h-8 w-auto"
            />
            <span className="text-xs font-semibold tracking-wide">
              {statusText}
            </span>
          </div>

          {/* Wide mic image */}
          <div className="bg-[#F2F2F2]">
            <img
              src="/mic-wide.svg"
              alt="Microphone"
              className="w-full h-auto"
            />
          </div>

          {/* Content area: Speak + controls */}
          <div className="bg-[#F2F2F2] p-4 flex flex-col gap-4">
            <Button
              className="h-12 text-base tracking-widest font-medium bg-[#FC7434] hover:bg-[#CD5C27] text-white rounded-lg"
              onClick={onSpeakClick}
            >
              {buttonText}
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Info />
                <Voice />
              </div>

              {/* Mobile Split Button: Pass the mobile prop so the bottom half shows "OPEN" */}
              <div>
                <SplitButton
                  updateCount={updateCount}
                  commandShortcut={commandShortcut}
                  mobile
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
