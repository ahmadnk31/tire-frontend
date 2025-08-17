import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

function pad(num: number) {
  return num.toString().padStart(2, "0");
}

export const FlashSaleHeader = () => {
  // Example: 8 hours, 17 minutes, 56 seconds
  const [time, setTime] = useState({ h: 8, m: 17, s: 56 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else if (m > 0) { m--; s = 59; }
        else if (h > 0) { h--; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between py-4 px-2">
      <div className="flex items-center gap-4">
        <Zap className="w-8 h-8 text-gray-900 bg-gray-100 rounded-full p-1" />
        <span className="text-2xl font-bold text-gray-900">Flash Sale</span>
        <div className="flex items-center gap-2 ml-4">
          <span className="bg-rose-500 text-white rounded-full px-3 py-1 text-lg font-bold">{pad(time.h)}</span>
          <span className="text-rose-500 font-bold text-lg">:</span>
          <span className="bg-rose-500 text-white rounded-full px-3 py-1 text-lg font-bold">{pad(time.m)}</span>
          <span className="text-rose-500 font-bold text-lg">:</span>
          <span className="bg-rose-500 text-white rounded-full px-3 py-1 text-lg font-bold">{pad(time.s)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 transition">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-900 bg-gray-900 text-white hover:bg-gray-800 transition">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}
