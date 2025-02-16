import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Id } from "@/convex/_generated/dataModel";
import { DraftSceneAnalysis } from "@/hooks/useScene";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface SceneInfoFormProps {
  scriptId: Id<"scripts">;
  selectedDraftAnalysis: DraftSceneAnalysis | null;
  children: React.ReactNode;
  onCreateScene: ({
    script_id,
    scene_number,
    page_number,
    text,
    summary,
  }: {
    script_id: Id<"scripts">;
    scene_number: string;
    page_number: number;
    text: string;
    summary: string;
  }) => Promise<void>;
}

const SceneInfoForm = ({
  scriptId,
  selectedDraftAnalysis,
  onCreateScene,
  children,
}: SceneInfoFormProps) => {
  const t = useTranslations("SceneAnalysis");

  const sceneInfoFormSchema = z.object({
    scene_number: z.string(),
    page_number: z.number(),
    text: z.string(),
    summary: z.string().optional(),
  });

  const form = useForm<z.infer<typeof sceneInfoFormSchema>>({
    resolver: zodResolver(sceneInfoFormSchema),
    defaultValues: {
      scene_number: "",
      page_number: 0,
      text: "",
      summary: "",
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (selectedDraftAnalysis) {
      reset({
        scene_number: selectedDraftAnalysis.scene_number || "",
        page_number: selectedDraftAnalysis.page_number,
        text: selectedDraftAnalysis.text,
        summary: selectedDraftAnalysis.summary || "",
      });
    }
  }, [selectedDraftAnalysis, reset]);

  const onSubmit = async ({
    scene_number,
    page_number,
    text,
    summary,
  }: z.infer<typeof sceneInfoFormSchema>) => {
    await onCreateScene({
      script_id: scriptId,
      scene_number,
      page_number,
      text,
      summary: summary || "",
    });
  };
  return (
    <div className="space-y-6 px-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id="scene-info-form">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="scene_number"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-4">
                    <FormLabel>{t("scene_number")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="page_number"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-4">
                    <FormLabel>{t("page_number")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-4">
                    <FormLabel>{t("summary")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="resize-none" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-4">
                    <FormLabel>{t("text")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="resize-none" rows={10} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
          <AlertDialogFooter>
            <Button type="submit" form="scene-info-form">
              {t("confirmSaveButton")}
            </Button>
            {children}
          </AlertDialogFooter>
        </form>
      </Form>
    </div>
  );
};

export default SceneInfoForm;
