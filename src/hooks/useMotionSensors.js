import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "blob-fidget:tilt";
const PROBE_MS = 1500;

// Browsers expose DeviceOrientationEvent even on machines with no sensors; those
// just fire one event full of nulls. So the only reliable test is to wait for a
// real reading.
function probeSensors(timeout = PROBE_MS) {
  return new Promise((resolve) => {
    let timer;
    const finish = (found) => {
      clearTimeout(timer);
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("devicemotion", onMotion);
      resolve(found);
    };
    const onOrientation = (e) => {
      if (e.alpha != null || e.beta != null || e.gamma != null) finish(true);
    };
    const onMotion = (e) => {
      const a = e.accelerationIncludingGravity;
      const r = e.rotationRate;
      if (
        (a && (a.x != null || a.y != null || a.z != null)) ||
        (r && (r.alpha != null || r.beta != null || r.gamma != null))
      ) {
        finish(true);
      }
    };
    window.addEventListener("deviceorientation", onOrientation);
    window.addEventListener("devicemotion", onMotion);
    timer = setTimeout(() => finish(false), timeout);
  });
}

// iOS 13+ keeps motion data behind a prompt that must start from a tap. Newer
// desktop browsers also expose requestPermission(), so only treat touch devices
// as candidates.
function canAskPermission() {
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  return (
    touch &&
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  );
}

function requestPermissions() {
  return Promise.all([
    DeviceOrientationEvent.requestPermission(),
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
      ? DeviceMotionEvent.requestPermission()
      : Promise.resolve("granted"),
  ]).then((results) => results.every((r) => r === "granted"));
}

function readStoredPref() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

function storePref(on) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* storage unavailable (private mode etc.) */
  }
}

/**
 * status:
 *   "checking"         - waiting to see whether the device has motion sensors
 *   "available"        - sensors are delivering readings
 *   "needs-permission" - touch device where the user must grant access first (iOS)
 *   "unavailable"      - no sensors (or permission refused): hide the control
 */
export default function useMotionSensors() {
  const [status, setStatus] = useState("checking");
  const [enabled, setEnabled] = useState(readStoredPref);

  useEffect(() => {
    let cancelled = false;
    probeSensors().then((found) => {
      if (cancelled) return;
      if (found) setStatus("available");
      else setStatus(canAskPermission() ? "needs-permission" : "unavailable");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(async () => {
    if (status === "needs-permission") {
      let granted = false;
      try {
        // Called synchronously inside the tap so the user gesture isn't lost
        granted = await requestPermissions();
      } catch {
        granted = false;
      }
      if (granted && (await probeSensors())) {
        setStatus("available");
        setEnabled(true);
        storePref(true);
      } else {
        // Refused (can't be asked again until reload) or no real sensor behind it
        setStatus("unavailable");
      }
      return;
    }
    if (status === "available") {
      const next = !enabled;
      setEnabled(next);
      storePref(next);
    }
  }, [status, enabled]);

  return {
    status,
    showToggle: status === "available" || status === "needs-permission",
    tiltOn: status === "available" && enabled,
    toggle,
  };
}
