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

export default function Info() {
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const updateSize = () => setIsDesktop(window.innerWidth >= 768)
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

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
            <DialogHeader>
              <DialogTitle>Information</DialogTitle>
              <DialogDescription>Subheading for Info</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <p>This is placeholder INFO content. Add whatever you need here.</p>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Information</DrawerTitle>
              <DrawerDescription>Subheading for Info</DrawerDescription>
            </DrawerHeader>
            <div className="mt-4">
              <p>This is placeholder INFO content. Add whatever you need here.</p>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
