"use client";

import { useState } from "react";
import QRScanner from "@/components/QRScanner";

export default function VerifyPage() {
  const [data, setData] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------- RESET FOR NEXT SCAN ---------- */
  function resetScan() {
    setData(null);
    setScanError(null);
    setShowModal(false);
    setLoading(false);
  }

  /* ---------- SCAN & VERIFY ---------- */
  async function handleScan(text) {
    try {
      const code = text.split("/").pop()?.trim();

      if (!code || code.length !== 15) {
        setScanError({
          type: "INVALID",
          message: "Invalid QR Format",
        });
        return;
      }

      const res = await fetch(`/api/verify?code=${code}`, {
        cache: "no-store",
      });

      const json = await res.json();

      // ❌ Fake QR
      if (!json.success && json.errorType === "INVALID_CODE") {
        setScanError({
          type: "INVALID",
          message: "Invalid or Fake QR Code",
        });
        return;
      }

      // ⚠️ Already checked in
      if (json.isCheckedIn === true) {
        setData({
          code,
          passType: json.passType,
          isVerified: true,
          checkedInAt: json.checkedInAt,
        });
        return;
      }

      // ✅ Valid & NOT checked in
      if (json.success && json.isCheckedIn === false) {
        setData({
          code,
          passType: json.passType,
          isVerified: false,
        });
        return;
      }

      setScanError({
        type: "ERROR",
        message: "Verification failed",
      });
    } catch (err) {
      console.error("SCAN ERROR:", err);
      setScanError({
        type: "ERROR",
        message: "Scan failed. Please try again.",
      });
    }
  }

  /* ---------- CHECK IN ---------- */
  async function handleCheckIn() {
    if (!data?.code || data.isVerified) return;

    try {
      setLoading(true);

      const res = await fetch("/api/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: data.code }),
      });

      const json = await res.json();

      if (!json.success) {
        setScanError({
          type: "ERROR",
          message: json.message || "Check-in failed",
        });
        return;
      }

      setData((prev) => ({
        ...prev,
        isVerified: true,
        checkedInAt: json.checkedInAt || new Date().toISOString(),
      }));

      setShowModal(true);
    } catch (err) {
      console.error("CHECK-IN ERROR:", err);
      setScanError({
        type: "ERROR",
        message: "Check-in failed. Please retry.",
      });
    } finally {
      setLoading(false);
    }
  }

  const scannerEnabled = !data && !scanError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-6">
      <div className="w-full max-w-xl text-center space-y-6">

        <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm tracking-wide text-zinc-300">
          Entry Verification
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          City Fest
        </h1>

        <p className="text-zinc-400">
          Scan the QR code below to verify and check in a guest.
        </p>

        {/* 📷 SCANNER (ALWAYS MOUNTED) */}
        <div
          className={`rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-4 transition ${
            scannerEnabled ? "block" : "hidden"
          }`}
        >
          <QRScanner
            onScan={handleScan}
            enabled={scannerEnabled}
          />
        </div>

        {/* ❌ ERROR CARD */}
        {scanError && !data && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-3 shadow-2xl">
            <div className="text-4xl">🚫</div>
            <h2 className="text-xl font-bold text-red-400">
              {scanError.message}
            </h2>

            <button
              onClick={resetScan}
              className="rounded-xl bg-red-500 text-white px-6 py-2 font-medium hover:bg-red-600 transition"
            >
              Scan Again
            </button>
          </div>
        )}

        {/* ✅ VERIFIED CARD */}
        {data && (
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-6 text-left space-y-4">

            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">
                  {data.passType} Pass
                </h2>
                <p className="text-sm text-zinc-400">
                  Code: {data.code}
                </p>
              </div>

              <span
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  data.isVerified
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {data.isVerified ? "Checked In" : "Not Checked In"}
              </span>
            </div>

            {data.checkedInAt && (
              <p className="text-xs text-zinc-400 text-right">
                Checked in at {new Date(data.checkedInAt).toLocaleString()}
              </p>
            )}

            {!data.isVerified ? (
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full rounded-xl bg-white text-black px-6 py-3 font-medium hover:bg-zinc-200 transition"
              >
                {loading ? "Checking In..." : "Check In"}
              </button>
            ) : (
              <button
                onClick={resetScan}
                className="w-full rounded-xl bg-emerald-500 text-black px-6 py-3 font-medium hover:bg-emerald-400 transition"
              >
                Scan Next Pass
              </button>
            )}
          </div>
        )}
      </div>

      {/* 🎉 SUCCESS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white text-black rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-3">✔</div>
            <h2 className="text-2xl font-bold mb-2">
              Check-in Successful
            </h2>

            <button
              onClick={resetScan}
              className="w-full rounded-xl bg-black text-white py-2 font-medium hover:bg-zinc-800 transition"
            >
              Scan Next Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
