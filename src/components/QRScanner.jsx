"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

export default function QRScanner({ onScan }) {
  const qrCodeRef = useRef(null);

  const [cameras, setCameras] = useState([]);
  const [activeCamIndex, setActiveCamIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  // Init scanner and camera list
  useEffect(() => {
    qrCodeRef.current = new Html5Qrcode("qr-reader");

    Html5Qrcode.getCameras()
      .then((devices) => setCameras(devices))
      .catch(console.error);

    return () => {
      if (isRunning) {
        qrCodeRef.current?.stop().catch(() => {});
      }
    };
  }, []);

  // ▶️ Start camera
  const startCamera = async () => {
    if (isRunning || cameras.length === 0) return;

    try {
      await qrCodeRef.current.start(
        cameras[activeCamIndex].id,
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
        },
        (decodedText) => {
          stopCamera();
          onScan(decodedText);
        }
      );

      // Check torch support
      const capabilities =
        qrCodeRef.current.getRunningTrackCapabilities?.();

      if (capabilities?.torch) {
        setTorchSupported(true);
      }

      setIsRunning(true);
    } catch (err) {
      console.error("Camera start failed", err);
    }
  };

  // ⏹ Stop camera
  const stopCamera = async () => {
    if (!isRunning) return;

    try {
      await qrCodeRef.current.stop();
    } catch {
      // ignore
    } finally {
      setIsRunning(false);
      setTorchOn(false);
    }
  };

  // 🔁 Switch camera (ONLY when camera is OFF)
  const switchCamera = () => {
    if (isRunning || cameras.length < 2) return;

    setActiveCamIndex((prev) => (prev + 1) % cameras.length);
  };

  // 🔦 Toggle flashlight (if supported)
  const toggleTorch = async () => {
    if (!isRunning || !torchSupported) return;

    try {
      await qrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn((prev) => !prev);
    } catch (err) {
      console.warn("Torch not supported", err);
    }
  };

  // 🖼 Scan from image
 // 🖼 Scan from image (FIXED)
  const handleFileScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await qrCodeRef.current.scanFile(file, false); // 🔥 FIX
      onScan(text);
    } catch (err) {
      console.error("Image scan failed:", err);
      alert("No QR code found in image");
    }
  };

  return (
    <div className="space-y-4">
      {/* Camera View */}
      <div
        id="qr-reader"
        className="rounded-xl overflow-hidden border border-white/10"
      />

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        {/* Camera ON/OFF */}
        <button
          onClick={isRunning ? stopCamera : startCamera}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            isRunning
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
          }`}
        >
          {isRunning ? "Turn Camera Off" : "Turn Camera On"}
        </button>

        {/* Switch Camera */}
        <button
          onClick={switchCamera}
          disabled={isRunning || cameras.length < 2}
          className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-zinc-300 disabled:opacity-40"
        >
          Switch Camera
        </button>

        {/* Upload QR */}
        <label className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-zinc-300 text-center cursor-pointer">
          Upload QR Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileScan}
          />
        </label>

        {/* Flashlight */}
        <button
          onClick={toggleTorch}
          disabled={!torchSupported || !isRunning}
          className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-zinc-300 disabled:opacity-40"
        >
          {torchOn ? "Flashlight Off" : "Flashlight On"}
        </button>
      </div>
    </div>
  );
}
