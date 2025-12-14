"use client";
import { useState } from "react";
import QRScanner from "@/components/QRScanner";

export default function VerifyPage() {
  const [data, setData] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔍 Scan QR → extract pay_XXXX → GET booking
  async function handleScan(text) {
    try {
      let pid = null;

      // Case 1: paymentId=pay_xxx
      const pidMatch = text.match(/paymentId=([a-zA-Z0-9_]+)/);
      if (pidMatch) pid = pidMatch[1];

      // Case 2: raw pay_xxx anywhere
      if (!pid) {
        const payMatch = text.match(/pay_[a-zA-Z0-9_]+/);
        if (payMatch) pid = payMatch[0];
      }

      if (!pid) {
        alert("Invalid QR");
        return;
      }

      const res = await fetch(`/api/booking?paymentId=${pid}`, {
        cache: "no-store",
      });

      const json = await res.json();

      if (json.error) {
        alert(json.error); // Booking not found
        return;
      }

      if (!json.persons || json.persons.length === 0) {
        alert("Invalid Pass");
        return;
      }

      const person = json.persons[0];

      setPaymentId(pid);
      setData({
        name: person.name,
        phone: person.phone,
        email: person.email,
        date: new Date(json.orderDate).toLocaleDateString(),
        isVerified: Boolean(json.isVerified),
      });
    } catch (err) {
      console.error("QR error:", err);
      alert("Scan failed");
    }
  }

  // ✅ Check In → PUT request
  async function handleCheckIn() {
    if (!paymentId) return;

    try {
      setLoading(true);

      const res = await fetch("/api/booking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          isVerified: true,
        }),
      });

      if (!res.ok) throw new Error("Check-in failed");

      // optimistic UI update
      setData((prev) => ({
        ...prev,
        isVerified: true,
      }));

      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to check in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white p-4 flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-6 tracking-wide">
        Entry Verification
      </h1>

      {/* 📷 Scanner */}
      {!data && (
        <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-xl">
          <p className="text-center text-gray-300 mb-3">
            Scan Pass QR Code
          </p>
          <QRScanner onScan={handleScan} />
        </div>
      )}

      {/* 🎟️ Verification Card */}
      {data && (
        <div className="w-full max-w-lg mt-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">

          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">{data.name}</h2>
              <p className="text-sm text-gray-300">
                Event Date: {data.date}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                data.isVerified
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {data.isVerified ? "Checked In" : "Not Checked In"}
            </span>
          </div>

          <div className="space-y-2 text-gray-200 text-sm">
            <p>📞 {data.phone}</p>
            <p>✉️ {data.email}</p>
          </div>

          <button
            onClick={handleCheckIn}
            disabled={data.isVerified || loading}
            className={`mt-6 w-full py-3 rounded-xl font-semibold text-lg
              ${
                data.isVerified
                  ? "bg-gray-600/40 text-gray-400 cursor-not-allowed"
                  : loading
                  ? "bg-emerald-400 cursor-wait"
                  : "bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/30"
              }
            `}
          >
            {loading
              ? "Checking In..."
              : data.isVerified
              ? "Already Checked In"
              : "Check In"}
          </button>
        </div>
      )}

      {/* ✅ SUCCESS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white text-black rounded-2xl p-6 max-w-sm w-full text-center animate-fade-in shadow-2xl">
            <div className="text-5xl text-emerald-500 mb-3">✔</div>
            <h2 className="text-2xl font-bold mb-2">
              Check-in Successful
            </h2>
            <p className="text-gray-600 mb-4">
              {data.name} has been checked in.
            </p>

            <button
              onClick={() => {
                setShowModal(false);
                setData(null);
                setPaymentId(null);
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
