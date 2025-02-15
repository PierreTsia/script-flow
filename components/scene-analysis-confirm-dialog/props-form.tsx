import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useSceneEntities from "@/hooks/useSceneEntities";
import { useState, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useFieldArray } from "react-hook-form";
import { DraftSceneAnalysis } from "@/hooks/useScene";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { TabType } from "./entities-tabs";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";

const EMPTY_PROP = {
  name: "",
  quantity: 1,
  notes: "",
} as const;

interface PropsFormProps {
  scriptId: Id<"scripts">;
  sceneId: Id<"scenes"> | null;
  selectedDraftAnalysis: DraftSceneAnalysis | null;
  setCurrentTab: (tab: TabType) => void;
  children: React.ReactNode;
}

const PropsForm = ({
  scriptId,
  sceneId,
  selectedDraftAnalysis,
  setCurrentTab,
  children,
}: PropsFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("SceneAnalysis");

  const { createProp } = useSceneEntities();

  const propFormSchema = z.object({
    name: z.string().min(2).max(50),
    quantity: z.number().min(1),
    notes: z.string().optional(),
  });

  const form = useForm<{ props: z.infer<typeof propFormSchema>[] }>({
    resolver: zodResolver(z.object({ props: z.array(propFormSchema) })),
    defaultValues: {
      props: [],
    },
  });

  const { reset } = form;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "props",
  });

  useEffect(() => {
    if (selectedDraftAnalysis?.props) {
      console.log("selectedDraftAnalysis.props", selectedDraftAnalysis.props);
      reset({ props: selectedDraftAnalysis.props });
    }
  }, [selectedDraftAnalysis, reset]);

  const onSubmit = async (data: {
    props: z.infer<typeof propFormSchema>[];
  }) => {
    try {
      setIsLoading(true);
      if (!sceneId) {
        throw new Error("Scene ID is required");
      }
      const propIds = await Promise.all(
        data.props.map((prop) => {
          const propId = createProp({
            scriptId,
            sceneId,
            name: prop.name,
            quantity: prop.quantity,
            notes: prop.notes,
          });
          console.log("propId", propId);
          return propId;
        })
      );

      const allSuccessful = propIds.every(Boolean);

      if (allSuccessful) {
        setCurrentTab("characters");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      toast({
        title: "Submission failed",
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-6 px-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id="character-form">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-4 border p-4 rounded-lg mb-4"
              >
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`props.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("prop.name")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-1/5">
                    <FormField
                      control={form.control}
                      name={`props.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("prop.quantity")}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name={`props.${index}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("prop.notes")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder={t("prop.notes")} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2Icon className="w-4 h-4" />
                  {t("removeProp")}
                </Button>
              </div>
            ))}
          </div>
        </form>
      </Form>

      <Button type="button" variant="ghost" onClick={() => append(EMPTY_PROP)}>
        {t("addProp")}
      </Button>

      <AlertDialogFooter>
        <Button type="submit" form="character-form" disabled={isLoading}>
          {t("confirmSaveButton")}
        </Button>
        {children}
      </AlertDialogFooter>

      {!selectedDraftAnalysis?.props?.length && (
        <div className="text-center text-muted-foreground py-8">
          {t("noProps")}
        </div>
      )}
    </div>
  );
};

export default PropsForm;
