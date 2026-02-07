import { useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";

const DUMMY_NO_MAYHEM = "1900-07-01 00:00:00";

type Props = {
  timezone: string;
};

export default function MayhemCountdown({ timezone }: Props) {
  const [target, setTarget] = useState<DateTime | null>(null);
  const [label, setLabel] = useState("LOADING…");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const totalSecondsRef = useRef<number>(0);

  // --- Fetch countdown target ---
  useEffect(() => {
    async function loadCountdown() {
      try {
        const res = await fetch("/.netlify/functions/mayhem-countdown");
        const json = await res.json();

        if (!json?.countdown_to || json.countdown_to === DUMMY_NO_MAYHEM) {
          setTarget(null);
          setLabel("NO MAYHEM SCHEDULED");
          setSecondsLeft(null);
          return;
        }

        // Parse target in given timezone
        // In loadCountdown
        // Parse target in NJ time
const dt = DateTime.fromFormat(json.countdown_to, "yyyy-MM-dd HH:mm:ss", {
    zone: "America/New_York"
  });
  console.log("dt", dt);
  setTarget(dt);
  
  // Compare against now in NJ time
  const now = DateTime.now().setZone("America/New_York");
  totalSecondsRef.current = Math.max(
    Math.floor(dt.diff(now, "seconds").seconds),
    1
  );
      } catch (e) {
        console.log("Countdown fetch failed", e);
        setLabel("NO MAYHEM SCHEDULED");
        setSecondsLeft(null);
      }
    }

    loadCountdown();
    const poll = setInterval(loadCountdown, 10000);
    return () => clearInterval(poll);
  }, [timezone]);

  // --- Countdown tick ---
  useEffect(() => {
    if (!target) return;

    const timer = setInterval(() => {
      const now = DateTime.now().setZone(timezone);
      const diff = Math.floor(target.diff(now, "seconds").seconds);

      if (diff <= 0) {
        setLabel("🔥 MAYHEM STARTED!");
        setSecondsLeft(0);
        clearInterval(timer);
        return;
      }

      setSecondsLeft(diff);

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setLabel(
        `${days}d ${hours.toString().padStart(2, "0")}h ` +
          `${minutes.toString().padStart(2, "0")}m ` +
          `${seconds.toString().padStart(2, "0")}s`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [target, timezone]);

  // --- Heartbeat intensity logic ---
  let pulseClass = "pulse-soft";

  if (secondsLeft !== null) {
    if (secondsLeft <= 60) pulseClass = "pulse-insane"; // last minute
    else if (secondsLeft <= 300) pulseClass = "pulse-strong"; // last 5 min
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div className={`mayhem-timer ${pulseClass}`}>
        {label}
      </div>

      <style>{`
        .mayhem-timer {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 0.6px;
          color: #ffffff;
          text-shadow: 0 0 16px rgba(0,170,255,0.8);
          transform-origin: center;
        }

        .pulse-soft {
          animation: pulseSoft 2.5s ease-in-out infinite;
        }

        .pulse-strong {
          animation: pulseStrong 1.2s ease-in-out infinite;
        }

        .pulse-insane {
          animation: pulseInsane 0.6s ease-in-out infinite;
          color: #ff5555;
          text-shadow: 0 0 24px rgba(255,80,80,1);
        }

        @keyframes pulseSoft {
          0% { transform: scale(1); }
          50% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }

        @keyframes pulseStrong {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }

        @keyframes pulseInsane {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}