"use client"

import { FileEditor } from "@/components/file-editor";
import Navbar from "@/components/navbar";
import Wallet from "@/components/wallet";

export default function Home() {
  return (
    <>
      <div className="fixed inset-0 pt-12 flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,#ffffff_30%,#cccccc_100%)]">
        <FileEditor />
      </div>
      <Navbar />
    </>
  );
}
