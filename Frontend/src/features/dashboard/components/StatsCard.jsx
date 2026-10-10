import { ArrowUpRight, TrendingUp } from "lucide-react";

const StatsCard = ({ icon: Icon, label, value, description, trend }) => {
  return (
    <div className="group border border-[#D8D2C7] bg-[#FFFDF8] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5A1F] hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center bg-[#08142E] text-white transition duration-300 group-hover:bg-[#FF5A1F]">
          <Icon size={18} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 border border-[#FFD8CB] bg-[#FFF2EC] px-2 py-1">
            <TrendingUp size={10} className="text-[#FF5A1F]" />
            <span className="text-[9px] font-bold uppercase text-[#FF5A1F]">
              {trend}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#94A3B8]">
          {label}
        </p>
        <p className="mt-1 text-3xl font-black text-[#08142E]">
          {value}
        </p>
        {description && (
          <p className="mt-1 text-xs text-[#64748B]">
            {description}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#E7E2D8] pt-3">
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
          Live Data
        </span>
        <button className="flex h-7 w-7 items-center justify-center border border-[#D8D2C7] text-[#08142E] transition hover:border-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-white">
          <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default StatsCard;