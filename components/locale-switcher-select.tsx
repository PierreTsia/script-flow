"use client";

import { setUserLocale } from "@/services/locale";
import { Locale } from "@/components/providers/intl-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

type LocaleSwitcherSelectProps = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

export function LocaleSwitcherSelect({
  defaultValue,
  items,
  label,
}: LocaleSwitcherSelectProps) {
  const router = useRouter();
  const onChange = (value: string) => {
    const locale = value as Locale;
    setUserLocale(locale);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((locale) => (
          <DropdownMenuItem
            key={locale.value}
            onClick={() => onChange(locale.value)}
            className={defaultValue === locale.value ? "bg-accent" : ""}
          >
            {locale.label.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
