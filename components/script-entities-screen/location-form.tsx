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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { TimeOfDay } from "@/convex/helpers";

// Schema matches the existing location structure
export const locationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["INT", "EXT"]),
  time_of_day: z.enum(["DAY", "NIGHT", "DAWN", "DUSK", "UNSPECIFIED"] as const),
});

export type LocationFormSchema = z.infer<typeof locationFormSchema>;

interface LocationFormProps {
  location?: {
    name: string;
    type: "INT" | "EXT";
    time_of_day: TimeOfDay;
  };
  onSubmit: (values: LocationFormSchema) => Promise<void> | void;
}

const LocationForm = ({ location, onSubmit }: LocationFormProps) => {
  const t = useTranslations("ScriptEntitiesScreen");

  const form = useForm<LocationFormSchema>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: location || {
      name: "",
      type: "INT",
      time_of_day: "UNSPECIFIED",
    },
  });

  return (
    <Form {...form}>
      <form
        id="edit-location-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("location.type")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INT">
                    {t("locationType.interior")}
                  </SelectItem>
                  <SelectItem value="EXT">
                    {t("locationType.exterior")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time_of_day"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("location.timeOfDay")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["DAY", "NIGHT", "DAWN", "DUSK", "UNSPECIFIED"].map(
                    (timeOfDay) => (
                      <SelectItem key={timeOfDay} value={timeOfDay}>
                        {t(`timeOfDay.${timeOfDay.toLowerCase()}`)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default LocationForm;
