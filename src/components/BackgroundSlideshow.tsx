import { useEffect, useState } from "react";

type BackgroundSlideshowProps = {
  images: string[];
  interval?: number; // time in ms between transitions
};

export default function BackgroundSlideshow({ images, interval = 8000 }: BackgroundSlideshowProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,       // behind all content
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {images.map((img, idx) => (
        <div
          key={idx}
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: idx === current ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
          }}
        />
      ))}

      {/* Optional semi-transparent overlay for better content contrast */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
}
