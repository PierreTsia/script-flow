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
    <div className="flex h-full">
      {/* Shared layout elements */}
      {children}
    </div>
  );
}
