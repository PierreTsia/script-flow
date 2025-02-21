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
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SceneInfoFormProps {
  scriptId: Id<"scripts">;
  selectedDraftAnalysis: DraftSceneAnalysis | null;
  children: React.ReactNode;
  sceneId: Id<"scenes"> | null;
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
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    undefined
  );

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
    console.log("text", text);
    await onCreateScene({
      script_id: scriptId,
      scene_number,
      page_number,
      text,
      summary: summary || "",
    });
  };
  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="scene-info-form"
          className="flex flex-col h-full"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-6">
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

            <Accordion
              type="single"
              className="w-full mb-8"
              value={accordionValue}
              onValueChange={setAccordionValue}
              collapsible
            >
              <AccordionItem value="text">
                <AccordionTrigger>{t("text")}</AccordionTrigger>
                <AccordionContent>
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormControl>
                          <ScrollArea className="h-[250px]">
                            <Textarea
                              {...field}
                              className="resize-none"
                              rows={10}
                            />
                          </ScrollArea>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <AlertDialogFooter className="w-full bg-background border-t px-6 py-4">
            <Button type="submit" form="scene-info-form">
              {t("confirmSave.sceneInfo")}
            </Button>
            {children}
          </AlertDialogFooter>
        </form>
      </Form>
    </div>
  );
};

export default SceneInfoForm;
