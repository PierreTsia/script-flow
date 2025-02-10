import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import LocaleSwitcher from "@/components/locale-switcher";
import { UserButton } from "@clerk/nextjs";
import { ScriptUploadCard } from "@/components/script-upload-card";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content Area */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 min-w-full">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">ScriptFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <UserButton signInUrl="/sign-in" />
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 sm:px-6 py-8 mx-auto">
        <div className="max-w-4xl mx-auto space-y-12">
          <ScriptUploadCard />

          {/* Script List Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Recent Scripts</h3>
              <Button variant="outline" disabled>
                New Script
              </Button>
            </div>
            <div className="h-96 bg-muted/50 rounded-lg border flex items-center justify-center">
              <p className="text-muted-foreground">No scripts uploaded yet</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
