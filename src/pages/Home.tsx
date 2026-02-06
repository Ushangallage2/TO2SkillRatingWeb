import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MayhemCountdown from "../components/mayhemcountdown";


export default function Home() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    async function loadVideo() {
      try {
        const res = await fetch("/.netlify/functions/commentary-game-video");
        const json = await res.json();

        const row = Array.isArray(json) ? json[0] : json?.Rows?.[0];
        if (row?.video_id) setVideoId(row.video_id);
      } catch (err) {
        console.error("Failed to load video", err);
      }
    }

    loadVideo();
  }, []);

  const VIDEO_WIDTH = 630;
  const VIDEO_HEIGHT = (VIDEO_WIDTH * 9) / 16;

  return (
    <div style={{ position: "relative" }}>
      
      {/* 🔥 FLOATING COUNTDOWN – TOP CENTER */}
      <div
        style={{
          position: "absolute",
          top: '-25%',
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          pointerEvents: "none", // clicks pass through
        }}
      >
        <MayhemCountdown timezone="UTC" />
      </div>
  
      {/* MAIN PAGE CONTENT */}
      <div
        style={{
          marginTop: 90,
          display: "flex",
          alignItems: "flex-start",
          gap: 120,
          padding: "0 80px",
        }}
      >
        
        {/* LEFT SIDE */}
        <div style={{ maxWidth: 520 }}>
          <h1>🏆 UTWAT OFFICIAL FOR MAYHEM</h1>
  
          <div style={{ marginTop: 50 }}>
            <div style={{ display: "flex", gap: 40 }}>
              <Link to="/skill">
                <button className="leaderboard-btn">
                  Skill Rating Leaderboard
                </button>
              </Link>
  
              <Link to="/stats">
                <button className="leaderboard-btn">
                  Statistical Leaderboard
                </button>
              </Link>
            </div>
  
            <div style={{ marginTop: 32 }}>
              <button
                className="match-rating-btn"
                onClick={() =>
                  window.open("/match-simulator", "_blank", "noopener,noreferrer")
                }
              >
                ⭐ Check Your Match Ratings
              </button>
            </div>
          </div>
        </div>
  
        {/* RIGHT SIDE – VIDEO */}
        <div
          style={{
            width: VIDEO_WIDTH,
            minHeight: VIDEO_HEIGHT,
            background: "#111",
            borderRadius: 18,
            padding: 16,
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.7)",
            color: "#fff",
          }}
        >
          {!videoId && (
            <div
              style={{
                height: VIDEO_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.5,
              }}
            >
              Loading video…
            </div>
          )}
  
          {videoId && !play && (
            <div
              className="yt-hover"
              onClick={() => setPlay(true)}
              style={{
                position: "relative",
                cursor: "pointer",
                borderRadius: 14,
                overflow: "hidden",
                height: VIDEO_HEIGHT,
              }}
            >
              <img
                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                alt="Latest Match"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 72,
                  textShadow: "0 6px 24px rgba(0,0,0,0.9)",
                }}
              >
                ▶
              </div>
            </div>
          )}
  
          {videoId && play && (
            <iframe
              width="100%"
              height={VIDEO_HEIGHT}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ borderRadius: 14 }}
            />
          )}
  
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              opacity: 0.85,
              textAlign: "center",
            }}
          >
            🎬 MAYHEM Official Video
          </div>
        </div>
  
        {/* STYLES */}
        <style>{`
          .leaderboard-btn {
            padding: 14px 26px;
            font-size: 16px;
            background: rgba(255,255,255,0.1);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.35);
            border-radius: 10px;
            backdrop-filter: blur(6px);
            cursor: pointer;
            transition: all 0.25s ease;
          }
  
          .leaderboard-btn:hover {
            background: rgba(255,255,255,0.22);
            box-shadow: 0 0 16px rgba(255,255,255,0.6);
            transform: scale(1.06);
          }
  
          .match-rating-btn {
            padding: 16px 40px;
            font-size: 17px;
            font-weight: 600;
            color: #fff;
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 14px;
            backdrop-filter: blur(10px);
            cursor: pointer;
            transition: transform 0.25s ease;
          }
  
          .match-rating-btn:hover {
            transform: scale(1.1);
            animation: glowShift 2.5s linear infinite;
          }
  
          @keyframes glowShift {
            0% {
              background: linear-gradient(120deg, rgba(0,160,255,0.4), rgba(255,255,255,0.15));
              box-shadow: 0 0 18px rgba(0,160,255,0.7);
            }
            50% {
              background: linear-gradient(120deg, rgba(255,0,150,0.4), rgba(255,255,255,0.15));
              box-shadow: 0 0 26px rgba(255,0,150,0.7);
            }
            100% {
              background: linear-gradient(120deg, rgba(0,160,255,0.4), rgba(255,255,255,0.15));
              box-shadow: 0 0 18px rgba(0,160,255,0.7);
            }
          }
  
          .yt-hover:hover {
            transform: scale(1.04);
            box-shadow: 0 0 28px rgba(0,150,255,0.6);
          }
        `}</style>
      </div>
    </div>
  );
  
}
