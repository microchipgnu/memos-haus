"use client"

import Microphone from "@/components/microphone"

export default function VoiceMemoPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 p-4">
      <Microphone 
        onSpeakClick={() => {
          console.log("Voice recording started")
        }}
      />
    </div>
  )
}