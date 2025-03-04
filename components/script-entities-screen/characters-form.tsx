import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useSceneEntities from "@/hooks/useSceneEntities";
import { useState, useEffect } from "react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash2Icon, PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { EntitiesFormProps } from "../scene-analysis-confirm-dialog";
const EMPTY_CHARACTER = {
  name: "",
  type: "PRINCIPAL",
  notes: "",
} as const;

const CharactersForm = ({
  scriptId,
  sceneId,
  selectedDraftAnalysis,
  onNextTab,
  children,
}: EntitiesFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("SceneAnalysis");

  const { addCharacterInScene } = useSceneEntities();

  const characterFormSchema = z.object({
    name: z.string().min(2).max(50),
    type: z.enum([
      "PRINCIPAL",
      "SUPPORTING",
      "FEATURED_EXTRA",
      "SILENT_KEY",
      "ATMOSPHERE",
    ]),
    notes: z.string().optional(),
    aliases: z.array(z.string()).optional(),
  });

  const form = useForm<{ characters: z.infer<typeof characterFormSchema>[] }>({
    resolver: zodResolver(
      z.object({ characters: z.array(characterFormSchema) })
    ),
    defaultValues: {
      characters: [],
    },
  });

  const { reset } = form;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "characters",
  });

  useEffect(() => {
    if (selectedDraftAnalysis?.characters) {
      reset({ characters: selectedDraftAnalysis.characters });
    }
  }, [selectedDraftAnalysis, reset]);

  const onSubmit = async (data: {
    characters: z.infer<typeof characterFormSchema>[];
  }) => {
    try {
      setIsLoading(true);
      if (!sceneId) {
        throw new Error("Scene ID is required");
      }
      const characterIds = await Promise.all(
        data.characters.map((char) => {
          const characterId = addCharacterInScene({
            scriptId,
            sceneId,
            name: char.name,
            type: char.type,
            aliases: char.aliases,
            notes: char.notes,
          });
          return characterId;
        })
      );

      const allSuccessful = characterIds.every(Boolean);

      if (allSuccessful) {
        toast({
          title: "Characters saved",
          description: "Characters saved successfully",
        });
        onNextTab();
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
    <div className="space-y-6 px-0 md:px-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id="character-form">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative space-y-4 border p-4 rounded-lg mb-4"
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="hover:text-red-500 absolute top-2 right-2"
                  onClick={() => remove(index)}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>

                <div className="flex flex-col sm:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name={`characters.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t("character.name")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`characters.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-[200px]">
                        <FormLabel>{t("character.type")}</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("character.type")} />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "PRINCIPAL",
                                "SUPPORTING",
                                "FEATURED_EXTRA",
                                "SILENT_KEY",
                                "ATMOSPHERE",
                              ].map((type) => (
                                <SelectItem key={type} value={type}>
                                  {t(`characterType.${type}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`characters.${index}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("character.notes")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("character.notes")}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </form>
      </Form>

      <Button
        type="button"
        variant="ghost"
        onClick={() => append(EMPTY_CHARACTER)}
      >
        {" "}
        <PlusIcon className="w-4 h-4" />
        {t("addCharacter")}
      </Button>

      <AlertDialogFooter className="flex justify-end gap-2">
        <Button type="submit" form="character-form" disabled={isLoading}>
          {t("confirmSave.characters")}
        </Button>
        {children}
      </AlertDialogFooter>

      {!selectedDraftAnalysis?.characters?.length && (
        <div className="text-center text-muted-foreground py-8">
          {t("noCharacters")}
        </div>
      )}
    </div>
  );
};

export default CharactersForm;
