import { useEffect, useState } from "react";

const BAR_COUNT = 18;

const MicrophoneWave = ({ analyser, active }) => {
  const [levels, setLevels] = useState(
    Array(BAR_COUNT).fill(3)
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!active || !analyser) {
      setLevels(Array(BAR_COUNT).fill(3));
      return;
    }

    const data = new Uint8Array(
      analyser.fftSize
    );

    let animationFrame;
    let lastUpdate = 0;

    const update = (timestamp) => {
      animationFrame =
        requestAnimationFrame(update);

      // Limit React updates to roughly 30 FPS.
      if (timestamp - lastUpdate < 33) {
        return;
      }

      lastUpdate = timestamp;

      analyser.getByteTimeDomainData(data);

      let sum = 0;

      for (let i = 0; i < data.length; i++) {
        const normalized =
          (data[i] - 128) / 128;

        sum += normalized * normalized;
      }

      const rms = Math.sqrt(
        sum / data.length
      );

      /*
       * Small microphone noise should not
       * create a large waveform.
       */
      const noiseFloor = 0.015;

      const voiceLevel = Math.max(
        0,
        rms - noiseFloor
      );

      const normalized = Math.min(
        1,
        voiceLevel / 0.18
      );

      const newLevels = [];

      for (let i = 0; i < BAR_COUNT; i++) {

        /*
         * Make the middle bars slightly taller
         * to create a natural waveform shape.
         */
        const centerDistance =
          Math.abs(
            i - (BAR_COUNT - 1) / 2
          );

        const shape =
          1 -
          centerDistance /
            ((BAR_COUNT - 1) / 2);

        const variation =
          0.7 + shape * 0.3;

        const height =
          3 +
          Math.pow(normalized, 0.7) *
            42 *
            variation;

        newLevels.push(
          Math.min(45, height)
        );
      }

      setLevels(newLevels);
    };

    animationFrame =
      requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [analyser, active]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="flex h-14 items-center justify-center gap-[4px]">
      {levels.map((height, index) => (
        <span
          key={index}
          className="w-[3px] rounded-full bg-[#ff5a1f]"
          style={{
            height: `${height}px`,
            opacity:
              height <= 4 ? 0.25 : 0.9,
          }}
        />
      ))}
    </div>
  );
};

export default MicrophoneWave;