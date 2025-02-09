"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

import { useAuth } from "@clerk/nextjs";

export default function TestUserCard() {
  const t = useTranslations("HomePage");
  const { user } = useUser();
  const { signOut } = useAuth();
  if (!user) {
    return null;
  }
  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-foreground">
          {t("welcome", { name: user.firstName })}
        </CardTitle>
        <CardDescription>{user.emailAddresses[0].emailAddress}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Explore components, experiment with layouts, and build something
          amazing. Perfect for prototyping and learning.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          {t("logout")}
        </Button>
        <Button variant="link" className="hover:underline">
          View Examples →
        </Button>
      </CardFooter>
    </Card>
  );
}
