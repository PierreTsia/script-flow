import { ScriptUploadCard } from "@/components/script-upload-card";
export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 space-y-4">
      <ScriptUploadCard />
    </div>
  );
}

/* import { ScriptUploadCard } from "@/components/script-upload-card";
import { ScriptsListCard } from "@/components/scripts-list-card";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container px-4 sm:px-6 py-8 mx-auto">
        <div className="max-w-4xl mx-auto space-y-12">
          <ScriptUploadCard />
          <ScriptsListCard />
        </div>
        <Toaster />
      </main>
    </div>
  );
}
 */
