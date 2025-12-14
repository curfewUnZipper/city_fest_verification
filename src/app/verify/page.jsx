"use client";
import { useState } from "react";
import QRScanner from "@/components/QRScanner";
import { verifyPass } from "@/lib/mockVerify";

export default function VerifyPage() {
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  async function handleScan(text) {
    try {
      const url = new URL(text);
      const passid = url.pathname.replace("/", "");
      const res = await verifyPass(passid);

      if (!res) {
        alert("Invalid or Expired Pass");
        return;
      }

      setData(res);
    } catch {
      alert("Invalid QR");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white p-4 flex flex-col items-center">

      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 tracking-wide">
        Entry Verification
      </h1>

      {/* Scanner */}
      {!data && (
        <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-xl">
          <p className="text-center text-gray-300 mb-3">
            Scan Pass QR Code
          </p>
          <QRScanner onScan={handleScan} />
        </div>
      )}

      {/* Verification Card */}
      {data && (
        <div className="w-full max-w-lg mt-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 text-white">

          {/* Status */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">
                {data.name}
              </h2>
              <p className="text-sm text-gray-300">
                Event Date: {data.date}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold
                ${
                  data.isVerified
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }
              `}
            >
              {data.isVerified ? "Already Verified" : "Not Verified"}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2 text-gray-200 text-sm">
            <p>📞 {data.phone}</p>
            <p>✉️ {data.email}</p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShowModal(true)}
            disabled={data.isVerified}
            className={`mt-6 w-full py-3 rounded-xl font-semibold text-lg
              transition-all duration-200
              ${
                data.isVerified
                  ? "bg-gray-600/40 text-gray-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/30"
              }
            `}
          >
            {data.isVerified ? "Already Verified" : "Verify Entry"}
          </button>
        </div>
      )}

      {/* ✅ VERIFICATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white text-black rounded-2xl p-6 max-w-sm w-full text-center animate-fade-in shadow-2xl">

            <div className="text-5xl text-emerald-500 mb-3">✔</div>

            <h2 className="text-2xl font-bold mb-2">
              Entry Verified
            </h2>

            <p className="text-gray-600 mb-4">
              {data.name} has been verified for entry.
            </p>

            <button
              onClick={() => {
                setShowModal(false);
                setData(null); // reset scanner
              }}
              className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold"
            >
              Done
            </button>

          </div>
        </div>
      )}

    </main>
  );
}
