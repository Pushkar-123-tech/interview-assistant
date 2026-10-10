import LoginForm from "../components/LoginForm";
import {
  BarChart3,
  FileSearch,
  MessageSquareText,
} from "lucide-react";

const Login = () => {
  return (
    <main
      className="h-screen overflow-hidden bg-[#f5f2e9] text-[#02081f]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "34px 34px",
      }}
    >
      <div className="mx-auto grid h-full w-full max-w-[1320px] items-center gap-16 px-6 sm:px-10 lg:grid-cols-[1fr_440px] lg:px-14 xl:gap-24 xl:px-16">
        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <section className="hidden lg:flex lg:items-center">
          <div className="max-w-[590px]">
            {/* BRAND */}

            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-[#02081f]">
                <span className="text-sm font-black text-white">
                  IA
                </span>
              </div>

              <div>
                <p className="text-[16px] font-black tracking-[-0.035em] text-[#02081f]">
                  Interview Assistant
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  AI Interview Preparation
                </p>
              </div>
            </div>

            {/* LABEL */}

            <div className="mb-6 flex items-center gap-4">
              <span className="h-[3px] w-11 bg-[#ff4b16]" />

              <span className="text-[11px] font-bold uppercase tracking-[0.34em] text-[#e94716]">
                Welcome Back
              </span>
            </div>

            {/* MAIN HEADING */}

            <h1 className="max-w-[570px] text-[54px] font-black leading-[0.97] tracking-[-0.055em] text-[#02081f] xl:text-[60px]">
              Get ready for
              <br />
              your next
              <span className="text-[#ff4b16]"> interview.</span>
            </h1>

            {/* DESCRIPTION */}

            <p className="mt-6 max-w-[530px] text-[16px] leading-7 text-slate-600">
              Practice interviews, analyze your resume and
              strengthen the skills that matter for your target role.
            </p>

            {/* FEATURES */}

            <div className="mt-9 grid max-w-[560px] grid-cols-3 gap-3">
              <Feature
                icon={MessageSquareText}
                title="AI Interviews"
                description="Practice"
              />

              <Feature
                icon={FileSearch}
                title="Resume ATS"
                description="Improve"
              />

              <Feature
                icon={BarChart3}
                title="Performance"
                description="Track"
              />
            </div>

            {/* BOTTOM MESSAGE */}

            <div className="mt-10 flex items-center gap-3">
              <span className="text-[11px] font-bold text-[#ff4b16]">
                01
              </span>

              <span className="h-px w-9 bg-slate-300" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Continue your preparation
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            LOGIN
        ===================================================== */}

        <section className="flex min-h-0 items-center justify-center lg:justify-end">
          <LoginForm />
        </section>
      </div>
    </main>
  );
};

const Feature = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div
      className="group border border-slate-300/80
                 bg-[#fffdf8]/60 px-4 py-4
                 transition-all duration-200
                 hover:-translate-y-1
                 hover:border-[#ff4b16]
                 hover:bg-[#fffdf8]"
    >
      <Icon
        size={18}
        className="mb-3 text-slate-500
                   transition-colors duration-200
                   group-hover:text-[#ff4b16]"
      />

      <p className="text-[12px] font-bold text-[#02081f]">
        {title}
      </p>

      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-400">
        {description}
      </p>
    </div>
  );
};

export default Login;