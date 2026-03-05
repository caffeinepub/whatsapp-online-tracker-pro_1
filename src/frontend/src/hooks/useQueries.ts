import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function usePing() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["ping"],
    queryFn: async () => {
      if (!actor) return "Not connected";
      return actor.ping();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
