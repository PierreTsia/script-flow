import { UserButton } from "@clerk/nextjs";
import LocaleSwitcher from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
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
  );
}
