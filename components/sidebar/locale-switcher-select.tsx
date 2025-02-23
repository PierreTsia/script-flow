"use client";

import { setUserLocale } from "@/services/locale";
import { Locale } from "@/components/providers/intl-provider";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const onValueChange = (value: string) => {
    const locale = value as Locale;
    setUserLocale(locale);
    router.refresh();
  };

  return (
    <Select
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      onOpenChange={() => {
        const event = window.event;
        event?.stopPropagation();
      }}
    >
      <SelectTrigger
        className="min-w-[140px] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Globe className="mr-2 h-[1.2rem] w-[1.2rem]" />
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {items.map((locale) => (
          <SelectItem
            key={locale.value}
            value={locale.value}
            onClick={(e) => e.stopPropagation()}
          >
            {locale.label.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
