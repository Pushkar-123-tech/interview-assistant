import { useCallback } from "react";

const useSpeechSynthesis = () => {
  const speak = useCallback((text) => {
    if (!("speechSynthesis" in window)) {
      console.error("Speech synthesis is not supported.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  return {
    speak,
    stop,
  };
};

export default useSpeechSynthesis;