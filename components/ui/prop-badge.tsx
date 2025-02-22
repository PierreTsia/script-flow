import { Badge } from "@/components/ui/badge";
import { PropType } from "@/convex/props";
import { cn } from "@/lib/utils";

// Industry-standard color coding for props
const PROP_TYPE_STYLES = {
  ACTIVE: "border-orange-400/40 bg-orange-50/20 dark:bg-orange-950/20", // Hand props
  SET: "border-green-400/40 bg-green-50/20 dark:bg-green-950/20", // Set dressing
  TRANSFORMING: "border-yellow-400/40 bg-yellow-50/20 dark:bg-yellow-950/20", // Special props
} as const;

interface PropBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: PropType;
  quantity?: number;
  children: React.ReactNode;
}

const PropBadge = ({
  type = "ACTIVE",
  quantity,
  children,
  className,
  ...props
}: PropBadgeProps) => {
  return (
    <Badge
      variant="secondary"
      className={cn(PROP_TYPE_STYLES[type], "border", className)}
      {...props}
    >
      {children}
      {quantity !== undefined && ` (${quantity})`}
    </Badge>
  );
};

export default PropBadge;
