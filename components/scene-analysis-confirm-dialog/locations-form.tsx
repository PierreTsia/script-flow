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
import { AlertDialogFooter } from "@/components/ui/alert-dialog";

const EMPTY_LOCATION = {
  name: "",
  type: "INT",
  time_of_day: "DAY",
  notes: "",
} as const;

interface CharactersFormProps {
  scriptId: Id<"scripts">;
  sceneId: Id<"scenes"> | null;
  selectedDraftAnalysis: DraftSceneAnalysis | null;
  setCurrentTab: (tab: TabType) => void;
  children: React.ReactNode;
}

const LocationsForm = ({
  scriptId,
  sceneId,
  selectedDraftAnalysis,
  setCurrentTab,
  children,
}: CharactersFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("SceneAnalysis");

  const { createLocation } = useSceneEntities();

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
      console.log(
        "selectedDraftAnalysis.locations",
        selectedDraftAnalysis.locations
      );
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
          const locationId = createLocation({
            scriptId,
            sceneId,
            name: location.name,
            type: location.type,
            time_of_day: location.time_of_day,
            notes: location.notes,
          });
          console.log("locationId", locationId);
          return locationId;
        })
      );

      const allSuccessful = locationIds.every(Boolean);

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
                <FormField
                  control={form.control}
                  name={`locations.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
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
                    <FormItem>
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
                                {t(`timeOfDay.${timeOfDay}`)}
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
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2Icon className="w-4 h-4" />
                  {t("removeLocation")}
                </Button>
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
        {t("addLocation")}
      </Button>

      <AlertDialogFooter>
        <Button type="submit" form="character-form" disabled={isLoading}>
          {t("confirmSaveButton")}
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
