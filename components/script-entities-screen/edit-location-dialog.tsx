import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
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
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { LocationsWithScenes } from "@/convex/locations";
import { z } from "zod";
import useSceneEntities from "@/hooks/useSceneEntities";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["INT", "EXT"]),
  time_of_day: z.enum(["DAY", "NIGHT", "DAWN", "DUSK", "UNSPECIFIED"]),
});

type FormValues = z.infer<typeof formSchema>;

export const EditLocationDialog = ({
  location,
  isOpen,
  onClose,
}: {
  location: LocationsWithScenes[number];
  isOpen: boolean;
  onClose: () => void;
}) => {
  const t = useTranslations("EditLocationDialog");
  const { updateLocation, isLoading } = useSceneEntities();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: location.name,
      type: location.type,
      time_of_day: location.time_of_day,
    },
  });

  const onSubmit = async ({ name, type, time_of_day }: FormValues) => {
    await updateLocation({
      locationId: location._id,
      updates: {
        name,
        type,
        time_of_day,
      },
    });
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>

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
                  <FormLabel>{t("nameLabel")}</FormLabel>
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
                  <FormLabel>{t("typeLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                  <FormLabel>{t("timeLabel")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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

        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button type="submit" form="edit-location-form" disabled={isLoading}>
            {t("save")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
