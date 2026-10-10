import {
  Activity,
  Award,
  CalendarDays,
  Target,
  Clock,
} from "lucide-react";

import StatsCard from "../components/StatsCard";
import ReadinessScore from "../components/ReadinessScore";
import QuickActions from "../components/QuickActions";
import SkillPerformance from "../components/SkillPerformance";
import RecentInterviews from "../components/RecentInterviews";
import AIRecommendation from "../components/AIRecommendation";
import WeeklyGoal from "../components/WeeklyGoal";

const Overview = () => {
  const userName = "Pushkar";

  const stats = [
    {
      label: "Total Interviews",
      value: "12",
      description: "Completed mock interviews",
      trend: "+3 This Week",
      icon: CalendarDays,
    },
    {
      label: "Average Score",
      value: "78%",
      description: "Across all interviews",
      trend: "+6%",
      icon: Award,
    },
    {
      label: "Practice Streak",
      value: "7 Days",
      description: "Current learning streak",
      icon: Activity,
    },
    {
      label: "Questions Solved",
      value: "48",
      description: "Technical & Behavioral",
      trend: "+12",
      icon: Target,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      <div className="mx-auto max-w-[1920px] px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-xl border border-[#D8D2C7] bg-[#FFFDF8] p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FF5A1F]">
                Dashboard Overview
              </p>
              <h1 className="mt-2 text-3xl font-black text-[#08142E] md:text-4xl">
                Welcome back, <span className="text-[#FF5A1F]">{userName}</span>
              </h1>
              <p className="mt-2 text-sm text-[#64748B] md:text-base">
                Track your interview preparation and monitor your performance.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#D8D2C7] bg-[#F7F3EB] px-4 py-2">
              <Clock size={16} className="text-[#64748B]" />
              <span className="text-xs font-semibold text-[#08142E]">
                Updated: Today, 2:30 PM
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Main Grid - 2 columns */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Takes 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SkillPerformance />
              <RecentInterviews />
            </div>
            <AIRecommendation />
          </div>
          
          {/* Right Column - Takes 1/3 */}
          <div className="space-y-6">
            <ReadinessScore score={78} />
            <WeeklyGoal completed={3} target={5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;