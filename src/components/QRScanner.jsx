"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

export default function QRScanner({ onScan, enabled }) {
  const scannerRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [busy, setBusy] = useState(false);

  /* ---------- INIT ---------- */
  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader");

    return () => {
      hardStop();
    };
  }, []);

  /* ---------- ENABLE / DISABLE FROM PARENT ---------- */
  useEffect(() => {
    if (!scannerRef.current) return;

    if (enabled && !isRunning) {
      startCamera();
    }

    if (!enabled && isRunning) {
      stopCamera();
    }
  }, [enabled]);

  /* ---------- START CAMERA ---------- */
  const startCamera = async () => {
    if (!scannerRef.current || isRunning || busy) return;

    setBusy(true);
    try {
      await scannerRef.current.start(
        { facingMode: cameraFacing },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        handleScan
      );

      const caps =
        scannerRef.current.getRunningTrackCapabilities?.();
      setTorchSupported(!!caps?.torch);
      setIsRunning(true);
    } catch (err) {
      console.error("Camera start failed:", err);
    } finally {
      setBusy(false);
    }
  };

  /* ---------- STOP CAMERA ---------- */
  const stopCamera = async () => {
    if (!scannerRef.current || !isRunning || busy) return;

    setBusy(true);
    try {
      await scannerRef.current.stop();
      await scannerRef.current.clear(); // clear decoder memory
    } catch {}
    finally {
      setIsRunning(false);
      setTorchOn(false);
      setTorchSupported(false);
      setBusy(false);
    }
  };

  /* ---------- HARD STOP (UNMOUNT ONLY) ---------- */
  const hardStop = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
      await scannerRef.current?.clear();
    } catch {}
    finally {
      scannerRef.current = null;
    }
  };

  /* ---------- HANDLE SCAN ---------- */
  const handleScan = async (decodedText) => {
    if (busy) return;

    setBusy(true);
    try {
      // stop + clear so memory is wiped
      await scannerRef.current.stop();
      await scannerRef.current.clear();

      setIsRunning(false); // reflect reality
      onScan(decodedText); // parent decides what happens next
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setBusy(false);
    }
  };

  /* ---------- SWITCH CAMERA ---------- */
  const switchCamera = async () => {
    if (!scannerRef.current || busy) return;

    const nextFacing =
      cameraFacing === "environment" ? "user" : "environment";

    setBusy(true);
    try {
      if (isRunning) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }

      setCameraFacing(nextFacing);

      if (enabled) {
        await scannerRef.current.start(
          { facingMode: nextFacing },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          handleScan
        );
        setIsRunning(true);
      }
    } catch (err) {
      console.error("Camera switch failed:", err);
    } finally {
      setBusy(false);
    }
  };

  /* ---------- TORCH ---------- */
  const toggleTorch = async () => {
    if (!scannerRef.current || !torchSupported || !isRunning) return;

    try {
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn((v) => !v);
    } catch {
      console.warn("Torch not supported");
    }
  };

  /* ---------- IMAGE UPLOAD ---------- */
  const handleFileScan = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

    // 🔥 Use a TEMP scanner instance
    const fileScanner = new Html5Qrcode("qr-file-temp");

    try {
      const text = await fileScanner.scanFile(file, false);
      onScan(text);
    } catch {
      alert("No QR code found in image");
    } finally {
      await fileScanner.clear();
    }
  };


  return (
    <div className="space-y-4">
      {/* Camera (NEVER UNMOUNTED) */}
      <div
        id="qr-reader"
        className="rounded-xl overflow-hidden border border-white/10"
      />

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        {/* Camera ON / OFF */}
        <button
          onClick={isRunning ? stopCamera : startCamera}
          disabled={!enabled}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            isRunning
              ? "bg-red-500/20 text-red-400"
              : "bg-emerald-500/20 text-emerald-400"
          } disabled:opacity-40`}
        >
          {isRunning ? "Turn Camera Off" : "Turn Camera On"}
        </button>

        {/* Switch Camera */}
        <button
          onClick={switchCamera}
          disabled={!enabled}
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

        {/* Torch */}
        <button
          onClick={toggleTorch}
          disabled={!torchSupported || !isRunning}
          className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-zinc-300 disabled:opacity-40"
        >
          {torchOn ? "Flashlight Off" : "Flashlight On"}
        </button>
        <div id="qr-file-temp" className="hidden" />

      </div>
    </div>
  );
}
