import { useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Settings,
  Target,
  UserRound,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { signOut } from "../../auth/services/authService";

const navigation = [
  {
    name: "Overview",
    path: "/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "Mock Interview",
    path: "/dashboard/interview",
    icon: MessageSquareText,
  },
  {
    name: "Resume Analyzer",
    path: "/dashboard/resume",
    icon: FileSearch,
  },
  {
    name: "Practice",
    path: "/dashboard/practice",
    icon: Target,
  },
  {
    name: "Progress",
    path: "/dashboard/progress",
    icon: BarChart3,
  },
];

const accountNavigation = [
  {
    name: "Profile",
    path: "/dashboard/profile",
    icon: UserRound,
  },
  {
    name: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
  },
];

const Sidebar = ({ collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await signOut();

      localStorage.removeItem("edi-user");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className={`
    fixed
    left-0
    top-0
    z-20
    flex
    h-screen
    flex-col
    border-r
    border-slate-300
    bg-[#F7F3EB]
    shadow-[0_24px_80px_rgba(15,23,42,0.08)]
    transition-[width]
    duration-300
    ${collapsed ? "w-[82px]" : "w-[260px]"}
  `}
      style={{
        backgroundImage: `
      linear-gradient(rgba(15,23,42,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(15,23,42,0.025) 1px, transparent 1px)
    `,
        backgroundSize: "30px 30px",
      }}
    >
      {/* =====================================================
          BRAND
      ===================================================== */}

      <div
        className={`
          flex h-[88px] shrink-0 items-center
          border-b border-slate-300
          ${collapsed ? "justify-center px-3" : "px-6"}
        `}
      >
        <div className="flex items-center gap-3">
          {/* LOGO */}

          <div
            className="flex h-10 w-10 shrink-0 items-center
                       justify-center bg-[#02081f]
                       transition-colors duration-200"
          >
            <span className="text-sm font-black text-white">
              IA
            </span>
          </div>

          {/* NAME */}

          {!collapsed && (
            <div className="min-w-0">
              <p
                className="whitespace-nowrap text-[15px]
                           font-black tracking-[-0.035em]
                           text-[#02081f]"
              >
                Interview Assistant
              </p>

              <p
                className="mt-0.5 whitespace-nowrap
                           text-[9px] font-bold uppercase
                           tracking-[0.17em]
                           text-slate-400"
              >
                AI Preparation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          COLLAPSE BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={onToggleCollapse}
        className="absolute -right-[15px] top-[104px]
                   z-20 flex h-[30px] w-[30px]
                   cursor-pointer items-center justify-center
                   rounded-full border border-slate-300
                   bg-[#fffdf8]
                   text-slate-500
                   transition-all duration-200
                   hover:border-[#ff4b16]
                   hover:bg-[#ff4b16]
                   hover:text-white"
        aria-label={
          collapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
      >
        {collapsed ? (
          <ChevronRight size={15} />
        ) : (
          <ChevronLeft size={15} />
        )}
      </button>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <nav
          className={`
            pt-8
            ${collapsed ? "px-3" : "px-4"}
          `}
        >
          {!collapsed && (
            <p
              className="mb-3 px-3 text-[9px]
                         font-bold uppercase
                         tracking-[0.24em]
                         text-slate-400"
            >
              Workspace
            </p>
          )}

          <div className="space-y-1.5">
            {navigation.map((item) => (
              <SidebarLink
                key={item.name}
                item={item}
                collapsed={collapsed}
              />
            ))}
          </div>

          {/* ACCOUNT */}

          <div className="mt-9">
            {!collapsed && (
              <p
                className="mb-3 px-3 text-[9px]
                           font-bold uppercase
                           tracking-[0.24em]
                           text-slate-400"
              >
                Account
              </p>
            )}

            {collapsed && (
              <div className="mx-auto mb-5 h-px w-8 bg-slate-300" />
            )}

            <div className="space-y-1.5">
              {accountNavigation.map((item) => (
                <SidebarLink
                  key={item.name}
                  item={item}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        </nav>

        {/* =====================================================
            USER
        ===================================================== */}

        <div className="mt-auto">
          {!collapsed && (
            <div className="mx-4 mb-4 border border-slate-300 bg-[#fffdf8]/80 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0
                             items-center justify-center
                             bg-[#02081f]
                             text-[11px] font-bold text-white"
                >
                  U
                </div>

                <div className="min-w-0">
                  <p
                    className="truncate text-[12px]
                               font-bold text-[#02081f]"
                  >
                    Your Profile
                  </p>

                  <p
                    className="mt-0.5 truncate text-[10px]
                               text-slate-400"
                  >
                    Interview preparation
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* LOGOUT */}

          <div
            className={`
              border-t border-slate-300 py-4
              ${collapsed ? "px-3" : "px-4"}
            `}
          >
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              title={collapsed ? "Sign out" : undefined}
              className={`
                group flex h-[44px] w-full
                cursor-pointer items-center
                text-slate-500
                transition-all duration-200
                hover:bg-[#ff4b16]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-60

                ${collapsed
                  ? "justify-center"
                  : "gap-3 px-3"
                }
              `}
            >
              <LogOut
                size={18}
                className="shrink-0 transition-transform
                           duration-200
                           group-hover:translate-x-0.5"
              />

              {!collapsed && (
                <span className="text-[12px] font-semibold">
                  {loggingOut
                    ? "Signing out..."
                    : "Sign out"}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ORANGE BOTTOM ACCENT */}

      <div className="h-[3px] shrink-0 bg-[#ff4b16]" />
    </aside>
  );
};

// =========================================================
// SIDEBAR LINK
// =========================================================

const SidebarLink = ({
  item,
  collapsed,
}) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.end}
      title={collapsed ? item.name : undefined}
      className={({ isActive }) => `
        group relative flex h-[46px]
        cursor-pointer items-center
        transition-all duration-200

        ${collapsed
          ? "justify-center"
          : "gap-3 px-3"
        }

        ${isActive
          ? "bg-[#02081f] text-white"
          : "text-slate-600 hover:bg-[#fffdf8] hover:text-[#ff4b16]"
        }
      `}
    >
      {({ isActive }) => (
        <>
          {/* ACTIVE ORANGE LINE */}

          {isActive && (
            <span
              className="absolute left-0 top-0
                         h-full w-[3px]
                         bg-[#ff4b16]"
            />
          )}

          <Icon
            size={18}
            strokeWidth={1.8}
            className={`
              shrink-0 transition-all duration-200

              ${isActive
                ? "text-[#ff6a36]"
                : "text-slate-500 group-hover:text-[#ff4b16]"
              }
            `}
          />

          {!collapsed && (
            <>
              <span
                className={`
                  flex-1 text-left text-[12px]
                  font-semibold

                  ${isActive
                    ? "text-white"
                    : ""
                  }
                `}
              >
                {item.name}
              </span>

              {isActive && (
                <span className="h-1.5 w-1.5 bg-[#ff4b16]" />
              )}
            </>
          )}
        </>
      )}
    </NavLink>
  );
};

export default Sidebar;