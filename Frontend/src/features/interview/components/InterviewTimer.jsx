import { useEffect, useState } from "react";

const InterviewTimer = ({ initialSeconds = 1800 }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="font-mono text-lg">
      {String(minutes).padStart(2, "0")}:
      {String(remainingSeconds).padStart(2, "0")}
    </div>
  );
};

export default InterviewTimer;