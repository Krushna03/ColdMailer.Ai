// Extract a human-readable message from an API/axios error, falling back gracefully.
export const getErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (error instanceof Error ? error.message : fallback)
  );
};
