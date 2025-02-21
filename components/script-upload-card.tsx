"use client";

import { FileDropZone } from "@/components/file-drop-zone";
import { toast } from "@/hooks/use-toast";
import { useScripts } from "@/hooks/useScripts";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const scriptUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type ScriptUploadSchema = z.infer<typeof scriptUploadSchema>;

export function ScriptUploadCard() {
  const { uploadScript } = useScripts();
  const [isUploading, setIsUploading] = useState(false);
  const t = useTranslations("Scripts");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const form = useForm<ScriptUploadSchema>({
    resolver: zodResolver(scriptUploadSchema),
    defaultValues: {
      title: "",
    },
  });

  const handleFileAccepted = async (file: File) => {
    setSelectedFile(file);
  };

  const handleFileSelected = (file: File) => {
    form.setValue("title", file.name.replace(".pdf", ""));

    setSelectedFile(file);
  };

  const onSubmit = async (values: ScriptUploadSchema) => {
    if (!selectedFile) return;
    setIsUploading(true);

    try {
      await uploadScript(selectedFile, values.title);
      toast({
        title: t("uploadSuccess"),
      });
      router.push("/scripts");
    } catch (error) {
      console.error(error);
      toast({
        title: t("uploadError"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("upload")}</CardTitle>
        <CardDescription>{t("uploadDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed rounded-xl p-8 text-center">
          <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
            <FileDropZone
              onFileAccepted={handleFileAccepted}
              onFileSelected={handleFileSelected}
            />
          </div>
        </div>

        {selectedFile && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("scriptTitle")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("scriptTitlePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? t("saving") : t("saveScript")}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
