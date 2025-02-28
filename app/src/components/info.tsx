"use client"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStorage } from "@/hooks/use-storage"
import { getMemos } from "@/lib/core/storage"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { HelpCircle, Info as InfoIcon, Settings as SettingsIcon } from "lucide-react"
import { useEffect, useState } from "react"

export default function Info() {
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [activeTab, setActiveTab] = useState("info")
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0, percentage: 0 })
  const { clearMemos, memos } = useStorage()

  useEffect(() => {
    const updateSize = () => setIsDesktop(window.innerWidth >= 768)
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  useEffect(() => {
    const calculateStorage = async () => {
      try {
        // Get all memos to calculate their size
        const memos = getMemos()
        
        // Calculate size of memos in bytes
        const memosSize = new Blob([JSON.stringify(memos)]).size
        
        // Convert to MB
        const memosSizeMB = memosSize / (1024 * 1024)
        
        // Get device storage information if available
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate()
          const totalSpace = estimate.quota || 0
          const usedSpace = estimate.usage || 0
          
          // Convert to MB or GB as appropriate
          let totalSpaceFormatted, totalSpaceUnit
          let usedSpaceMB = usedSpace / (1024 * 1024)
          
          if (totalSpace > 1024 * 1024 * 1024) {
            // Convert to GB if larger than 1GB
            totalSpaceFormatted = (totalSpace / (1024 * 1024 * 1024)).toFixed(2)
            totalSpaceUnit = "GB"
          } else {
            totalSpaceFormatted = (totalSpace / (1024 * 1024)).toFixed(2)
            totalSpaceUnit = "MB"
          }
          
          // Calculate percentage
          const percentage = totalSpace > 0 ? (memosSize / totalSpace) * 100 : 0
          
          setStorageInfo({
            used: parseFloat(memosSizeMB.toFixed(2)),
            total: parseFloat(totalSpaceFormatted),
            percentage: parseFloat(percentage.toFixed(1))
          })
        } else {
          // Fallback if Storage API is not available
          setStorageInfo({
            used: parseFloat(memosSizeMB.toFixed(2)),
            total: 100, // Default value
            percentage: parseFloat((memosSizeMB / 100 * 100).toFixed(1))
          })
        }
      } catch (error) {
        console.error("Error calculating storage:", error)
        // Fallback values
        setStorageInfo({ used: 0, total: 100, percentage: 0 })
      }
    }
    
    calculateStorage()
    
    // Recalculate when dialog opens
    if (open) {
      calculateStorage()
    }
  }, [open, getMemos])

  // Info tab content
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
    </div>
  )

  // Settings tab content
  const settingsContent = (
    <div className="mt-4 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Storage</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Used Storage</span>
          <span className="text-gray-500">
            {storageInfo.used} MB / {storageInfo.total} {storageInfo.total > 1000 ? "GB" : "MB"}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-[#FC7434] h-2.5 rounded-full" 
            style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
          ></div>
        </div>
        <Button 
          variant="outline" 
          className="mt-2 text-sm w-full border-gray-300 hover:bg-gray-100 hover:text-gray-900"
          onClick={clearMemos}
        >
          Clear All Memos
        </Button>
      </div>
    </div>
  )

  // Help tab content
  const helpContent = (
    <div className="mt-4 space-y-6 text-gray-500">
      <h3 className="font-semibold text-black">Frequently Asked Questions</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-black">How do I create a new memo?</h4>
          <p>Press the SPEAK button and start talking. Your voice will be recorded and transcribed automatically.</p>
        </div>
        
        <div>
          <h4 className="font-medium text-black">Can I edit my memos?</h4>
          <p>Yes, you can access and edit your memos by pressing CMMD + K or clicking OPEN on mobile.</p>
        </div>
        
        <div>
          <h4 className="font-medium text-black">How do I create an app from my memos?</h4>
          <p>Select a memo and use the AIM integration to generate a simple application based on your memo content.</p>
        </div>
        
        <div>
          <h4 className="font-medium text-black">Is my data secure?</h4>
          <p>All your memos are stored locally in your browser. We don't store any of your data on our servers.</p>
        </div>
      </div>
      
      <hr className="border-t border-gray-300" />
      
      <div>
        <h3 className="font-semibold text-black">Need more help?</h3>
        <p className="mt-2">
          Contact us at{" "}
          <a
            href="mailto:support@memos.app"
            className="hover:underline text-[#FC7434] hover:text-[#BF6236]"
          >
            support@memos.app
          </a>
        </p>
      </div>
    </div>
  )

  const renderContent = () => (
    <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
      <TabsList className="grid grid-cols-3 mb-4 flex-shrink-0">
        <TabsTrigger value="info" className="flex items-center gap-1">
          <InfoIcon size={16} />
          <span>Info</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-1">
          <SettingsIcon size={16} />
          <span>Settings</span>
        </TabsTrigger>
        <TabsTrigger value="help" className="flex items-center gap-1">
          <HelpCircle size={16} />
          <span>Help</span>
        </TabsTrigger>
      </TabsList>
      
      <div className="flex-grow overflow-y-auto pr-1">
        <TabsContent value="info" className="text-gray-900 h-full m-0">
          {infoContent}
        </TabsContent>
        
        <TabsContent value="settings" className="text-gray-900 h-full m-0">
          {settingsContent}
        </TabsContent>
        
        <TabsContent value="help" className="text-gray-900 h-full m-0">
          {helpContent}
        </TabsContent>
      </div>
    </Tabs>
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
          <DialogContent className="max-w-md h-[600px] flex flex-col overflow-hidden">
            <DialogHeader className="flex-shrink-0">
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
            <div className="flex-grow overflow-hidden">
              {renderContent()}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="p-4 h-[500px] flex flex-col overflow-hidden">
            <DrawerHeader className="flex-shrink-0 p-0">
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
            <div className="flex-grow overflow-hidden">
              {renderContent()}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
