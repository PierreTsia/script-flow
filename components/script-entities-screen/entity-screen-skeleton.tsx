import { Skeleton } from "@/components/ui/skeleton";

const EntityScreenSkeleton = () => {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  );
};

export default EntityScreenSkeleton;
