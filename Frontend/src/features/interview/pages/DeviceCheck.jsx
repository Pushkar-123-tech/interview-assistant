import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CameraAnalyzer } from "../../behavioral-analysis/camera";
import CameraPanel from "../components/CameraPanel";
import useCamera from "../hooks/useCamera";
import useMicrophone from "../hooks/useMicrophone";
import useEnvironmentCheck from "../hooks/useEnvironmentCheck";
import MicrophoneWave from "../components/MicrophoneWave";

/* =========================================================
   SMALL ORANGE CHECK
========================================================= */

const CheckIcon = ({ active = false }) => (
  <span
    className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border ${active
      ? "border-[#ff5a1f] bg-[#ff5a1f]"
      : "border-zinc-300 bg-white"
      }`}
  >
    {active && (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-[9px] w-[9px] text-white"
      >
        <path
          d="M3.5 8L6.5 11L12.5 4.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </span>
);

/* =========================================================
   STATUS DOT
========================================================= */

const StatusIndicator = ({ ready }) => (
  <span
    className={`h-[7px] w-[7px] rounded-full ${ready ? "bg-[#ff5a1f]" : "bg-zinc-300"
      }`}
  />
);




/* =========================================================
   ENVIRONMENT ITEM
========================================================= */

const EnvironmentItem = ({ label, ready }) => (
  <div className="flex items-center gap-3">
    <CheckIcon active={ready} />

    <span
      className={`text-[13px] ${ready ? "text-zinc-700" : "text-zinc-400"
        }`}
    >
      {label}
    </span>
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const DeviceCheck = () => {
  const navigate = useNavigate();

  /* =======================================================
     CAMERA
  ======================================================= */

  const {
    videoRef,
    cameraReady,
    cameraError,
    startCamera,
    stopCamera,
  } = useCamera();

  /* =======================================================
     MICROPHONE
  ======================================================= */

  const {
    microphoneReady,
    microphoneError,
    checkMicrophone,
    analyser,
  } = useMicrophone();

  /* =======================================================
     ENVIRONMENT
  ======================================================= */

  const {
    lightingGood,
    backgroundClear,
    noiseGood,
  } = useEnvironmentCheck({
    videoRef,
    microphoneReady,
  });

  /* =======================================================
     STATE
  ======================================================= */

  const [checking, setChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(
    navigator.onLine
  );

  const [pageVisible, setPageVisible] = useState(
    document.visibilityState === "visible"
  );

  /* =======================================================
     INTERNET CHECK
  ======================================================= */

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /* =======================================================
     TAB VISIBILITY
  ======================================================= */

  useEffect(() => {
    const handleVisibility = () => {
      setPageVisible(
        document.visibilityState === "visible"
      );
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  /* =======================================================
     CHECK ALL DEVICES
  ======================================================= */

  const checkDevices = useCallback(async () => {
    try {
      setChecking(true);

      await startCamera();
      await checkMicrophone();
    } catch (error) {
      console.error(
        "Device check failed:",
        error
      );
    } finally {
      setChecking(false);
    }
  }, [startCamera, checkMicrophone]);


  /* =======================================================
     ENVIRONMENT READY
  ======================================================= */

  const environmentReady =
    lightingGood &&
    backgroundClear &&
    noiseGood &&
    isOnline;

  /* =======================================================
     EVERYTHING READY
  ======================================================= */

  const canContinue =
    cameraReady &&
    microphoneReady &&
    lightingGood &&
    backgroundClear &&
    noiseGood &&
    isOnline &&
    pageVisible;

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    stopCamera();
    navigate("/interview/setup");
  };

  /* =======================================================
     START INTERVIEW
  ======================================================= */

  const startInterview = async () => {
    if (!canContinue) {
      return;
    }

    stopCamera();

    try {
      if (
        document.fullscreenElement === null &&
        document.documentElement?.requestFullscreen
      ) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen request was blocked:", error);
    }

    navigate("/interview/room");
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#faf9f5] px-4 py-6 text-zinc-900 sm:px-6 lg:px-10">

      <div className="mx-auto max-w-6xl">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="mb-7 flex items-center justify-between">

          <button
            type="button"
            onClick={handleBack}
            className="group flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            <span className="text-base transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-[#ff5a1f]">
              ←
            </span>

            <span className="group-hover:text-[#ff5a1f]">
              Back
            </span>
          </button>

          <div className="hidden text-xs font-medium tracking-[0.16em] text-zinc-400 sm:block">
            INTERVIEW SETUP
          </div>

        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-zinc-900 sm:text-[36px]">
            Before We Start
          </h1>

          <p className="mt-1.5 text-sm text-zinc-500">
            Let's make sure everything is working properly.
          </p>

        </div>

        {/* =================================================
            DEVICE CARDS
        ================================================= */}

        <div className="grid gap-4 lg:grid-cols-3">

          {/* =================================================
              CAMERA
          ================================================= */}

          <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.025)]">

            <div className="mb-3 flex items-center gap-2">

              <CheckIcon active={cameraReady} />

              <h2 className="text-sm font-semibold text-zinc-800">
                Camera
              </h2>

            </div>

            {/* Camera Preview */}

            <div className="relative aspect-[1.48/1] overflow-hidden rounded-lg bg-[#f4f3ef]">

              <CameraPanel
                videoRef={videoRef}
                cameraReady={cameraReady}
              />

            </div>
            <CameraAnalyzer
              videoRef={videoRef}
              cameraReady={cameraReady}
            />

            {/* Camera Status */}

            <div className="mt-3 flex items-center gap-2">

              <StatusIndicator ready={cameraReady} />

              <span
                className={`text-xs font-medium ${cameraReady
                  ? "text-[#ff5a1f]"
                  : "text-zinc-400"
                  }`}
              >
                {cameraReady
                  ? "Camera Working"
                  : cameraError || "Camera not checked"}
              </span>

            </div>

            {/* Camera Selector */}

            <select
              defaultValue="default-camera"
              className="mt-3 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 outline-none transition hover:border-zinc-300 focus:border-[#ff5a1f] focus:ring-2 focus:ring-orange-100"
            >
              <option value="default-camera">
                Integrated Camera
              </option>
            </select>

          </div>

          {/* =================================================
              MICROPHONE
          ================================================= */}

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-zinc-900">
                  Microphone
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Speak normally to test your audio
                </p>
              </div>

              {microphoneReady && (
                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-orange-500" />

                  <span className="text-xs font-medium text-orange-500">
                    Listening
                  </span>

                </div>
              )}

            </div>

            {/* AUDIO WAVE */}

            <div className="mt-6 flex h-16 items-center justify-center rounded-xl bg-[#faf9f5]">

              <MicrophoneWave
                analyser={analyser}
                active={microphoneReady}
              />

            </div>

            {microphoneError && (
              <p className="mt-3 text-xs text-red-500">
                {microphoneError}
              </p>
            )}

            {microphoneReady && (
              <p className="mt-3 text-center text-xs text-zinc-400">
                Microphone is working. Try speaking.
              </p>
            )}

          </div>

          {/* =================================================
              ENVIRONMENT
          ================================================= */}

          <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.025)]">

            <div className="mb-6 flex items-center gap-2">

              <CheckIcon
                active={environmentReady}
              />

              <h2 className="text-sm font-semibold text-zinc-800">
                Environment
              </h2>

            </div>

            <div className="space-y-5">

              <EnvironmentItem
                label="Good Lighting"
                ready={lightingGood}
              />

              <EnvironmentItem
                label="Clear Background"
                ready={backgroundClear}
              />

              <EnvironmentItem
                label="No Background Noise"
                ready={noiseGood}
              />

              <EnvironmentItem
                label="Stable Internet"
                ready={isOnline}
              />

            </div>

          </div>

        </div>

        {/* =================================================
            ACTION
        ================================================= */}

        <div className="mt-7 flex flex-col items-center">

          {/* Check Again */}

          {!canContinue && (
            <button
              type="button"
              onClick={checkDevices}
              disabled={checking}
              className="mb-4 cursor-pointer text-xs font-medium text-zinc-500 transition hover:text-[#ff5a1f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checking
                ? "Checking devices..."
                : "Check devices again"}
            </button>
          )}

          {/* Continue */}

          <button
            type="button"
            onClick={startInterview}
            disabled={!canContinue || checking}
            className="
              flex
              min-w-[215px]
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-[#ff5a1f]
              px-7
              py-3
              text-sm
              font-semibold
              text-white
              shadow-[0_3px_10px_rgba(255,90,31,0.18)]
              transition-all
              duration-200
              hover:bg-[#f45117]
              hover:shadow-[0_5px_16px_rgba(255,90,31,0.22)]
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:bg-zinc-200
              disabled:text-zinc-400
              disabled:shadow-none
            "
          >
            {checking
              ? "Checking..."
              : "Continue to Interview"}

            {!checking && (
              <span className="text-base">
                →
              </span>
            )}
          </button>

          {/* Error */}

          {(cameraError ||
            microphoneError ||
            !isOnline) && (
              <p className="mt-3 max-w-md text-center text-xs text-red-500">
                Please make sure your camera, microphone,
                and internet connection are working before
                continuing.
              </p>
            )}

          {/* Tab switched */}

          {!pageVisible && (
            <p className="mt-3 text-xs font-medium text-orange-600">
              Please return to this interview tab to continue.
            </p>
          )}

        </div>

      </div>

    </div>
  );
};

export default DeviceCheck;