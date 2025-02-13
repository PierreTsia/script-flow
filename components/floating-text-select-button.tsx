import { Button } from "./ui/button";
import { Wand2 } from "lucide-react";

interface FloatingTextSelectButtonProps {
  selectionRect: DOMRect;
  onClick: () => void;
}

export function FloatingTextSelectButton({
  selectionRect,
  onClick,
}: FloatingTextSelectButtonProps) {
  const getVisiblePosition = () => {
    const isAboveViewport = selectionRect.bottom < 0;
    const isBelowViewport = selectionRect.top > window.innerHeight;
    const isPartiallyBelow = selectionRect.bottom > window.innerHeight;

    // If selection (multiple pages) is completely outside viewport, show at 2/3 height
    if (isAboveViewport || isBelowViewport || isPartiallyBelow) {
      return {
        top: Math.floor(window.innerHeight * (2 / 3)), // 2/3 of viewport height
        left: Math.floor(window.innerWidth / 2 - 75), // Centered horizontally
      };
    }

    // Normal case: show below selection
    return {
      top: Math.min(
        selectionRect.bottom + window.scrollY + 16,
        window.innerHeight - 80
      ),
      left: Math.max(
        16,
        Math.min(
          selectionRect.left + selectionRect.width / 2 - 75,
          window.innerWidth - 150
        )
      ),
    };
  };

  const position = getVisiblePosition();

  return (
    <div
      className="fixed z-[50] animate-in fade-in"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Button
        onClick={onClick}
        className="rounded-full shadow-lg px-6 py-6 gap-2"
      >
        <Wand2 className="h-5 w-5" />
        <span>Analyze Scene</span>
      </Button>
    </div>
  );
}
