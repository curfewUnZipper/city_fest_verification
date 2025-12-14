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

      const pidMatch = text.match(/paymentId=([a-zA-Z0-9_]+)/);
      if (pidMatch) pid = pidMatch[1];

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
        alert(json.error);
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
      console.error(err);
      alert("Scan failed");
    }
  }

  // ✅ Check In
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

      setData((prev) => ({ ...prev, isVerified: true }));
      setShowModal(true);
    } catch (err) {
      alert("Failed to check in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-6">
      <div className="w-full max-w-xl text-center space-y-6">

        {/* Header */}
        <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm tracking-wide text-zinc-300">
          Entry Verification
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          City Fest
        </h1>

        <p className="text-zinc-400">
          Scan the QR code below to verify and check in a guest.
        </p>

        {/* Scanner */}
        {!data && (
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-4">
            <QRScanner onScan={handleScan} />
          </div>
        )}

        {/* Verification Card */}
        {data && (
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-6 text-left space-y-4">

            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{data.name}</h2>
                <p className="text-sm text-zinc-400">
                  Event Date: {data.date}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  data.isVerified
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-yellow-500/15 text-yellow-400"
                }`}
              >
                {data.isVerified ? "Checked In" : "Not Checked In"}
              </span>
            </div>

            <div className="text-sm text-zinc-300 space-y-1">
              <p>📞 {data.phone}</p>
              <p>✉️ {data.email}</p>
            </div>

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
          <div className="bg-white text-black rounded-2xl p-6 max-w-sm w-full text-center animate-fade-in shadow-2xl">
            <div className="text-5xl mb-3">✔</div>
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
