import { useRef } from "react";
import { useQuery } from "convex/react";

export const useStableQuery = ((name, ...args) => {
    const result = useQuery(name, ...args);
    const stored = useRef(result);

    if (result !== undefined) {
        // Only update stored value when fresh data arrives
        stored.current = result;
    }

    return stored.current;
}) as typeof useQuery;