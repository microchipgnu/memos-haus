"use client"

import { Conversation } from '@/components/conversation';
import Navbar from "@/components/navbar"
import { FileEditor } from "@/components/file-editor"
export default function Home() {
  return (
    <>
      <Navbar />
      <div className="fixed inset-0 pt-12 flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,#ffffff_30%,#cccccc_100%)]">
        <Conversation />
        <FileEditor files={[]} />
      </div>
    </>
  );
}
