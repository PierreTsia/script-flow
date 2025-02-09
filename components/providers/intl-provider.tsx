import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export type Locale = (typeof locales)[number];

export const locales = ["en", "fr"] as const;
export const defaultLocale: Locale = "en";

export async function IntlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
