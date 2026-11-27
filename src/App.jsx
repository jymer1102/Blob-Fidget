import { useState } from "react";
import BlobCanvas from "@/components/blob/BlobCanvas";
import ColorPicker from "@/components/blob/ColorPicker";
import useMotionSensors from "@/hooks/useMotionSensors";

export default function App() {
  const [color, setColor] = useState("#00ffaa");
  const { showToggle, tiltOn, toggle } = useMotionSensors();

  return (
    <div className="app">
      <BlobCanvas color={color} tiltEnabled={tiltOn} />
      <ColorPicker color={color} onChange={setColor} />

      {/* Only rendered on devices that actually have motion sensors */}
      {showToggle && (
        <button
          type="button"
          data-ui="true"
          className={`tilt-btn${tiltOn ? " is-on" : ""}`}
          onClick={toggle}
        >
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
          {tiltOn ? "Disable" : "Enable"} Tilt &amp; Shake
        </button>
      )}
    </div>
  );
}
