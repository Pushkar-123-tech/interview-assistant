import { Mic, MicOff } from "lucide-react";

import useSpeechRecognition from "../hooks/useSpeechRecognition";

const AnswerRecorder = ({ setTranscript }) => {
  const {
    listening,
    supported,
    startListening,
    stopListening,
  } = useSpeechRecognition(setTranscript);

  return (
    <div className="rounded-[28px] border border-zinc-200 bg-white p-7">
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">
        YOUR ANSWER
      </p>

      <div className="flex min-h-[250px] flex-col items-center justify-center">
        <button
          disabled={!supported}
          onClick={listening ? stopListening : startListening}
          className={`flex h-20 w-20 items-center justify-center rounded-full transition ${
            listening
              ? "bg-red-50 text-red-600"
              : "bg-zinc-900 text-white hover:bg-zinc-700"
          }`}
        >
          {listening ? <MicOff size={27} /> : <Mic size={27} />}
        </button>

        <p className="mt-5 text-sm font-medium">
          {!supported
            ? "Speech recognition unavailable"
            : listening
            ? "Listening..."
            : "Start answering"}
        </p>

        <p className="mt-2 text-center text-xs leading-5 text-zinc-400">
          Your speech will appear as a transcript.
        </p>
      </div>
    </div>
  );
};

export default AnswerRecorder;