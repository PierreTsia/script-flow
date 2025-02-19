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

type EditSceneDialogProps = {
  scene: SceneWithEntities;
  isOpen: boolean;
  onClose: () => void;
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
        "SECONDARY",
        "FIGURANT",
        "SILHOUETTE",
        "EXTRA",
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
      markedForDeletion: z.boolean(),
    })
  ),
});

const EditSceneDialog = ({ scene, isOpen, onClose }: EditSceneDialogProps) => {
  const { characters, locations, summary, props } = scene;
  const { updateScene, isLoading } = useScene();

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
    const updatedSceneId = await updateScene(
      scene._id,
      data.scene_number,
      data.summary,
      charactersIdsToDelete,
      locationsIdsToDelete,
      propsIdsToDelete
    );
    if (updatedSceneId) {
      onClose();
    }
  };

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
      <AlertDialogContent className="h-[90vh] flex flex-col min-w-full lg:min-w-[80vw] xl:min-w-[60vw]">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Scene {scene.scene_number}</AlertDialogTitle>
          <AlertDialogDescription>
            Edit the scene details and content.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1"
          >
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="scene_number"
                  render={({ field }) => (
                    <FormItem className="inline-flex justify-start items-baseline gap-2 gap-x-6 w-full mb-2">
                      <FormLabel>Scene Number</FormLabel>
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
                      <FormLabel>Summary</FormLabel>
                      <FormControl>
                        <ScrollArea className="max-h-[400px]">
                          <Textarea
                            {...field}
                            className="resize-none min-h-[100px] w-full"
                            placeholder="Enter a summary for the scene"
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
                    <AccordionTrigger>Characters</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="characters"
                        render={({ field }) => (
                          <div className="space-y-2">
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
                          </div>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="locations">
                    <AccordionTrigger>Locations</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="locations"
                        render={({ field }) => (
                          <div className="space-y-2">
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
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="props">
                    <AccordionTrigger>Props</AccordionTrigger>
                    <AccordionContent>
                      <FormField
                        control={form.control}
                        name="props"
                        render={({ field }) => (
                          <div className="space-y-2">
                            {field.value.map((prop) => (
                              <SceneEntityItem
                                key={prop._id}
                                id={prop._id}
                                name={prop.name}
                                markedForDeletion={!!prop.markedForDeletion}
                                onToggleDelete={(id) =>
                                  togglePropDeletion(id as Id<"props">)
                                }
                              />
                            ))}
                          </div>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </ScrollArea>

            <AlertDialogFooter className="mt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditSceneDialog;
