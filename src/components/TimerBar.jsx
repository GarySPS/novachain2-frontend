//src>components>TimerBar.jsx
import React, { useEffect, useRef, useState } from "react";

export default function TimerBar({ endAt, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const secs = Math.ceil((endAt - Date.now()) / 1000);
    return secs > 0 ? secs : 0;
  });

  const intervalRef = useRef(null);
  const initialDuration = useRef(timeLeft);

  useEffect(() => {
    // Clear any old interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const remaining = Math.ceil((endAt - Date.now()) / 1000);
      setTimeLeft(remaining > 0 ? remaining : 0);

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [endAt, onComplete]);

  const percent =
    initialDuration.current > 0
      ? ((initialDuration.current - timeLeft) / initialDuration.current) * 100
      : 100;

  return (
    <div className="w-full max-w-[290px] flex flex-col items-center">
      {/* Sleek Timer Countdown */}
      <div className="mb-4 text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
        {timeLeft}<span className="text-2xl text-gray-400 ml-1">s</span>
      </div>
      
      {/* Premium Glass Track */}
      <div className="relative w-full h-3 bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
        {/* Glowing Progress Fill */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
            boxShadow: "0 0 20px rgba(52, 211, 153, 0.6)",
          }}
        />
      </div>
      
      {/* Subtle Status Text */}
      <div className="mt-3 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] animate-pulse">
        Executing Trade
      </div>
    </div>
  );
}
