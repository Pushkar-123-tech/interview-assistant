import { CheckCircle2, Target, TrendingUp } from "lucide-react";

const WeeklyGoal = ({ completed = 3, target = 5 }) => {
  const safeTarget = target > 0 ? target : 1;
  const percentage = Math.min(100, Math.round((completed / safeTarget) * 100));
  const remaining = Math.max(target - completed, 0);

  return (
    <div className="border border-[#D8D2C7] bg-[#FFFDF8] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">
            Weekly Goal
          </p>
          <h2 className="mt-1 text-xl font-black text-[#08142E]">
            Interview Practice
          </h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center bg-[#08142E] text-white">
          <Target size={18} />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="flex items-end">
            <span className="text-4xl font-black text-[#08142E]">
              {completed}
            </span>
            <span className="ml-1.5 text-xl font-bold text-[#94A3B8]">
              / {target}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Interviews Completed
          </p>
        </div>
        <div className="border border-[#FFD8CB] bg-[#FFF2EC] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-[#FF5A1F]" />
            <span className="text-xl font-black text-[#FF5A1F]">
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
            Progress
          </span>
          <span className="text-xs font-bold text-[#08142E]">
            {percentage}% Complete
          </span>
        </div>
        <div className="h-1.5 bg-[#E8E3D8]">
          <div
            className="h-full bg-[#FF5A1F] transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 border-l-[3px] border-[#FF5A1F] pl-4">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-[#FF5A1F]" />
          <span className="font-bold text-[#08142E]">
            {remaining === 0
              ? "Weekly Goal Completed!"
              : `${remaining} Interview${remaining > 1 ? "s" : ""} Remaining`}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-[#64748B]">
          {remaining === 0
            ? "Excellent work! Continue practicing."
            : "Complete your remaining mock interviews to improve your readiness."}
        </p>
      </div>

      <div className="mt-4 border-t border-[#E8E3D8] pt-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">
          AI Insight
        </p>
        <p className="mt-1 text-xs leading-6 text-[#64748B]">
          Completing all <span className="font-bold text-[#08142E]">5 mock interviews</span> this week could increase your readiness by{' '}
          <span className="font-bold text-[#08142E]">12–18%</span>.
        </p>
      </div>
    </div>
  );
};

export default WeeklyGoal;