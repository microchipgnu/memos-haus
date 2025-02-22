"use client"

import { Button } from "@/components/ui/button"
import Info from "./info"
import Voice from "./voice"
import SplitButton from "./SplitButton"
import AnimatedLogo from "@/components/AnimatedLogo"
import Image from "next/image"
import { Memo } from "@/lib/core/storage"

// Import icons from lucide-react
import { Activity, Ear, Loader2 } from "lucide-react"

export interface MicrophoneProps {
  commandShortcut?: string
  updateCount?: number
  buttonText?: string
  statusText?: string
  onSpeakClick?: () => void
  className?: string
  conversationStatus?: string  // or a more specific type if you want
  isSpeaking?: boolean
  isIngesting?: boolean
  onMemoSelect?: (memo: Memo) => void
  setSelectedVoice?: (voice: string) => void
  selectedVoice?: string
}

export default function Microphone({
  setSelectedVoice,
  selectedVoice,
  commandShortcut = "K",
  updateCount = 3.211,
  buttonText = "SPEAK",
  statusText = "READY TO LISTEN",
  onSpeakClick = () => console.log("Speak button clicked"),
  className = "",
  isIngesting = false,
  onMemoSelect = () => console.log("Memo selected"),
}: MicrophoneProps) {
  // Decide icon colors based on the statusText
  function getIconColors(status: string) {
    switch (status) {
      case "READY TO LISTEN":
        // Both icons gray
        return { ear: "#4B4B4B", activity: "#4B4B4B" }
      case "LISTENING...":
        // Ear blue, Activity gray
        return { ear: "#61B3E2", activity: "#4B4B4B" }
      case "PROCESSING":
        // Ear gray, Activity pink
        return { ear: "#4B4B4B", activity: "#FA2B69" }
      default:
        return { ear: "#4B4B4B", activity: "#4B4B4B" }
    }
  }

  const { ear: earColor, activity: activityColor } = getIconColors(statusText)

  const renderControls = (isMobile = false) => (
    <div className="flex items-center justify-between">
      <div className={`flex ${isMobile ? "gap-2" : "gap-4"}`}>
        <Info />
        <Voice 
          setSelectedVoice={setSelectedVoice ?? (() => {})} 
          selectedVoice={selectedVoice ?? ''} 
        />
      </div>
      <div>
        <SplitButton
          updateCount={updateCount}
          commandShortcut={commandShortcut}
          mobile={isMobile}
          onMemoSelect={onMemoSelect}
        />
      </div>
    </div>
  )

  return (
    <>
      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden md:block">
        <div className={`mx-auto w-[600px] border rounded-3xl overflow-hidden shadow-lg ${className}`}>
          {/* Header */}
          <div className="bg-zinc-900 px-8 py-4 text-white flex items-center justify-between relative">
            {/* Left: Logo */}
            <AnimatedLogo className="h-12 w-auto" />

            {/* Center: Icons (absolutely positioned) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-3">
              <Activity color={activityColor} size={18} />
              <Ear color={earColor} size={18} />
              <Loader2 className={isIngesting ? "animate-spin" : ""}  size={18} color={isIngesting ? "#ffffff" : "#4B4B4B"} />
            </div>

            {/* Right: Status text */}
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap">
              {statusText}
            </span>
          </div>



          {/* 2-column body */}
          <div className="grid grid-cols-[auto_1fr] items-stretch">
            {/* Left: microphone */}
            <div className="bg-[#F2F2F2] flex items-center justify-center p-0">
              <Image
                src="/mic.svg"
                alt="Microphone"
                width={100}
                height={100}
                className="w-48 h-auto"
              />
            </div>

            {/* Right: Speak button + controls */}
            <div className="bg-[#F2F2F2] p-8 flex flex-col gap-4 justify-center">
              <Button
                className="h-14 px-6 text-xl tracking-widest font-medium bg-[#FC7434] hover:bg-[#CD5C27] text-white rounded-lg"
                onClick={onSpeakClick}
                disabled={isIngesting}
              >
                {buttonText}
              </Button>

              {renderControls(false)}
            </div>
          </div>
        </div>
      </div>

      {/* ========== MOBILE LAYOUT ========== */}
      <div className="block md:hidden">
        <div className={`mx-auto w-full max-w-[360px] border rounded-3xl overflow-hidden shadow-lg ${className}`}>
          {/* Header */}
          <div className="bg-zinc-900 px-4 py-2 text-white flex items-center justify-between relative">
            {/* Left: Logo */}
            <AnimatedLogo className="h-8 w-auto" />

            {/* Center: Icons (absolutely positioned) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-2">
              <Activity color={activityColor} size={16} />
              <Ear color={earColor} size={16} />
              <Loader2 className={isIngesting ? "animate-spin" : ""}  size={18} color={isIngesting ? "#ffffff" : "#4B4B4B"} />
            </div>

            {/* Right: Status text */}
            <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
              {statusText}
            </span>
          </div>



          {/* Wide mic image */}
          <div className="bg-[#F2F2F2]">
            <Image
              src="/mic-wide.svg"
              alt="Microphone"
              width={100}
              height={100}
              className="w-full h-auto"
            />
          </div>

          {/* Content area: Speak + controls */}
          <div className="bg-[#F2F2F2] p-4 flex flex-col gap-4">
            <Button
              className="h-12 text-base tracking-widest font-medium bg-[#FC7434] hover:bg-[#CD5C27] text-white rounded-lg"
              onClick={onSpeakClick}
              disabled={isIngesting}
            >
              {buttonText}
            </Button>

            {renderControls(true)}
          </div>
        </div>
      </div>
    </>
  )
}
