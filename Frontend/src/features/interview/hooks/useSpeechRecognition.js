import { useRef, useState } from "react";

const useSpeechRecognition = (setTranscript) => {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const supported = Boolean(SpeechRecognition);

  const startListening = () => {
    if (!supported) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    // Prevent multiple recognition instances
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += text + " ";
        } else {
          interimTranscript += text;
        }
      }

      if (typeof setTranscript === "function") {
        setTranscript(
          (finalTranscript + interimTranscript).trim()
        );
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setListening(false);
  };

  return {
    listening,
    supported,
    startListening,
    stopListening,
  };
};

export default useSpeechRecognition;