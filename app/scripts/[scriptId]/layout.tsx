import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Script Analysis",
};

export default function ScriptLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { scriptId: string };
}) {
  return (
    <div className="flex h-full">
      {/* Shared layout elements */}
      {children}
    </div>
  );
}
