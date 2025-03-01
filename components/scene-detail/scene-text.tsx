import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface SceneTextProps {
  text: string | null;
}

export function SceneText({ text }: SceneTextProps) {
  const t = useTranslations("SceneDetail");
  const [isFullTextVisible, setIsFullTextVisible] = useState(false);

  const toggleFullText = () => setIsFullTextVisible(!isFullTextVisible);

  return (
    <div className="space-y-2">
      <span className="text-muted-foreground">{t("details.sceneText")}</span>
      {text ? (
        <div className="relative">
          <div
            className={cn(
              "prose prose-sm dark:prose-invert max-w-none font-mono bg-muted p-4 rounded-lg",
              !isFullTextVisible && "max-h-[200px] overflow-hidden"
            )}
          >
            <pre className="whitespace-pre-wrap break-words">{text}</pre>
          </div>
          {text.length > 300 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullText}
              className="mt-2 w-full flex items-center justify-center gap-2 hover:bg-muted"
            >
              {isFullTextVisible ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  {t("details.showLess")}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  {t("details.showMore")}
                </>
              )}
            </Button>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground italic">
          {t("details.noSceneText")}
        </p>
      )}
    </div>
  );
}
