import { useCallback, useEffect, useRef } from "react";

// Copy text to clipboard with optional callback
export const copyToClipboard = async (text, onSuccess, onError) => {
  try {
    await navigator.clipboard.writeText(text);
    if (onSuccess) onSuccess();
    return true;
  } catch (error) {
    console.error("Copy to clipboard failed:", error);
    if (onError) onError(error);
    return false;
  }
};


// Copy to clipboard with state management hook pattern.
export const useCopyToClipboard = (setCopied, timeout = 2000) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useCallback(
    async (text, id = null) => {
      const success = await copyToClipboard(text);
      if (success) {
        setCopied(id !== null ? id : true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(null), timeout);
      }
    },
    [setCopied, timeout]
  );
};
