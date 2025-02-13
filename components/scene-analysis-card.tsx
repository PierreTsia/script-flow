import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { TranslationValues, useTranslations } from "next-intl";

const SceneAnalysisCard = ({
  titleKey,
  descriptionKey,
  descriptionValues,
  children,
  footer,
}: {
  titleKey?: string;
  descriptionKey?: string;
  descriptionValues?: TranslationValues;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  const t = useTranslations("SceneAnalysis");

  return (
    <Card className="flex flex-col min-h-0 border-0 shadow-none  flex-1 flex flex-col h-full ">
      {(titleKey || descriptionKey) && (
        <CardHeader className="pb-2">
          {titleKey && <CardTitle className="text-lg">{t(titleKey)}</CardTitle>}
          {descriptionKey && (
            <CardDescription>
              {t(descriptionKey, descriptionValues)}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className="flex-1 p-6 pt-0 min-h-0">{children}</CardContent>
      {footer && <CardFooter className="p-4 pt-0">{footer}</CardFooter>}
    </Card>
  );
};

export default SceneAnalysisCard;
