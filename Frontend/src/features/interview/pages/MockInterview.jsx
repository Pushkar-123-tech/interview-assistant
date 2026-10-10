import { useNavigate } from "react-router-dom";

const MockInterview = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#071936]">
      <div className="mx-auto min-h-screen max-w-[1500px] px-6 py-8 lg:px-12">

        {/* Back */}
        {/* <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-10 flex items-center gap-2 text-sm font-medium text-[#61718b] transition hover:text-[#071936]"
        >
          <span className="text-lg">←</span>
          Back to dashboard
        </button> */}

        {/* Header */}
        <div className="mb-8 rounded-[28px] border border-[#ded9cf] bg-[#fffdfa] px-8 py-8 shadow-[0_8px_30px_rgba(20,20,20,0.03)] lg:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <p className="mb-3 text-xs font-bold tracking-[0.22em] text-[#ff5a1f]">
                INTERVIEW ASSISTANT
              </p>

              <h1 className="text-4xl font-bold tracking-tight text-[#071936] md:text-5xl">
                Turn practice{" "}
                <span className="text-[#ff5a1f]">
                  into performance
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[#61718b]">
                Practice realistic interview questions and improve your
                answers with personalized AI feedback.
              </p>
            </div>

            {/* AI Status */}
            <div className="flex w-fit items-center gap-3 rounded-full border border-[#e2ddd4] bg-[#f8f5ed] px-5 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0e9] text-[#ff5a1f]">
                ✦
              </span>

              <div>
                <p className="text-xs font-semibold text-[#071936]">
                  AI Interviewer
                </p>

                <p className="text-[11px] text-[#718097]">
                  Ready to practice
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Main Interview Card */}
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">

          {/* Left */}
          <div className="rounded-[28px] border border-[#ded9cf] bg-[#fffdfa] p-8 shadow-[0_8px_30px_rgba(20,20,20,0.03)] lg:p-10">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-[#ff5a1f]">
                  MOCK INTERVIEW
                </p>

                <p className="mt-2 text-sm text-[#718097]">
                  Your AI interviewer is ready
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-[#edf9f1] px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-[#20a45b]" />
                <span className="text-xs font-semibold text-[#168449]">
                  AI READY
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="mt-14">
              <p className="text-sm font-medium text-[#8a94a5]">
                Question 01
              </p>

              <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.2] tracking-tight text-[#071936] md:text-4xl">
                Tell me about yourself and your recent work.
              </h2>
            </div>

            {/* Interviewer */}
            <div className="mt-14 flex items-center gap-4 border-t border-[#ebe7df] pt-7">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#071936] text-lg text-white">
                AI
              </div>

              <div>
                <p className="text-sm font-semibold text-[#071936]">
                  AI Interviewer
                </p>

                <p className="mt-1 text-xs text-[#718097]">
                  Ready to begin your interview
                </p>
              </div>

            </div>

          </div>

          {/* Right Preview Card */}
          <div className="rounded-[28px] border border-[#ded9cf] bg-[#fffdfa] p-8 shadow-[0_8px_30px_rgba(20,20,20,0.03)] lg:p-10">

            <div className="flex items-center justify-between">
              <p className="text-xs font-bold tracking-[0.2em] text-[#ff5a1f]">
                INTERVIEW PREVIEW
              </p>

              <span className="text-sm text-[#8a94a5]">
                01 / 10
              </span>
            </div>

            {/* AI Avatar */}
            <div className="mt-8 flex h-[270px] items-center justify-center rounded-[22px] border border-[#e3ded5] bg-[#f4f1e9]">

              <div className="text-center">

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#071936] text-2xl font-semibold text-white shadow-lg">
                  AI
                </div>

                <p className="mt-5 text-sm font-semibold text-[#071936]">
                  AI Interviewer
                </p>

                <div className="mt-3 flex justify-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f]" />
                </div>

              </div>

            </div>

            

            {/* Start */}
            <button
              type="button"
              onClick={() => navigate("/interview/setup")}
              className="mt-6 w-full rounded-xl bg-[#ff5a1f] px-6 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,90,31,0.18)] transition duration-200 hover:bg-[#e94d16] cursor-pointer hover:shadow-[0_10px_25px_rgba(255,90,31,0.25)]"
            >
              Start mock interview →
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default MockInterview;