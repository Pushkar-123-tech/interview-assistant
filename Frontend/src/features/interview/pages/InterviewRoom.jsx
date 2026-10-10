import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CameraAnalyzer } from "../../behavioral-analysis/camera";
import LiveAudioBehavior from "../../behavioral-analysis/microphone/components/LiveAudioBehavior";


import CameraPanel from "../components/CameraPanel";
import InterviewTimer from "../components/InterviewTimer";
import WarningModal from "../components/WarningModal";

import useCamera from "../hooks/useCamera";
import useMicrophone from "../hooks/useMicrophone";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";




/* =========================================================
   INTERVIEW QUESTIONS
========================================================= */

const questions = [
  "Tell me about yourself and your experience.",
  "What is the difference between REST and GraphQL?",
  "Explain how authentication works in a modern web application.",
  "How would you improve the performance of a React application?",
  "Tell me about a challenging project you worked on.",
];

/* =========================================================
   INTERVIEW ROOM
========================================================= */

const InterviewRoom = () => {
  const navigate = useNavigate();

  /* =======================================================
     INTERVIEW STATE
  ======================================================= */

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [transcript, setTranscript] = useState("");

  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState("end");
  const warningOpenRef = useRef(false);

  const [questionSpeaking, setQuestionSpeaking] =
    useState(false);

  const [answerSaved, setAnswerSaved] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [startingAnswer, setStartingAnswer] =
    useState(false);

  /* =======================================================
     CURRENT QUESTION
  ======================================================= */

  const question = questions[currentQuestion];

  const isLastQuestion =
    currentQuestion === questions.length - 1;

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  /* =======================================================
     CAMERA
  ======================================================= */

  const {
    videoRef,
    cameraReady,
    startCamera,
    stopCamera,
  } = useCamera();

  /* =======================================================
     MICROPHONE
  ======================================================= */

  const {
    analyser,
    microphoneReady,
    microphoneError,
    checkMicrophone,
    stopMicrophone,
  } = useMicrophone();

  /* =======================================================
     SPEECH RECOGNITION
  ======================================================= */

  const {
    listening,
    supported,
    startListening,
    stopListening,
  } = useSpeechRecognition(setTranscript);

  /* =======================================================
     SPEECH SYNTHESIS
  ======================================================= */

  const {
    speak,
    stop: stopSpeaking,
  } = useSpeechSynthesis();

  /* =======================================================
     START CAMERA + MICROPHONE WHEN ROOM OPENS
  ======================================================= */

  useEffect(() => {
    warningOpenRef.current = showWarning;
  }, [showWarning]);

  useEffect(() => {
    let mounted = true;

    const initializeInterviewRoom = async () => {
      try {
        await startCamera();

        if (!mounted) return;

        await checkMicrophone();

        if (!mounted) return;

        try {
          if (
            document.fullscreenElement === null &&
            document.documentElement?.requestFullscreen
          ) {
            await document.documentElement.requestFullscreen();
          }
        } catch (error) {
          console.warn(
            "Interview fullscreen request was blocked:",
            error
          );
        }
      } catch (error) {
        console.error(
          "Interview room initialization failed:",
          error
        );
      }
    };

    initializeInterviewRoom();

    const handleFullscreenChange = () => {
      if (
        document.fullscreenElement === null &&
        !warningOpenRef.current
      ) {
        setWarningType("fullscreen");
        setShowWarning(true);
      }
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      mounted = false;
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );

      stopListening();
      stopSpeaking();

      stopCamera();
      stopMicrophone();
    };
  }, [
    startCamera,
    stopCamera,
    checkMicrophone,
    stopMicrophone,
    stopListening,
    stopSpeaking,
  ]);

  /* =======================================================
     SPEAK CURRENT QUESTION
  ======================================================= */

  useEffect(() => {
    const preventCopyActions = (event) => {
      const forbiddenKeys = ["c", "x", "v", "a", "s", "p"];
      const isModifierPressed = event.ctrlKey || event.metaKey;
      const isBlockedShortcut =
        isModifierPressed &&
        typeof event.key === "string" &&
        forbiddenKeys.includes(event.key.toLowerCase());

      if (
        event.type === "copy" ||
        event.type === "cut" ||
        event.type === "paste" ||
        event.type === "contextmenu" ||
        event.type === "dragstart" ||
        event.type === "selectstart" ||
        isBlockedShortcut
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    const protectedEvents = [
      "copy",
      "cut",
      "paste",
      "contextmenu",
      "dragstart",
      "selectstart",
    ];

    protectedEvents.forEach((eventName) => {
      document.addEventListener(eventName, preventCopyActions, {
        passive: false,
      });
    });
    document.addEventListener("keydown", preventCopyActions, {
      passive: false,
    });

    const previousUserSelect = document.body.style.userSelect;
    const previousWebkitUserSelect =
      document.body.style.webkitUserSelect;
    const previousMsUserSelect = document.body.style.msUserSelect;

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.msUserSelect = "none";

    return () => {
      protectedEvents.forEach((eventName) => {
        document.removeEventListener(
          eventName,
          preventCopyActions
        );
      });
      document.removeEventListener("keydown", preventCopyActions);

      document.body.style.userSelect = previousUserSelect;
      document.body.style.webkitUserSelect = previousWebkitUserSelect;
      document.body.style.msUserSelect = previousMsUserSelect;
    };
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTranscript("");
    setAnswerSaved(false);

    setQuestionSpeaking(true);

    speak(question);

    /*
     * Approximate duration only for UI state.
     * Browser speech synthesis itself controls
     * the actual speech.
     */
    const estimatedSpeechTime = Math.max(
      2200,
      question.length * 55
    );

    const timer = setTimeout(() => {
      setQuestionSpeaking(false);
    }, estimatedSpeechTime);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [
    currentQuestion,
    question,
    speak,
    stopSpeaking,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* =======================================================
     START ANSWER
  ======================================================= */

  const handleStartAnswer = async () => {
    if (startingAnswer || listening) {
      return;
    }

    try {
      setStartingAnswer(true);

      /*
       * Stop AI voice before candidate starts speaking.
       */
      stopSpeaking();
      setQuestionSpeaking(false);

      /*
       * Clear previous answer.
       */
      setTranscript("");
      setAnswerSaved(false);

      /*
       * If microphone was not initialized,
       * initialize it now.
       */
      if (!microphoneReady) {
        const stream = await checkMicrophone();

        if (!stream) {
          console.error(
            "Unable to access microphone."
          );

          setStartingAnswer(false);
          return;
        }
      }

      /*
       * Start browser speech recognition.
       */
      startListening();
    } catch (error) {
      console.error(
        "Failed to start answering:",
        error
      );
    } finally {
      setStartingAnswer(false);
    }
  };

  /* =======================================================
     STOP ANSWER
  ======================================================= */

  const handleStopAnswer = () => {
    stopListening();
  };

  /* =======================================================
     SAVE ANSWER
  ======================================================= */

  const handleSaveAnswer = async () => {
    if (!transcript.trim()) {
      return;
    }

    try {
      setSaving(true);

      /*
       * Temporary save simulation.
       *
       * Later:
       * POST /api/interview/answers
       */
      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      setAnswerSaved(true);
    } catch (error) {
      console.error(
        "Failed to save answer:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     NEXT QUESTION
  ======================================================= */

  const handleNext = () => {
    /*
     * Don't allow moving forward without
     * an answer.
     */
    if (!transcript.trim()) {
      return;
    }

    stopListening();
    stopSpeaking();

    /*
     * Last question.
     */
    if (isLastQuestion) {
      stopCamera();
      stopMicrophone();

      navigate("/interview/complete");

      return;
    }

    /*
     * Move to next question.
     */
    setCurrentQuestion(
      (previous) => previous + 1
    );

    setTranscript("");
    setAnswerSaved(false);
  };

  /* =======================================================
     END INTERVIEW
  ======================================================= */

  const handleEndInterview = () => {
    stopListening();
    stopSpeaking();

    setWarningType("end");
    setShowWarning(true);
  };

  /* =======================================================
     CONFIRM END INTERVIEW
  ======================================================= */

  const handleConfirmEnd = () => {
    stopListening();
    stopSpeaking();

    stopCamera();
    stopMicrophone();

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    navigate("/interview/complete");
  };

  const handleWarningClose = async () => {
    setShowWarning(false);

    if (warningType === "fullscreen") {
      try {
        if (
          document.fullscreenElement === null &&
          document.documentElement?.requestFullscreen
        ) {
          await document.documentElement.requestFullscreen();
        }
      } catch (error) {
        console.warn("Unable to restore fullscreen:", error);
      }
    }
  };

  /* =======================================================
     LISTEN TO QUESTION AGAIN
  ======================================================= */

  const handleListenQuestion = () => {
    if (listening) {
      return;
    }

    stopSpeaking();

    setQuestionSpeaking(true);

    speak(question);

    const estimatedSpeechTime = Math.max(
      2200,
      question.length * 55
    );

    setTimeout(() => {
      setQuestionSpeaking(false);
    }, estimatedSpeechTime);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#faf9f5] text-zinc-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-zinc-200 bg-[#faf9f5]">

        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-10">

          <div>
            <p className="text-[11px] font-semibold tracking-[0.25em] text-[#ff5a1f]">
              03 / INTERVIEW
            </p>

            <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
              Technical Interview
            </h1>
          </div>

          <div className="flex items-center gap-4">

            {/* LIVE STATUS */}

            <div className="hidden items-center gap-2 sm:flex">

              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff5a1f]" />

              <span className="text-xs font-medium text-zinc-500">
                Live
              </span>

            </div>

            <InterviewTimer
              initialSeconds={30 * 60}
            />

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-[1400px] px-6 py-7 lg:px-10">

        {/* ===================================================
            PROGRESS
        =================================================== */}

        <section className="mb-7">

          <div className="mb-3 flex items-center justify-between">

            <p className="text-sm text-zinc-500">

              Question{" "}

              <span className="font-semibold text-zinc-800">
                {currentQuestion + 1}
              </span>

              {" "}of{" "}

              {questions.length}

            </p>

            <p className="text-sm font-medium text-zinc-500">
              {Math.round(progress)}%
            </p>

          </div>

          <div className="h-[3px] overflow-hidden rounded-full bg-zinc-200">

            <div
              className="h-full rounded-full bg-[#ff5a1f] transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </section>


        {/* ===================================================
            MAIN GRID
        =================================================== */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <section className="min-w-0">

            {/* =================================================
                QUESTION CARD
            ================================================= */}

            <div className="rounded-[26px] border border-zinc-200 bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.025)] lg:p-10">

              <div className="flex items-center justify-between">

                <p className="text-[11px] font-semibold tracking-[0.2em] text-zinc-400">
                  QUESTION{" "}
                  {String(
                    currentQuestion + 1
                  ).padStart(2, "0")}
                </p>

                {questionSpeaking && (
                  <div className="flex items-center gap-2 text-xs font-medium text-[#ff5a1f]">

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50">
                      🔊
                    </span>

                    AI is speaking

                  </div>
                )}

              </div>

              <h2 className="mt-7 max-w-4xl text-3xl font-medium leading-[1.25] tracking-tight text-zinc-950 lg:text-[38px]">

                {question}

              </h2>

              <button
                type="button"
                onClick={handleListenQuestion}
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-[#ff5a1f] hover:bg-orange-50 hover:text-[#ff5a1f]"
              >
                <span>🔊</span>

                Listen to question
              </button>

            </div>


            {/* =================================================
                LIVE TRANSCRIPT
            ================================================= */}

            <div className="mt-6 rounded-[26px] border border-zinc-200 bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.025)]">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-[11px] font-semibold tracking-[0.2em] text-zinc-400">
                    LIVE TRANSCRIPT
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    Your answer appears here as you speak.
                  </p>

                </div>

                {listening && (
                  <div className="flex shrink-0 items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-medium text-[#ff5a1f]">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff5a1f]" />

                    Listening

                  </div>
                )}

              </div>

              <div className="mt-6 min-h-[150px]">

                {transcript ? (

                  <p className="text-[17px] leading-8 text-zinc-700">
                    {transcript}
                  </p>

                ) : (

                  <div className="flex min-h-[120px] items-center">

                    <p className="text-sm text-zinc-400">

                      {listening
                        ? "Start speaking. Your answer will appear here..."
                        : "Your answer will appear here as you speak..."}

                    </p>

                  </div>

                )}

              </div>

            </div>


            {/* =================================================
                ANSWER CONTROL
            ================================================= */}

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                {/* STATUS */}

                <div className="flex items-center gap-3">

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      listening
                        ? "bg-orange-50 text-[#ff5a1f]"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    🎙
                  </div>

                  <div>

                    <p className="text-sm font-medium text-zinc-800">

                      {listening
                        ? "Listening to your answer"
                        : answerSaved
                        ? "Answer saved"
                        : "Ready for your answer"}

                    </p>

                    <p className="text-xs text-zinc-400">

                      {listening
                        ? "Speak clearly and explain your reasoning."
                        : "Take your time before responding."}

                    </p>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="flex flex-wrap gap-2">

                  {listening ? (

                    <button
                      type="button"
                      onClick={handleStopAnswer}
                      className="rounded-xl border border-[#ff5a1f] bg-white px-5 py-2.5 text-sm font-semibold text-[#ff5a1f] transition hover:bg-orange-50"
                    >
                      Stop answering
                    </button>

                  ) : (

                    <button
                      type="button"
                      onClick={handleStartAnswer}
                      disabled={
                        questionSpeaking ||
                        !supported ||
                        startingAnswer
                      }
                      className="rounded-xl bg-[#ff5a1f] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e94e18] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {startingAnswer
                        ? "Starting..."
                        : "🎙 Start answering"}
                    </button>

                  )}

                  <button
                    type="button"
                    onClick={handleSaveAnswer}
                    disabled={
                      !transcript.trim() ||
                      saving ||
                      answerSaved
                    }
                    className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving
                      ? "Saving..."
                      : answerSaved
                      ? "✓ Saved"
                      : "Save answer"}
                  </button>

                </div>

              </div>

            </div>


            {/* =================================================
                BOTTOM NAVIGATION
            ================================================= */}

            <div className="mt-5 flex items-center justify-between">

              <button
                type="button"
                onClick={handleEndInterview}
                className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                End interview
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={
                  !transcript.trim() ||
                  listening
                }
                className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {isLastQuestion
                  ? "Finish interview"
                  : "Next question →"}
              </button>

            </div>

          </section>


          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-5">

            {/* =================================================
                CAMERA
            ================================================= */}

            <div className="overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.025)]">

              <div className="flex items-center justify-between px-5 py-4">

                <div>

                  <h3 className="text-sm font-semibold text-zinc-900">
                    Your camera
                  </h3>

                  <p className="mt-0.5 text-xs text-zinc-400">
                    Stay visible during the interview
                  </p>

                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">

                  <span
                    className={`h-2 w-2 rounded-full ${
                      cameraReady
                        ? "bg-[#ff5a1f]"
                        : "bg-zinc-300"
                    }`}
                  />

                  {cameraReady
                    ? "Camera on"
                    : "Camera unavailable"}

                </div>

              </div>

              <div className="border-t border-zinc-100 bg-zinc-100">

                <div className="aspect-video">

                  <CameraPanel
                    videoRef={videoRef}
                    cameraReady={cameraReady}
                  />

                </div>

                <div className="border-t border-zinc-200 bg-white p-3">
                  <CameraAnalyzer
                    videoRef={videoRef}
                    cameraReady={cameraReady}
                  />
                </div>

              </div>

            </div>


            {/* =================================================
                MICROPHONE
            ================================================= */}

            <div className="rounded-[22px] border border-zinc-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.025)]">
              <LiveAudioBehavior
                analyser={analyser}
                active={microphoneReady}
                error={microphoneError}
                listening={listening}
              />
            </div>


            {/* =================================================
                INTERVIEW TIP
            ================================================= */}

            <div className="rounded-[22px] border border-orange-200 bg-[#fffaf3] p-5">

              <div className="flex gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ff5a1f] text-sm font-bold text-white">
                  i
                </div>

                <div>

                  <h3 className="text-sm font-semibold text-zinc-900">
                    Interview tip
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    Take a moment to think before answering.
                    Speak clearly and explain your reasoning
                    instead of giving only the final answer.
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </main>


      {/* =====================================================
          WARNING MODAL
      ===================================================== */}

      <WarningModal
        open={showWarning}
        onClose={handleWarningClose}
        onConfirm={handleConfirmEnd}
        eyebrow={warningType === "fullscreen" ? "FULLSCREEN ALERT" : "END INTERVIEW"}
        title={
          warningType === "fullscreen"
            ? "Return to fullscreen"
            : "Are you sure?"
        }
        message={
          warningType === "fullscreen"
            ? "You exited fullscreen mode. Return to fullscreen to continue the interview without interruption."
            : "Your interview will end and your completed answers will be submitted for analysis."
        }
        cancelLabel={
          warningType === "fullscreen"
            ? "Return to fullscreen"
            : "Continue interview"
        }
        confirmLabel={
          warningType === "fullscreen"
            ? "End interview"
            : "End interview"
        }
      />

    </div>
  );
};

export default InterviewRoom;