"use client";

import { Sun, Moon, Sunrise, Sunset, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { TimeOfDay } from "@/convex/helpers";

export const TimeOfDayIcon = ({ timeOfDay }: { timeOfDay: TimeOfDay }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const iconMap: Record<TimeOfDay, React.ReactNode> = {
    DAY: <Sun className="h-4 w-4" />,
    NIGHT: <Moon className="h-4 w-4" />,
    DAWN: <Sunrise className="h-4 w-4" />,
    DUSK: <Sunset className="h-4 w-4" />,
    UNSPECIFIED: <Clock className="h-4 w-4" />,
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{iconMap[timeOfDay]}</div>
      </TooltipTrigger>
      <TooltipContent>
        {t(`timeOfDay.${timeOfDay.toLowerCase()}`)}
      </TooltipContent>
    </Tooltip>
  );
};
