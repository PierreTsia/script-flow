import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CharacterType } from "@/convex/helpers";

const characterTypeOptions = [
  "PRINCIPAL",
  "SECONDARY",
  "FIGURANT",
  "SILHOUETTE",
  "EXTRA",
] as const;

const charcaterFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(characterTypeOptions),
  aliases: z.string().optional(),
});

export type CharacterFormSchema = z.infer<typeof charcaterFormSchema>;

const CharacterForm = ({
  character,
  onSubmit,
}: {
  character?: {
    name: string;
    type: CharacterType;
    aliases?: string[];
  };
  onSubmit: (values: CharacterFormSchema) => void;
}) => {
  const t = useTranslations("ScriptEntitiesScreen.editCharacterDialog");

  const form = useForm<CharacterFormSchema>({
    resolver: zodResolver(charcaterFormSchema),
    defaultValues: {
      name: character?.name || "",
      type: character?.type || "PRINCIPAL",
      aliases: character?.aliases?.join(", ") || "",
    },
  });

  return (
    <Form {...form}>
      <form
        id="edit-character-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.name.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form.name.placeholder")} {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.type.placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {characterTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`characterType.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="aliases"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.aliases.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form.aliases.placeholder")} {...field} />
              </FormControl>
              <FormDescription>{t("form.aliases.description")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default CharacterForm;
