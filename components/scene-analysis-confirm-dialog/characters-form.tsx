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
import { Id } from "@/convex/_generated/dataModel";
import { useFieldArray } from "react-hook-form";
import { DraftSceneAnalysis } from "@/hooks/useScene";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { TabType } from "./entities-tabs";

const EMPTY_CHARACTER = {
  name: "",
  type: "PRINCIPAL",
  notes: "",
} as const;

const CharactersForm = ({
  scriptId,
  sceneId,
  selectedDraftAnalysis,
  setCurrentTab,
}: {
  scriptId: Id<"scripts">;
  sceneId: Id<"scenes"> | null;
  selectedDraftAnalysis: DraftSceneAnalysis | null;
  setCurrentTab: (tab: TabType) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("SceneAnalysis");

  const { createCharacter } = useSceneEntities(scriptId);

  const characterFormSchema = z.object({
    name: z.string().min(2).max(50),
    type: z.enum(["PRINCIPAL", "SECONDARY", "FIGURANT", "SILHOUETTE", "EXTRA"]),
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "characters",
  });

  useEffect(() => {
    if (selectedDraftAnalysis?.characters) {
      form.reset({ characters: selectedDraftAnalysis.characters });
    }
  }, [selectedDraftAnalysis]);

  const onSubmit = async (data: {
    characters: z.infer<typeof characterFormSchema>[];
  }) => {
    try {
      setIsLoading(true);
      if (!sceneId) {
        throw new Error("Scene ID is required");
      }
      await Promise.all(
        data.characters.map((char) =>
          createCharacter(
            sceneId,
            char.name,
            char.type,
            char.aliases,
            char.notes
          )
        )
      );
      toast({ title: `${data.characters.length} characters saved` });
      setCurrentTab("locations");
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
                <FormField
                  control={form.control}
                  name={`characters.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
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
                    <FormItem>
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
                              "SECONDARY",
                              "FIGURANT",
                              "SILHOUETTE",
                              "EXTRA",
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
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2Icon className="w-4 h-4" />
                  {t("removeCharacter")}
                </Button>
              </div>
            ))}
          </div>
        </form>
      </Form>

      <Button type="button" onClick={() => append(EMPTY_CHARACTER)}>
        {t("addCharacter")}
      </Button>

      {!selectedDraftAnalysis?.characters?.length && (
        <div className="text-center text-muted-foreground py-8">
          {t("noCharacters")}
        </div>
      )}
    </div>
  );
};

export default CharactersForm;
