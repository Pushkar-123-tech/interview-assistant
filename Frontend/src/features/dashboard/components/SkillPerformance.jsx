import {
  ArrowRight,
  BrainCircuit,
  Code2,
  Database,
  Layers3,
} from "lucide-react";

const defaultSkills = [
  { name: "Data Structures & Algorithms", score: 82, icon: BrainCircuit },
  { name: "Java", score: 76, icon: Code2 },
  { name: "React", score: 71, icon: Layers3 },
  { name: "DBMS", score: 68, icon: Database },
];

const SkillPerformance = ({ skills = defaultSkills }) => {
  const getLevel = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    return "Needs Practice";
  };

  return (
    <div className="border border-[#D8D2C7] bg-[#FFFDF8] p-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">
            Performance
          </p>
          <h2 className="mt-1 text-xl font-black text-[#08142E]">
            Skill Performance
          </h2>
        </div>
        <button className="flex items-center gap-1 border border-[#D8D2C7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#08142E] transition hover:border-[#FF5A1F] hover:text-[#FF5A1F]">
          View All
          <ArrowRight size={12} />
        </button>
      </div>

      <div className="space-y-3">
        {skills.map((skill) => {
          const Icon = skill.icon;
          return (
            <div
              key={skill.name}
              className="group border border-[#E7E2D8] bg-[#FFFDF8] p-4 transition hover:border-[#FF5A1F]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center bg-[#08142E] text-white transition group-hover:bg-[#FF5A1F]">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#08142E]">
                      {skill.name}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      {getLevel(skill.score)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#08142E]">
                    {skill.score}%
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                    Progress
                  </span>
                  <span className="text-xs font-bold text-[#08142E]">
                    {skill.score}%
                  </span>
                </div>
                <div className="h-1 bg-[#E8E3D8]">
                  <div
                    className="h-full bg-[#FF5A1F] transition-all duration-700"
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillPerformance;