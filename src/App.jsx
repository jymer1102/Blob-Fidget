import { useState } from "react";
import BlobCanvas from "@/components/blob/BlobCanvas";
import ColorPicker from "@/components/blob/ColorPicker";

// iOS 13+ gates motion sensors behind a permission prompt that must be
// triggered from a tap. Newer desktop browsers also expose requestPermission(),
// so only offer the button on touch devices.
const isTouchDevice =
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const needsMotionPermission =
  isTouchDevice &&
  typeof DeviceOrientationEvent !== "undefined" &&
  typeof DeviceOrientationEvent.requestPermission === "function";

export default function App() {
  const [color, setColor] = useState("#00ffaa");
  const [showTiltBtn, setShowTiltBtn] = useState(needsMotionPermission);

  const enableTilt = async () => {
    try {
      // Request both inside the same tap so the gesture isn't lost between awaits
      await Promise.all([
        DeviceOrientationEvent.requestPermission(),
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
          ? DeviceMotionEvent.requestPermission()
          : Promise.resolve("granted"),
      ]);
    } catch {
      // ignore; the prompt can't be shown again until the page is reloaded
    }
    setShowTiltBtn(false);
  };

  return (
    <div className="app">
      <BlobCanvas color={color} />
      <ColorPicker color={color} onChange={setColor} />

      {showTiltBtn && (
        <button data-ui="true" className="glass tilt-btn" onClick={enableTilt}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="7" y="2" width="10" height="20" rx="2" />
            <path d="M11 18h2" />
          </svg>
          Enable Tilt &amp; Shake
        </button>
      )}
    </div>
  );
}
