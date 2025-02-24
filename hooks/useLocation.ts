import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const useLocation = () => {
  const useGetLocationById = (locationId: Id<"locations">) => {
    return useQuery(api.locations.getLocationById, { location_id: locationId });
  };

  return {
    useGetLocationById,
  };
};

export default useLocation;
