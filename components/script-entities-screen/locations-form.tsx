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

const EMPTY_LOCATION = {
  name: "",
  type: "INT",
  time_of_day: "DAY",
  notes: "",
} as const;

const LocationsForm = ({
  scriptId,
  sceneId,
  selectedDraftAnalysis,
  onNextTab,
  children,
}: EntitiesFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("SceneAnalysis");

  const { addLocationInScene } = useSceneEntities();

  const locationFormSchema = z.object({
    name: z.string().min(2).max(50),
    type: z.enum(["INT", "EXT"]),
    time_of_day: z.enum(["DAY", "NIGHT", "DAWN", "DUSK", "UNSPECIFIED"]),
    notes: z.string().optional(),
  });

  const form = useForm<{ locations: z.infer<typeof locationFormSchema>[] }>({
    resolver: zodResolver(z.object({ locations: z.array(locationFormSchema) })),
    defaultValues: {
      locations: [],
    },
  });

  const { reset } = form;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "locations",
  });

  useEffect(() => {
    if (selectedDraftAnalysis?.locations) {
      reset({ locations: selectedDraftAnalysis.locations });
    }
  }, [selectedDraftAnalysis, reset]);

  const onSubmit = async (data: {
    locations: z.infer<typeof locationFormSchema>[];
  }) => {
    try {
      setIsLoading(true);
      if (!sceneId) {
        throw new Error("Scene ID is required");
      }
      const locationIds = await Promise.all(
        data.locations.map((location) => {
          const locationId = addLocationInScene({
            scriptId,
            sceneId,
            name: location.name,
            type: location.type,
            time_of_day: location.time_of_day,
            notes: location.notes,
          });
          return locationId;
        })
      );

      const allSuccessful = locationIds.every(Boolean);

      if (allSuccessful) {
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

                <FormField
                  control={form.control}
                  name={`locations.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("location.name")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name={`locations.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t("location.type")}</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("location.type")} />
                            </SelectTrigger>
                            <SelectContent>
                              {["INT", "EXT"].map((type) => (
                                <SelectItem key={type} value={type}>
                                  {t(`locationType.${type}`)}
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
                    name={`locations.${index}.time_of_day`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t("location.timeOfDay")}</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("location.timeOfDay")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "DAY",
                                "NIGHT",
                                "DAWN",
                                "DUSK",
                                "UNSPECIFIED",
                              ].map((timeOfDay) => (
                                <SelectItem key={timeOfDay} value={timeOfDay}>
                                  {t(`timeOfDay.${timeOfDay.toLowerCase()}`)}
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
                  name={`locations.${index}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("location.notes")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("location.notes")}
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
        onClick={() => append(EMPTY_LOCATION)}
      >
        <PlusIcon className="w-4 h-4" />
        {t("addLocation")}
      </Button>

      <AlertDialogFooter className="flex justify-end gap-2">
        <Button type="submit" form="character-form" disabled={isLoading}>
          {t("confirmSave.locations")}
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

export default LocationsForm;
