import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#F7F3EB] text-slate-900">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />
      
      <main 
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "pl-[82px]" : "pl-[260px]"
        }`}
      >
        <div className="mx-auto w-full max-w-[1920px] px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;