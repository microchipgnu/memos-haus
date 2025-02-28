"use client";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import '@reown/appkit/react';
import { useState } from "react";
import { useAccount } from "wagmi";

export default function Wallet() {
    const { isConnected } = useAccount();
    const [open, setOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="secondarycustom"
                    className="w-14 h-14 p-0 p-0 text-xs font-medium relative group"
                    onClick={() => setOpen(true)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    aria-label={isConnected ? "Connected wallet" : "Connect wallet"}
                >
                    <div className="flex flex-col items-center justify-center w-full h-full relative">
                        <div
                            className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full transition-all duration-600 
                            ${isConnected 
                                ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse' 
                                : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)] animate-pulse'
                            } border border-white`}
                        />
                        <span className={`mt-1 text-[10px] font-medium transition-colors duration-300 ${
                            isHovered ? 'text-zinc-900' : 'text-zinc-600'
                        }`}>
                            {isConnected ? 'WALLET' : 'CONNECT'}
                        </span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-3 bg-gradient-to-r from-zinc-900 to-black border-none rounded-xl flex items-center gap-3 shadow-xl animate-in fade-in-50 zoom-in-95 duration-200"
                sideOffset={10}
            >
                {/* @ts-ignore */}
                <appkit-button size="sm" />
                {/* @ts-ignore */}
                {isConnected && <appkit-network-button size="sm" />}
            </PopoverContent>
        </Popover>
    );
}