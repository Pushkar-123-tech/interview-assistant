const AnswerTranscript = ({ transcript }) => {
  return (
    <div className="rounded-[28px] border border-zinc-200 bg-white p-8">
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-400">
        LIVE TRANSCRIPT
      </p>

      <p className="mt-5 min-h-[100px] whitespace-pre-wrap leading-7 text-zinc-700">
        {transcript || "Your answer will appear here as you speak..."}
      </p>
    </div>
  );
};

export default AnswerTranscript;