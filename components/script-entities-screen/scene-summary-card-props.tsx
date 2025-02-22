import { useTranslations } from "next-intl";
import { SceneWithEntities } from "./scene-summary-card";
import PropBadge from "@/components/ui/prop-badge";
import { PropType } from "@/convex/props";

type SceneProps = SceneWithEntities["props"];
interface SceneSummaryCardPropsProps {
  props: SceneProps;
}

interface PropGroupProps {
  type: PropType;
  props: SceneProps;
}

const PropGroup = ({ type, props }: PropGroupProps) => {
  const t = useTranslations("ScriptEntitiesScreen");

  if (props.length === 0) return null;

  return (
    <div className="mb-2">
      <span className="text-xs text-muted-foreground block mb-1">
        {t(`prop.type.${type.toLowerCase()}`)}
      </span>
      <div className="flex flex-wrap gap-1">
        {props.map((prop, index) => (
          <PropBadge
            key={`prop-${type}-${prop?._id}-${index}`}
            type={type}
            quantity={prop?.quantity}
          >
            {prop?.name}
          </PropBadge>
        ))}
      </div>
    </div>
  );
};

const SceneSummaryCardProps = ({ props }: SceneSummaryCardPropsProps) => {
  const t = useTranslations("ScriptEntitiesScreen");

  if (!props?.length) {
    return <div className="text-sm text-muted-foreground">{t("noProps")}</div>;
  }

  // Group props by type
  const propsByType = props.reduce<Record<PropType, SceneProps>>(
    (acc, prop) => {
      if (!prop) return acc;
      if (prop.type === "ACTIVE") {
        acc.ACTIVE = [...(acc.ACTIVE || []), prop];
      } else if (prop.type === "TRANSFORMING") {
        acc.TRANSFORMING = [...(acc.TRANSFORMING || []), prop];
      } else if (prop.type === "SET") {
        acc.SET = [...(acc.SET || []), prop];
      }
      return acc;
    },
    {
      ACTIVE: [],
      TRANSFORMING: [],
      SET: [],
    }
  );

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">{t("entityLabels.props")}</h4>

      {/* Render each group in order */}
      <div className="flex flex-col gap-y-2">
        <PropGroup type="ACTIVE" props={propsByType.ACTIVE} />
        <PropGroup type="TRANSFORMING" props={propsByType.TRANSFORMING} />
        <PropGroup type="SET" props={propsByType.SET} />
      </div>
    </div>
  );
};

export default SceneSummaryCardProps;
