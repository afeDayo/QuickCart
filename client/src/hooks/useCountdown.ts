// useCountdown.ts client/src/hooks/useCountdown.ts
// Counts down to a moment, updating every second:
//   const { hours, minutes, seconds } = useCountdown(endOfToday);

// STEP 33 (part 2): A countdown hook

import { useEffect, useState } from "react";

export const useCountdown = (target: Date) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Every second, remember the new time; React re-draws with the new numbers
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer); // stop the timer when the component disappears
  }, []);

  const left = Math.max(0, target.getTime() - now); // milliseconds left, never below 0
  const totalSeconds = Math.floor(left / 1000);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    finished: left === 0,
  };
};
