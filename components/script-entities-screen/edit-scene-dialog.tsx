import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Form } from "../ui/form";
import { SceneWithEntities } from "./scene-summary-card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "@/convex/_generated/dataModel";
import SceneEntityItem from "./scene-entity-item";
import { useScene } from "@/hooks/useScene";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";
import { EntitySelect } from "./entity-select";

type EditSceneDialogProps = {
  scene: SceneWithEntities;
  isOpen: boolean;
  onClose: () => void;
  scriptId: Id<"scripts">;
};

const formSchema = z.object({
  scene_number: z.string(),
  summary: z.string().min(50),
  characters: z.array(
    z.object({
      _id: z.custom<Id<"characters">>(),
      name: z.string(),
      type: z.enum([
        "PRINCIPAL",
        "SUPPORTING",
        "FEATURED_EXTRA",
        "SILENT_KEY",
        "ATMOSPHERE",
      ]),
      markedForDeletion: z.boolean(),
    })
  ),
  locations: z.array(
    z.object({
      _id: z.custom<Id<"locations">>(),
      name: z.string(),
      markedForDeletion: z.boolean(),
    })
  ),
  props: z.array(
    z.object({
      _id: z.custom<Id<"props">>(),
      name: z.string(),
      type: z.enum(["ACTIVE", "SET", "TRANSFORMING"]),
      markedForDeletion: z.boolean(),
    })
  ),
});

const EditSceneDialog = ({
  scene,
  isOpen,
  onClose,
  scriptId,
}: EditSceneDialogProps) => {
  const { characters, locations, summary, props } = scene;

  const t = useTranslations("EditSceneDialog");

  const { updateScene, isLoading } = useScene();
  const {
    useGetCharactersByScriptId,
    useGetLocationsByScriptId,
    useGetPropsByScriptId,
  } = useScene();

  const characterResult = useGetCharactersByScriptId(scriptId, 25);
  const locationResult = useGetLocationsByScriptId(scriptId);
  const propsResult = useGetPropsByScriptId(scriptId, 25);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scene_number: scene.scene_number,
      characters: characters.map((char) => ({
        ...char,
        markedForDeletion: false,
      })),
      summary,
      locations: locations.map((loc) => ({
        ...loc,
        markedForDeletion: false,
      })),
      props: props.map((prop) => ({
        ...prop,
        markedForDeletion: false,
      })),
    },
  });

  if (!characterResult || !locationResult || !propsResult) {
    return null;
  }

  const { characters: allCharacters } = characterResult;
  const { locations: allLocations } = locationResult;
  const { props: allProps } = propsResult;

  const availableCharacters = allCharacters
    ?.filter((char) => !characters.some((c) => c?._id === char?._id))
    .map((char) => ({
      ...char,
      markedForDeletion: false,
    }));

  const availableLocations = allLocations
    ?.filter((loc) => !locations.some((l) => l?._id === loc?._id))
    .map((loc) => ({
      ...loc,
      markedForDeletion: false,
    }));

  const availableProps = allProps
    ?.filter((prop) => !props.some((p) => p?._id === prop?._id))
    .map((prop) => ({
      ...prop,
      markedForDeletion: false,
    }));

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const charactersIdsToDelete = data.characters
      .filter((char) => char.markedForDeletion)
      .map((char) => char._id);
    const locationsIdsToDelete = data.locations
      .filter((loc) => loc.markedForDeletion)
      .map((loc) => loc._id);
    const propsIdsToDelete = data.props
      .filter((prop) => prop.markedForDeletion)
      .map((prop) => prop._id);

    const charactersIdsToAdd = data.characters
      .filter((char) => {
        const isNew = !characters.some((c) => c?._id === char?._id);

        return !char.markedForDeletion && (!characters.length || isNew);
      })
      .map((char) => char._id);
    const locationsIdsToAdd = data.locations
      .filter(
        (loc) =>
          !loc.markedForDeletion && !locations.some((l) => l?._id === loc?._id)
      )
      .map((loc) => loc._id);
    const propsIdsToAdd = data.props
      .filter(
        (prop) =>
          !prop.markedForDeletion && !props.some((p) => p?._id == prop?._id)
      )
      .map((prop) => prop._id);

    const updatedSceneId = await updateScene(
      scene._id,
      data.scene_number,
      data.summary,
      charactersIdsToDelete,
      locationsIdsToDelete,
      propsIdsToDelete,
      charactersIdsToAdd,
      locationsIdsToAdd,
      propsIdsToAdd
    );
    if (updatedSceneId) {
      onClose();
    }
  };

  const toggleCharacterDeletion = (id: Id<"characters">) => {
    form.setValue(
      "characters",
      form
        .getValues("characters")
        .map((char) =>
          char._id === id
            ? { ...char, markedForDeletion: !char.markedForDeletion }
            : char
        )
    );
  };

  const toggleLocationDeletion = (id: Id<"locations">) => {
    form.setValue(
      "locations",
      form
        .getValues("locations")
        .map((loc) =>
          loc._id === id
            ? { ...loc, markedForDeletion: !loc.markedForDeletion }
            : loc
        )
    );
  };

  const togglePropDeletion = (id: Id<"props">) => {
    form.setValue(
      "props",
      form
        .getValues("props")
        .map((prop) =>
          prop._id === id
            ? { ...prop, markedForDeletion: !prop.markedForDeletion }
            : prop
        )
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="min-h-[90vh] max-h-[90vh] flex flex-col  min-w-full lg:min-w-[80vw] xl:min-w-[60vw]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("title", { number: scene.scene_number })}
          </AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form
            id="edit-scene-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1"
          >
            <ScrollArea>
              <div className="space-y-6 pr-4 flex-1 max-h-[70vh]">
                <FormField
                  control={form.control}
                  name="scene_number"
                  render={({ field }) => (
                    <FormItem className="inline-flex justify-start items-baseline gap-2 gap-x-6 w-full mb-2">
                      <FormLabel>{t("sceneNumber")}</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem className="mb-2">
                      <FormLabel>{t("summary")}</FormLabel>
                      <FormControl>
                        <ScrollArea className="max-h-[400px]">
                          <Textarea
                            {...field}
                            className="resize-none min-h-[100px] w-full"
                            placeholder={t("summaryPlaceholder")}
                          />
                        </ScrollArea>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Accordion
                  type="multiple"
                  defaultValue={["characters"]}
                  className="mt-6"
                >
                  <AccordionItem value="characters">
                    <AccordionTrigger>{t("characters")}</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="characters"
                        render={({ field }) => (
                          <div className="space-y-2 gap-y-2">
                            {field.value.map((char) => (
                              <SceneEntityItem
                                key={char._id}
                                id={char._id}
                                name={char.name}
                                type={char.type}
                                markedForDeletion={!!char.markedForDeletion}
                                onToggleDelete={(id) =>
                                  toggleCharacterDeletion(
                                    id as Id<"characters">
                                  )
                                }
                              />
                            ))}

                            <EntitySelect
                              availableEntities={availableCharacters}
                              onSelect={(character) => {
                                const currentChars =
                                  form.getValues("characters");
                                form.setValue("characters", [
                                  ...currentChars,
                                  { ...character, markedForDeletion: false },
                                ]);
                              }}
                              placeholder={t("addCharacter")}
                            />
                          </div>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="locations">
                    <AccordionTrigger>{t("locations")}</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="locations"
                        render={({ field }) => (
                          <div className="space-y-2 gap-y-2">
                            {field.value.map((loc) => (
                              <SceneEntityItem
                                key={loc._id}
                                id={loc._id}
                                name={loc.name}
                                markedForDeletion={!!loc.markedForDeletion}
                                onToggleDelete={(id) =>
                                  toggleLocationDeletion(id as Id<"locations">)
                                }
                              />
                            ))}
                          </div>
                        )}
                      />
                      <EntitySelect
                        availableEntities={availableLocations}
                        onSelect={(location) => {
                          const currentLocs = form.getValues("locations");
                          form.setValue("locations", [
                            ...currentLocs,
                            location,
                          ]);
                        }}
                        placeholder={t("addLocation")}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="props">
                    <AccordionTrigger>{t("props")}</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="props"
                        render={({ field }) => (
                          <div className="space-y-2 gap-y-2">
                            {field.value.map((prop) => (
                              <SceneEntityItem
                                key={prop._id}
                                id={prop._id}
                                name={prop.name}
                                type={prop.type}
                                markedForDeletion={!!prop.markedForDeletion}
                                onToggleDelete={(id) =>
                                  togglePropDeletion(id as Id<"props">)
                                }
                              />
                            ))}
                          </div>
                        )}
                      />
                      <EntitySelect
                        availableEntities={availableProps}
                        onSelect={(prop) => {
                          const currentProps = form.getValues("props");
                          form.setValue("props", [...currentProps, prop]);
                        }}
                        placeholder={t("addProp")}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </ScrollArea>
          </form>
        </Form>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            {t("cancel")}
          </Button>
          <Button type="submit" form="edit-scene-form" disabled={isLoading}>
            {isLoading ? t("saving") : t("save")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditSceneDialog;
