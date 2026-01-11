import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function GameVideoPanel() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadVideo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/commentary-game-video");
      const json = await res.json();

      // adjust if your API shape differs
      setVideoId(json.video_id);
    } catch (e) {
      console.error("Failed to load video", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideo();
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #2b2b2b 0%, #1f1f1f 100%)",
        borderRadius: 2,
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        p: 1,
      }}
    >
      <Typography
        sx={{
          color: "#fff",
          fontWeight: 600,
          fontSize: 16,
          mb: 1,
          textAlign: "center",
        }}
      >
        🎥 Latest Match Commentary
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : videoId ? (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%", // 16:9
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title="Game Commentary"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </Box>
      ) : (
        <Typography color="gray" textAlign="center">
          No video available
        </Typography>
      )}
    </Box>
  );
}
