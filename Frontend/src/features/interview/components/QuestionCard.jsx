import { Volume2 } from "lucide-react";

import useSpeechSynthesis from "../hooks/useSpeechSynthesis";

const QuestionCard = ({ number, question }) => {
  const { speak } = useSpeechSynthesis();

  return (
    <div className="rounded-[28px] border border-zinc-200 bg-white p-8 md:p-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">
        QUESTION {String(number).padStart(2, "0")}
      </p>

      <h2 className="mt-6 max-w-3xl text-3xl font-medium leading-snug">
        {question}
      </h2>

      <button
        onClick={() => speak(question)}
        className="mt-8 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <Volume2 size={17} />
        Listen to question
      </button>
    </div>
  );
};

export default QuestionCard;