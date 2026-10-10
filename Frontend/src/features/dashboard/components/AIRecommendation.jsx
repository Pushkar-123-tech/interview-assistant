import { ArrowRight, BrainCircuit, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AIRecommendation = () => {
  const navigate = useNavigate();

  return (
    <div className="border border-[#D7D2C8] bg-[#FFFDF8] p-5 transition-all duration-300 hover:border-[#FF5A1F]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-[#08142E] text-white">
            <BrainCircuit size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">
              AI Recommendation
            </p>
            <h2 className="mt-0.5 text-lg font-black text-[#08142E]">
              Improve your System Design
            </h2>
          </div>
        </div>
        <span className="border border-[#FFD8CB] bg-[#FFF2EC] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#FF5A1F]">
          AI Powered
        </span>
      </div>

      <div className="my-4 h-px bg-[#E8E3D8]" />

      <p className="text-sm leading-6 text-[#5E6B85]">
        Based on your recent interview performance, your coding skills continue to improve.
        However, <span className="font-bold text-[#08142E]">System Design</span> remains the
        biggest opportunity to increase your overall interview readiness.
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#08142E]">
            Estimated Improvement
          </p>
          <div className="flex items-center gap-1 font-bold text-[#FF5A1F]">
            <TrendingUp size={12} />
            +18%
          </div>
        </div>
        <div className="h-1 bg-[#ECE7DD]">
          <div className="h-full bg-[#FF5A1F]" style={{ width: "72%" }} />
        </div>
      </div>

      <div className="mt-4 border-l-[3px] border-[#FF5A1F] pl-4">
        <p className="text-sm leading-6 text-[#5E6B85]">
          Complete <span className="font-bold text-[#08142E]">3 System Design interviews</span> this week to significantly improve your readiness.
        </p>
      </div>

      <button
        onClick={() => navigate("/dashboard/practice")}
        className="mt-5 flex items-center gap-2 bg-[#08142E] px-5 py-2.5 font-bold text-white transition hover:bg-[#FF5A1F]"
      >
        Start Practice
        <ArrowRight size={14} />
      </button>
    </div>
  );
};

export default AIRecommendation;