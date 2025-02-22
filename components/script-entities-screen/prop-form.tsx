import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { PropType } from "@/convex/props";
export const propFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.string().optional(),
  notes: z.string().optional(),
  type: z.enum(["ACTIVE", "SET", "TRANSFORMING"]),
});

export type PropFormSchema = z.infer<typeof propFormSchema>;

interface PropFormProps {
  prop?: {
    name: string;
    quantity?: string;
    notes?: string;
    type: PropType;
  };
  onSubmit: (values: PropFormSchema) => Promise<void> | void;
}

const PropForm = ({ prop, onSubmit }: PropFormProps) => {
  const t = useTranslations("ScriptEntitiesScreen");

  const form = useForm<PropFormSchema>({
    resolver: zodResolver(propFormSchema),
    defaultValues: prop || {
      name: "",
      quantity: "",
      notes: "",
      type: "ACTIVE",
    },
  });

  return (
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
              <FormLabel>{t("prop.name")}</FormLabel>
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
              <FormLabel>{t("prop.type.label")}</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("prop.type.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        {t("prop.type.options.ACTIVE")}
                      </SelectItem>
                      <SelectItem value="SET">
                        {t("prop.type.options.SET")}
                      </SelectItem>
                      <SelectItem value="TRANSFORMING">
                        {t("prop.type.options.TRANSFORMING")}
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
              <FormLabel>{t("prop.quantity")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("prop.notes")}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default PropForm;
