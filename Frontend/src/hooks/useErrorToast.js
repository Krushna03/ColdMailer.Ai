import { useCallback } from "react";
import { useToast } from "./use-toast";
import { getErrorMessage } from "../utils";

// Extracts a backend error message and fires a destructive toast.
// Returns the resolved message so callers can also use it (e.g. setError).
export const useErrorToast = () => {
  const { toast } = useToast();

  return useCallback(
    (error, { title = "Error Occurred !!", fallback } = {}) => {
      const message = getErrorMessage(error, fallback);

      toast({
        title,
        description: message,
        variant: "destructive",
      });

      return message;
    },
    [toast]
  );
};
