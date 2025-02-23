import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useSceneEntities from "@/hooks/useSceneEntities";
import { useTranslations } from "next-intl";
import { PropsWithScenes } from "@/convex/props";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  type: z.enum(["ACTIVE", "SET", "TRANSFORMING"]),
});

type FormValues = z.infer<typeof formSchema>;

export function EditPropDialog({
  prop,
  isOpen,
  onClose,
}: {
  prop: PropsWithScenes["props"][number];
  isOpen: boolean;
  onClose: () => void;
}) {
  const { updateProp, isLoading } = useSceneEntities();
  const t = useTranslations("ScriptEntitiesScreen.editPropDialog");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: prop.name,
      quantity: prop.quantity || 1,
      type: prop.type,
    },
  });

  async function onSubmit(values: FormValues) {
    await updateProp({
      propId: prop._id,
      updates: {
        name: values.name,
        quantity: values.quantity,
        type: values.type,
      },
    });
    onClose();
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            id="edit-prop-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.name.placeholder")}
                      {...field}
                    />
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
                  <FormLabel>{t("form.type.label")}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("form.type.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">
                            {t("form.type.options.ACTIVE")}
                          </SelectItem>
                          <SelectItem value="SET">
                            {t("form.type.options.SET")}
                          </SelectItem>
                          <SelectItem value="TRANSFORMING">
                            {t("form.type.options.TRANSFORMING")}
                          </SelectItem>
                        </SelectContent>
                      </FormControl>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.quantity.label")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder={t("form.quantity.placeholder")}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
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
          <Button type="submit" form="edit-prop-form" disabled={isLoading}>
            {isLoading ? t("saving") : t("save")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
