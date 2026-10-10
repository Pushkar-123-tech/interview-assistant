import { useEffect, useRef, useState } from "react";

const useEnvironmentCheck = ({
  videoRef,
  microphoneReady,
}) => {
  const [lightingGood, setLightingGood] = useState(false);
  const [backgroundClear, setBackgroundClear] = useState(false);

  const animationRef = useRef(null);

  /*
   * ============================================
   * LIGHTING CHECK
   * ============================================
   */

  useEffect(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    const checkLighting = () => {
      const video = videoRef.current;

      if (
        !video ||
        video.readyState < 2 ||
        video.videoWidth === 0
      ) {
        animationRef.current =
          requestAnimationFrame(checkLighting);

        return;
      }

      canvas.width = 160;
      canvas.height = 90;

      ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      let totalBrightness = 0;

      for (
        let i = 0;
        i < imageData.data.length;
        i += 4
      ) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        const brightness =
          0.299 * r +
          0.587 * g +
          0.114 * b;

        totalBrightness += brightness;
      }

      const averageBrightness =
        totalBrightness /
        (imageData.data.length / 4);

      /*
       * 55 - 210 is a reasonable interview range.
       */
      setLightingGood(
        averageBrightness >= 55 &&
        averageBrightness <= 210
      );

      /*
       * This is only a basic placeholder for background.
       * It does NOT claim actual person segmentation.
       */
      setBackgroundClear(
        averageBrightness > 40
      );

      animationRef.current =
        requestAnimationFrame(checkLighting);
    };

    checkLighting();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [videoRef]);

  return {
    lightingGood,
    backgroundClear,
    noiseGood: microphoneReady,
  };
};

export default useEnvironmentCheck;