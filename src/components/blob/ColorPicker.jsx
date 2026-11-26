import { useRef, useEffect, useState } from "react";

// HSL (hue 0-360, s=1, l=0.5) -> "#rrggbb"
function hueToHex(h) {
  const channel = (n) => {
    const k = (n + h / 30) % 12;
    return 0.5 - 0.5 * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return (
    "#" +
    [channel(0), channel(8), channel(4)]
      .map((v) => Math.round(255 * v).toString(16).padStart(2, "0"))
      .join("")
  );
}

export default function ColorPicker({ color, onChange }) {
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);
  const hueRef = useRef(0);
  const [rainbow, setRainbow] = useState(false);

  // Easter egg: tap the label 10 times (within 1.5s gaps) for rainbow mode
  const handleLabelClick = () => {
    clickCountRef.current += 1;
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1500);

    if (clickCountRef.current >= 10) {
      clickCountRef.current = 0;
      clearTimeout(clickTimerRef.current);
      setRainbow(true);
    }
  };

  useEffect(() => {
    if (!rainbow) return;
    let frame;
    const tick = () => {
      hueRef.current = (hueRef.current + 1.2) % 360;
      onChange(hueToHex(hueRef.current));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rainbow, onChange]);

  useEffect(() => () => clearTimeout(clickTimerRef.current), []);

  // Picking a colour by hand stops rainbow mode
  const handleManualChange = (e) => {
    setRainbow(false);
    onChange(e.target.value);
  };

  return (
    <div
      data-ui="true"
      className={`glass color-picker${rainbow ? " rainbow" : ""}`}
      style={rainbow ? { boxShadow: `0 8px 32px rgba(0,0,0,0.37), 0 0 18px ${color}88` } : undefined}
    >
      <input
        type="color"
        value={color}
        onChange={handleManualChange}
        aria-label="Blob tint colour"
      />
      <span
        onClick={handleLabelClick}
        style={rainbow ? { color, textShadow: `0 0 8px ${color}` } : undefined}
      >
        Blob Tint
      </span>
    </div>
  );
}
