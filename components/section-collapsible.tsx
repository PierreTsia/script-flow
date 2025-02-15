import { ChevronDown, MapPin, Users, Box } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DraftLocations, DraftCharacters, DraftProps } from "@/convex/helpers";

const SectionCollapsible = ({
  title,
  type,
  items,
  maxHeight = "200px",
}: {
  title: string;
  type: "locations" | "characters" | "props";
  items: DraftLocations | DraftCharacters | DraftProps;
  maxHeight?: string;
}) => {
  const iconConfig = {
    locations: {
      icon: <MapPin className="h-4 w-4 text-white" />,
      bgColor: "bg-blue-600",
    },
    characters: {
      icon: <Users className="h-4 w-4 text-white" />,
      bgColor: "bg-red-600",
    },
    props: {
      icon: <Box className="h-4 w-4 text-white" />,
      bgColor: "bg-green-600",
    },
  };

  return (
    <Collapsible>
      <CollapsibleTrigger className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group">
        <div className={`${iconConfig[type].bgColor} p-2 rounded-lg`}>
          {iconConfig[type].icon}
        </div>
        <span className="font-medium flex-1 text-left">{title}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div
          className="bg-foreground/10 rounded overflow-y-auto"
          style={{ maxHeight }}
        >
          <div className="p-2 space-y-2 text-sm">
            {items.length > 0 ? (
              items.map((item, i) => (
                <div
                  key={i}
                  className="py-2 px-3 rounded-md bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {item.name || "Unnamed Item"}
                    </span>
                    {"type" in item && (
                      <span className="text-muted-foreground text-xs">
                        {item?.type || "No type specified"}
                      </span>
                    )}
                  </div>
                  {"notes" in item && (
                    <p className="text-muted-foreground text-xs mt-1">
                      {item.notes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground p-2">No items found</div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SectionCollapsible;
