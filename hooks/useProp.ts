import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const useProp = () => {
  const useGetPropById = (propId: Id<"props">) => {
    return useQuery(api.props.getPropById, { prop_id: propId });
  };

  return {
    useGetPropById,
  };
};

export default useProp;
