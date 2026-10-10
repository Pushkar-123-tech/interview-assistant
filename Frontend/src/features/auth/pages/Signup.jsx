import SignupForm from "../components/SignupForm";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  FileSearch,
  MessageSquareText,
} from "lucide-react";

const Signup = () => {
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

            <div className="mb-10 flex items-center gap-3">
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

            <div className="mb-5 flex items-center gap-4">
              <span className="h-[3px] w-11 bg-[#ff4b16]" />

              <span className="text-[11px] font-bold uppercase tracking-[0.34em] text-[#e94716]">
                Start Preparing
              </span>
            </div>

            {/* HEADING */}

            <h1 className="max-w-[570px] text-[50px] font-black leading-[0.98] tracking-[-0.055em] text-[#02081f] xl:text-[56px]">
              One workspace.
              <br />
              Every step toward
              <br />
              <span className="text-[#ff4b16]">
                interview ready.
              </span>
            </h1>

            <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-slate-600">
              Build a personalized preparation workspace around
              your skills, resume, target role and interview goals.
            </p>

            {/* FEATURES */}

            <div className="mt-7 grid max-w-[560px] grid-cols-2 gap-x-6 gap-y-4">
              <SignupFeature
                number="01"
                icon={FileSearch}
                title="Resume Analysis"
                description="Analyze your resume and identify areas to improve."
              />

              <SignupFeature
                number="02"
                icon={MessageSquareText}
                title="Mock Interviews"
                description="Practice interview questions for your target role."
              />

              <SignupFeature
                number="03"
                icon={BrainCircuit}
                title="Personalized Practice"
                description="Focus preparation around your skills and goals."
              />

              <SignupFeature
                number="04"
                icon={BarChart3}
                title="Track Progress"
                description="See your performance improve over time."
              />
            </div>

            {/* BOTTOM */}

            <div className="mt-8 flex items-center gap-3">
              <span className="text-[11px] font-bold text-[#ff4b16]">
                START
              </span>

              <span className="h-px w-10 bg-slate-300" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Create your workspace
              </span>

              <ArrowRight
                size={14}
                className="text-[#ff4b16]"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            SIGNUP
        ===================================================== */}

        <section className="flex min-h-0 items-center justify-center lg:justify-end">
          <SignupForm />
        </section>
      </div>
    </main>
  );
};

const SignupFeature = ({
  number,
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="group flex gap-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center
                   justify-center border border-slate-300
                   bg-[#fffdf8]
                   transition-all duration-200
                   group-hover:border-[#ff4b16]"
      >
        <Icon
          size={16}
          className="text-slate-500
                     transition-colors duration-200
                     group-hover:text-[#ff4b16]"
        />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-[#ff4b16]">
            {number}
          </span>

          <h3 className="text-[12px] font-bold text-[#02081f]">
            {title}
          </h3>
        </div>

        <p className="mt-1 max-w-[190px] text-[11px] leading-[17px] text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
};

export default Signup;