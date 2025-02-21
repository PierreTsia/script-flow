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
import { useTranslations } from "next-intl";

export const propFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.string().optional(),
  notes: z.string().optional(),
});

export type PropFormSchema = z.infer<typeof propFormSchema>;

interface PropFormProps {
  prop?: {
    name: string;
    quantity?: string;
    notes?: string;
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
