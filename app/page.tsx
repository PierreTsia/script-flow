import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import LocaleSwitcher from "@/components/locale-switcher";
import TestUserCard from "@/components/test-user-card";
import { apiFetch } from "@/lib/api-fetch";
import { TaskList } from "@/components/task-list";
import { useTasks } from "@/hooks/useTasks";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default async function Home() {
  /*   const tasks = await data.json();
  console.log(tasks); */

  // Mock data - replace with real data later

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button>Get Started</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <TestUserCard />
          <TaskList />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <ThemeToggle />
        <LocaleSwitcher />
      </footer>
    </div>
  );
}
