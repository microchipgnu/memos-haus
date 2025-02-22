"use client"

import Microphone from "@/components/microphone"
import Navbar from "@/components/navbar"

export default function VoiceMemoPage() {
  return (
    <>
      <Navbar />
      <div className="fixed inset-0 pt-12 flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,#ffffff_30%,#cccccc_100%)]">
        <Microphone 
          onSpeakClick={() => {
            console.log("Voice recording started")
          }}
        />
      </div>
    </>
  )
}