"use client";
import { useState } from "react";
import QRScanner from "@/components/QRScanner";

export default function VerifyPage() {
  const [data, setData] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔍 Scan QR → extract CODE → verify via proxy
  async function handleScan(text) {
    try {
      const code = text.split("/").pop()?.trim();

      if (!code || code.length !== 6) {
        setScanError({
          type: "INVALID",
          message: "Invalid QR Format",
        });
        return;
      }

      const res = await fetch(`/api/verify?code=${code}`, {
        cache: "no-store",
      });

      const raw = await res.text();
      const json = JSON.parse(raw);

      // ❌ Fake / invalid QR
      if (!json.success && json.errorType === "INVALID_CODE") {
        setScanError({
          type: "INVALID",
          message: "Invalid or Fake QR Code",
        });
        return;
      }

      // ⚠️ Already checked in
      if (!json.success && json.errorType === "ALREADY_CHECKED_IN") {
        setScanError(null);
        setData({
          code,
          passType: json.passType,
          isVerified: true,
          checkedInAt: json.checkedInAt,
        });
        return;
      }

      // ✅ Valid & not yet checked in
      if (json.success) {
        setScanError(null);
        setData({
          code,
          passType: json.passType,
          isVerified: false,
        });
      } else {
        setScanError({
          type: "ERROR",
          message: json.message || "Verification failed",
        });
      }
    } catch (err) {
      console.error("SCAN ERROR:", err);
      setScanError({
        type: "ERROR",
        message: "Scan failed. Please try again.",
      });
    }
  }

  // ✅ Check In
  async function handleCheckIn() {
    if (!data?.code) return;

    try {
      setLoading(true);

      const res = await fetch("/api/verify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: data.code }),
      });

      const raw = await res.text();
      const json = JSON.parse(raw);

      // ❌ Already checked in
      if (!json.success && json.errorType === "ALREADY_CHECKED_IN") {
        setData((prev) => ({
          ...prev,
          isVerified: true,
          checkedInAt: json.checkedInAt,
        }));
        return;
      }

      // ❌ Any other failure
      if (!json.success) {
        setScanError({
          type: "ERROR",
          message: json.message || "Check-in failed",
        });
        return;
      }

      // ✅ Success
      setData((prev) => ({ ...prev, isVerified: true }));
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

        {/* ❌ Fake / Error Card */}
        {scanError && !data && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-3 shadow-2xl">
            <div className="text-4xl">🚫</div>

            <h2 className="text-xl font-bold text-red-400">
              {scanError.message}
            </h2>

            <p className="text-sm text-red-300">
              This QR code is not valid for City Fest entry.
            </p>

            <button
              onClick={() => setScanError(null)}
              className="mt-3 rounded-xl bg-red-500 text-white px-5 py-2 text-sm font-medium hover:bg-red-600 transition"
            >
              Scan Again
            </button>
          </div>
        )}

        {/* Scanner */}
        {!data && !scanError && (
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-4">
            <QRScanner onScan={handleScan} />
          </div>
        )}

        {/* Verification Card */}
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

              {/* STATUS BADGE */}
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

            {/* Checked-in timestamp */}
            {data.checkedInAt && (
              <p className="text-xs text-zinc-400 text-right">
                Checked in at{" "}
                {new Date(data.checkedInAt).toLocaleString()}
              </p>
            )}

            <button
              onClick={handleCheckIn}
              disabled={data.isVerified || loading}
              className={`w-full rounded-xl px-6 py-3 font-medium transition ${
                data.isVerified
                  ? "bg-white/10 text-zinc-500 cursor-not-allowed"
                  : loading
                  ? "bg-emerald-400 text-black"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {loading
                ? "Checking In..."
                : data.isVerified
                ? "Already Checked In"
                : "Check In"}
            </button>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white text-black rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-3">✔</div>
            <h2 className="text-2xl font-bold mb-2">
              Check-in Successful
            </h2>
            <p className="text-gray-600 mb-4">
              Pass {data.code} has been checked in.
            </p>

            <button
              onClick={() => {
                setShowModal(false);
                setData(null);
              }}
              className="w-full rounded-xl bg-black text-white py-2 font-medium hover:bg-zinc-800 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
