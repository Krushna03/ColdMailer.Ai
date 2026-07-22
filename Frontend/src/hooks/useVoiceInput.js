import { useCallback, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useToast } from "./use-toast";

export function useVoiceInput(value, setValue, options = {}) {
  const { language = "en-US", continuous = true } = options;
  const baseValueRef = useRef("");
  const { toast } = useToast();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!listening) return;

    const base = baseValueRef.current;
    const spoken = transcript.trim();

    if (!spoken) {
      setValue(base.trimEnd());
      return;
    }

    const separator = base && !/\s$/.test(base) ? " " : "";
    setValue(`${base}${separator}${spoken}`.replace(/\s+/g, " ").trim());
  }, [listening, transcript, setValue]);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  const handleMicClick = useCallback((e) => {
      e?.preventDefault?.();

      if (!browserSupportsSpeechRecognition) {
        toast({
          title: "Microphone",
          description: "Speech recognition is not supported in this browser. Try Chrome or Edge.",
          variant: "destructive",
        });
        return;
      }

      if (listening) {
        stopListening();
        return;
      }

      baseValueRef.current = value.trim() ? `${value.trim()} ` : "";
      resetTranscript();
      SpeechRecognition.startListening({ continuous, language });
    },
    [
      browserSupportsSpeechRecognition,
      continuous,
      language,
      listening,
      resetTranscript,
      stopListening,
      toast,
      value,
    ]
  );

  const handleValueChange = useCallback((e) => {
      if (listening) stopListening();
      setValue(e.target.value);
    },
    [listening, setValue, stopListening]
  );

  return {
    listening,
    browserSupportsSpeechRecognition,
    handleMicClick,
    stopListening,
    handleValueChange,
  };
}
