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
import { BookOpen, HelpCircle, Info as InfoIcon, Plus, Settings as SettingsIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { elevenlabsVoices } from "@/lib/elevenlabs/config"

export default function Info() {
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [activeTab, setActiveTab] = useState("info")
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0, percentage: 0, unit: "MB" })
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [showDeletePrompt, setShowDeletePrompt] = useState(false)
  const { clearMemos, memos, saveMemo } = useStorage()
  const [selectedVoice, setSelectedVoice] = useState(elevenlabsVoices[0]?.id || "")

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
        
        // Format the size with appropriate unit
        let usedValue = memosSize;
        let usedUnit = "B";
        
        if (memosSize >= 1024 * 1024) {
          // Convert to MB if larger than 1MB
          usedValue = memosSize / (1024 * 1024);
          usedUnit = "MB";
        } else if (memosSize >= 1024) {
          // Convert to KB if larger than 1KB
          usedValue = memosSize / 1024;
          usedUnit = "KB";
        }
        
        // Get device storage information if available
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate()
          const totalSpace = estimate.quota || 0
          const usedSpace = estimate.usage || 0
          
          // Convert to appropriate unit as needed
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
            used: parseFloat(usedValue.toFixed(2)),
            total: parseFloat(totalSpaceFormatted),
            percentage: parseFloat(percentage.toFixed(1)),
            unit: usedUnit
          })
        } else {
          // Fallback if Storage API is not available
          setStorageInfo({
            used: parseFloat(usedValue.toFixed(2)),
            total: 100, // Default value
            percentage: parseFloat((memosSize / (100 * 1024 * 1024) * 100).toFixed(1)),
            unit: usedUnit
          })
        }
      } catch (error) {
        console.error("Error calculating storage:", error)
        // Fallback values
        setStorageInfo({ used: 0, total: 100, percentage: 0, unit: "B" })
      }
    }
    
    calculateStorage()
    
    // Recalculate when dialog opens
    if (open) {
      calculateStorage()
    }
  }, [open, getMemos])

  const handleClearMemos = () => {
    setShowDeletePrompt(true)
  }

  const handleDeleteConfirmation = () => {
    if (deleteConfirmation.toLowerCase() === "delete all memos") {
      clearMemos()
      setShowDeletePrompt(false)
      setDeleteConfirmation("")
    }
  }

  const handleAddTemplate = (templateText: string, templateName: string) => {
    saveMemo({
      id: `${templateName}-${new Date().toISOString()}`,
      name: templateName,
      content: templateText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isTemplate: true
    });
  }

  // Info tab content
  const infoContent = (
    <div className="mt-4 space-y-6 text-gray-500">
      <p className="font-semibold" style={{ color: "#000000" }}>
        Intelligent voice memos that generate personal software<span style={{ color: "#FC7434" }}>.</span>
      </p>
      <hr className="border-t border-gray-300" />
      <p>
        Press <span style={{ color: "#000000" }} className="font-semibold">START</span> and say anything that you wish to record as a voice memo.
      </p>
      <p>All your memos will be organized and maintained by AI Agents.</p>
      <p>
        Press <span style={{ color: "#000000" }} className="font-semibold">CMD + K</span> (or click{" "}
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

  // Library tab content
  const libraryContent = (
    <div className="mt-4 space-y-6">
      <h3 className="text-lg font-medium">Template Library</h3>
      <p className="text-sm text-gray-500">Install these templates to your memos collection.</p>
      
      <div className="grid grid-cols-1 gap-4 mt-4">
        <div className="border border-gray-200 rounded-lg p-4 hover:border-[#FC7434] transition-colors">
          <h4 className="font-medium text-black mb-2">Daily Journal</h4>
          <p className="text-gray-500 text-sm mb-3">A template for daily reflections and planning.</p>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3 max-h-24 overflow-y-auto">
            <pre className="whitespace-pre-wrap">
              # Daily Journal - {new Date().toLocaleDateString()}
              
              ## How I'm feeling today:
              
              ## Top 3 priorities:
              1. 
              2. 
              3. 
              
              ## Notes & thoughts:
              
              ## Tomorrow's focus:
            </pre>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-xs border-gray-300 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => handleAddTemplate(`# Daily Journal - ${new Date().toLocaleDateString()}\n\n## How I'm feeling today:\n\n## Top 3 priorities:\n1. \n2. \n3. \n\n## Notes & thoughts:\n\n## Tomorrow's focus:`, "Daily Journal")}
          >
            <Plus size={14} className="mr-1" /> Add to Memos
          </Button>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 hover:border-[#FC7434] transition-colors">
          <h4 className="font-medium text-black mb-2">Project Plan</h4>
          <p className="text-gray-500 text-sm mb-3">Outline for planning a new project.</p>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3 max-h-24 overflow-y-auto">
            <pre className="whitespace-pre-wrap">
              # Project: [Project Name]
              
              ## Objective:
              
              ## Key Deliverables:
              - 
              - 
              
              ## Timeline:
              - Start date: 
              - End date: 
              
              ## Resources needed:
            </pre>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-xs border-gray-300 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => handleAddTemplate(`# Project: [Project Name]\n\n## Objective:\n\n## Key Deliverables:\n- \n- \n\n## Timeline:\n- Start date: \n- End date: \n\n## Resources needed:`, "Project Plan")}
          >
            <Plus size={14} className="mr-1" /> Add to Memos
          </Button>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 hover:border-[#FC7434] transition-colors">
          <h4 className="font-medium text-black mb-2">Meeting Notes</h4>
          <p className="text-gray-500 text-sm mb-3">Template for capturing meeting details.</p>
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3 max-h-24 overflow-y-auto">
            <pre className="whitespace-pre-wrap">
              # Meeting: [Title]
              Date: {new Date().toLocaleDateString()}
              
              ## Attendees:
              - 
              
              ## Agenda:
              1. 
              2. 
              
              ## Discussion Points:
              
              ## Action Items:
              - [ ] 
              - [ ] 
              
              ## Next Steps:
            </pre>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full text-xs border-gray-300 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => handleAddTemplate(`# Meeting: [Title]\nDate: ${new Date().toLocaleDateString()}\n\n## Attendees:\n- \n\n## Agenda:\n1. \n2. \n\n## Discussion Points:\n\n## Action Items:\n- [ ] \n- [ ] \n\n## Next Steps:`, "Meeting Notes")}
          >
            <Plus size={14} className="mr-1" /> Add to Memos
          </Button>
        </div>
      </div>
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
            {storageInfo.used} {storageInfo.unit} / {storageInfo.total} {storageInfo.total > 1000 ? "GB" : "MB"}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-[#FC7434] h-2.5 rounded-full" 
            style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
          ></div>
        </div>
        {showDeletePrompt ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-700">Type "delete all memos" to confirm:</p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded"
              placeholder="delete all memos"
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="mt-2 text-sm flex-1 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => {
                  setShowDeletePrompt(false)
                  setDeleteConfirmation("")
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                className="mt-2 text-sm flex-1"
                onClick={handleDeleteConfirmation}
                disabled={deleteConfirmation.toLowerCase() !== "delete all memos"}
              >
                Confirm
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="mt-2 text-sm w-full border-gray-300 hover:bg-gray-100 hover:text-gray-900"
            onClick={handleClearMemos}
          >
            Clear All Memos
          </Button>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium">Voice Settings</h3>
        <p className="text-sm text-gray-500">Select your preferred voice option</p>
        
        <RadioGroup
          value={selectedVoice}
          onValueChange={setSelectedVoice}
          className="space-y-3 p-2"
        >
          {elevenlabsVoices.map(voice => (
            <div key={voice.id} className="flex items-center space-x-2">
              <RadioGroupItem value={voice.id} id={voice.id} />
              <Label htmlFor={voice.id}>{voice.name}</Label>
            </div>
          ))}
        </RadioGroup>
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
          <p>Yes, you can access and edit your memos by pressing CMD + K or clicking OPEN on mobile.</p>
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
          Contact me at{" "}
          <a
            href="https://x.com/microchipgnu"
            className="hover:underline text-[#FC7434] hover:text-[#BF6236]"
          >
            @microchipgnu
          </a>
        </p>
      </div>
    </div>
  )

  const renderContent = () => (
    <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
      <TabsList className="grid grid-cols-4 mb-4 flex-shrink-0">
        <TabsTrigger value="info" className="flex items-center gap-1">
          <InfoIcon size={16} />
          <span>Info</span>
        </TabsTrigger>
        <TabsTrigger value="library" className="flex items-center gap-1">
          <BookOpen size={16} />
          <span>Library</span>
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
        
        <TabsContent value="library" className="text-gray-900 h-full m-0">
          {libraryContent}
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
        <span className="mt-1 text-[10px] font-medium">CONFIG</span>
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
