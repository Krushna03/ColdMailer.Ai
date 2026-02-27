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


// Copy to clipboard with state management hook pattern
export const useCopyToClipboard = (setCopied, timeout = 2000) => {
  return async (text, id = null) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(id !== null ? id : true);
      setTimeout(() => setCopied(null), timeout);
    }
  };
};
