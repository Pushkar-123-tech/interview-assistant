import {
  ArrowRight,
  FileSearch,
  MessageSquareText,
  Play,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    title: "Start Mock Interview",
    description: "Practice with an AI interviewer.",
    icon: Play,
    path: "/dashboard/interview",
  },
  {
    title: "Analyze Resume",
    description: "Check ATS score and improve.",
    icon: FileSearch,
    path: "/dashboard/resume",
  },
  {
    title: "Practice Questions",
    description: "Solve coding and behavioral.",
    icon: MessageSquareText,
    path: "/dashboard/practice",
  },
  {
    title: "Interview Goals",
    description: "Track weekly preparation goals.",
    icon: Target,
    path: "/dashboard/goals",
  },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="border border-[#D8D2C7] bg-[#FFFDF8] p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">
            Quick Access
          </p>
          <h2 className="mt-1 text-2xl font-black text-[#08142E]">
            Quick Actions
          </h2>
        </div>
        <button className="border border-[#D8D2C7] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#08142E] transition hover:border-[#FF5A1F] hover:text-[#FF5A1F]">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className="group border border-[#D8D2C7] bg-[#FFFDF8] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5A1F]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#08142E] text-white transition group-hover:bg-[#FF5A1F]">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#08142E]">
                      {action.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#64748B]">
                      {action.description}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="mt-1 shrink-0 text-[#08142E] transition group-hover:translate-x-1 group-hover:text-[#FF5A1F]"
                />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#E7E2D8] pt-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                  Launch Module
                </span>
                <span className="text-xs font-bold text-[#FF5A1F] opacity-0 transition group-hover:opacity-100">
                  Open
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;