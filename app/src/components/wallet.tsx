"use client";
import { useAccount } from "wagmi";
import '@reown/appkit/react';

export default function Wallet() {
  const { isConnected } = useAccount();
  return (
    <div className="flex items-center gap-2 bg-black rounded-full">
      {/* @ts-ignore */}
      <appkit-button size="sm" />
      {/* @ts-ignore */}
      {isConnected && <appkit-network-button size="sm" />}
    </div>
  );
}