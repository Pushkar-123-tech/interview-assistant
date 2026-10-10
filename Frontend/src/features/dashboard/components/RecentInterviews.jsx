import {
  ArrowRight,
  CalendarDays,
  Code2,
  MessageSquare,
} from "lucide-react";

const defaultInterviews = [
  { id: 1, title: "Frontend Developer", type: "Technical", date: "Today", score: 84 },
  { id: 2, title: "Software Engineer", type: "Coding", date: "Jul 27", score: 78 },
  { id: 3, title: "Full Stack Developer", type: "Mixed", date: "Jul 24", score: 73 },
];

const RecentInterviews = ({ interviews = defaultInterviews }) => {
  return (
    <div className="border border-[#D8D2C7] bg-[#FFFDF8] p-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">
            History
          </p>
          <h2 className="mt-1 text-xl font-black text-[#08142E]">
            Recent Interviews
          </h2>
        </div>
        <button className="flex items-center gap-1 border border-[#D8D2C7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#08142E] transition hover:border-[#FF5A1F] hover:text-[#FF5A1F]">
          View All
          <ArrowRight size={12} />
        </button>
      </div>

      <div className="space-y-3">
        {interviews.map((interview) => {
          const Icon = interview.type === "Coding" ? Code2 : MessageSquare;
          return (
            <div
              key={interview.id}
              className="group border border-[#E7E2D8] bg-[#FFFDF8] p-4 transition hover:border-[#FF5A1F]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center bg-[#08142E] text-white transition group-hover:bg-[#FF5A1F]">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#08142E]">
                      {interview.title}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-[#64748B]">
                      <span>{interview.type}</span>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={11} />
                        {interview.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#08142E]">
                    {interview.score}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FF5A1F]">
                    Score
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentInterviews;