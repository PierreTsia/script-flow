import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DraftSceneAnalysis } from "@/hooks/useScene";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  Form,
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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import useSceneEntities from "@/hooks/useSceneEntities";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { Trash2Icon } from "lucide-react";
const EMPTY_CHARACTER = {
  name: "",
  type: "PRINCIPAL",
  notes: "",
} as const;

export const SceneAnalysisConfirmDialog = ({
  selectedDraftAnalysis,
  children,
  isOpen,
  setIsOpen,
}: {
  selectedDraftAnalysis: DraftSceneAnalysis | null;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const { toast } = useToast();
  const t = useTranslations("SceneAnalysis");

  const params = useParams();
  const scriptId = params.scriptId as Id<"scripts">;

  const [currentTab, setCurrentTab] = useState<
    "locations" | "characters" | "props"
  >("locations");

  const [isLoading, setIsLoading] = useState(false);

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
      await Promise.all(
        data.characters.map((char) =>
          createCharacter(char.name, char.type, char.aliases, char.notes)
        )
      );
      toast({ title: `${data.characters.length} characters saved` });
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
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-4xl h-[80vh]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">
            {t("saveConfirmationTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("saveConfirmationDescription", {
              sceneNumber: selectedDraftAnalysis?.scene_number,
              locationsCount: selectedDraftAnalysis?.locations?.length,
              charactersCount: selectedDraftAnalysis?.characters?.length,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="pr-4 h-[calc(80vh-180px)]">
          <Tabs
            value={currentTab}
            onValueChange={(v) =>
              setCurrentTab(v as "locations" | "characters" | "props")
            }
          >
            <TabsList className="grid grid-cols-3 w-full mb-4">
              {["locations", "characters", "props"].map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {t(tab)}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Locations Tab */}
            <TabsContent value="locations">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    {t("location.name")}
                  </label>
                  <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Central Perk Cafe"
                  />
                </div>
                {/* Add more location fields */}
              </div>
            </TabsContent>

            {/* Characters Tab */}
            <TabsContent value="characters">
              <div className="space-y-6 px-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    id="character-form"
                  >
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
                                      <SelectValue
                                        placeholder={t("character.type")}
                                      />
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
            </TabsContent>

            {/* Props Tab */}
            <TabsContent value="props">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    {t("prop.name")}
                  </label>
                  <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Orange Sofa"
                  />
                </div>
                {/* Add more prop fields */}
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("cancelButton")}
          </Button>
          <Button type="submit" form="character-form">
            {t("confirmSaveButton")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SceneAnalysisConfirmDialog;
