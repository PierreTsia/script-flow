import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Script Analysis",
};

export default function ScriptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-hidden">
        {children}
        <Toaster />
      </div>
    </div>
  );
}
