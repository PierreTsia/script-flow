import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Id } from "@/convex/_generated/dataModel";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSceneEntities from "@/hooks/useSceneEntities";
import { useTranslations } from "next-intl";

import { CharacterType } from "@/convex/helpers";

const characterTypeOptions = [
  "PRINCIPAL",
  "SECONDARY",
  "FIGURANT",
  "SILHOUETTE",
  "EXTRA",
] as const;

interface EditCharacterDialogProps {
  character: {
    _id: Id<"characters">;
    name: string;
    type: CharacterType;
    aliases?: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(characterTypeOptions),
  aliases: z.string().optional(),
});

export function EditCharacterDialog({
  character,
  isOpen,
  onClose,
}: EditCharacterDialogProps) {
  const { updateCharacter } = useSceneEntities();
  const t = useTranslations("ScriptEntitiesScreen.editCharacterDialog");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: character.name,
      type: character.type,
      aliases: character.aliases?.join(", ") || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await updateCharacter({
      characterId: character._id,
      updates: {
        name: values.name,
        type: values.type,
        aliases: values.aliases
          ? values.aliases
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : [],
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                    <Input
                      placeholder={t("form.aliases.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("form.aliases.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => onClose()}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit">
                {form.formState.isSubmitting
                  ? t("actions.saving")
                  : t("actions.save")}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
