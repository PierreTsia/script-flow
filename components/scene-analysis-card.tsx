import { Card, CardContent, CardFooter } from "./ui/card";

const SceneAnalysisCard = ({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  return (
    <Card className="flex flex-col min-h-0 border-0 shadow-none  flex-1 flex flex-col h-full ">
      <CardContent className="flex-1 p-4 pt-0 min-h-0">{children}</CardContent>
      {footer && <CardFooter className="p-4 pt-0">{footer}</CardFooter>}
    </Card>
  );
};

export default SceneAnalysisCard;
