export const dynamic = "force-dynamic";
import { getPassDetails } from "@/lib/api";

export default async function PassPage({ params }) {
  const { passid } = await params;

  if (!passid) {
    return <InvalidCard message="Invalid pass link" />;
  }

  const data = await getPassDetails(passid);

  if (!data) {
    return <InvalidCard message="Invalid or Expired Pass" />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-6">
      <div className="w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-6 space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs tracking-wide text-zinc-300">
            City Fest Pass
          </span>

          <h1 className="text-2xl font-bold tracking-tight">
            Pass Verification
          </h1>
        </div>

        {/* Info */}
        <div className="space-y-4 text-sm">
          <Info label="Name" value={data.name} />
          <Info label="Date" value={data.date} />
          <Info label="Phone" value={data.phone} />
          <Info label="Email" value={data.email} />
        </div>

        {/* Status */}
        <div className="pt-4 text-center">
          {data.isVerified ? (
            <span className="inline-block rounded-full bg-emerald-500/15 text-emerald-400 px-4 py-2 text-sm font-medium">
              ✔ Checked In
            </span>
          ) : (
            <span className="inline-block rounded-full bg-yellow-500/15 text-yellow-400 px-4 py-2 text-sm font-medium">
              ⏳ Not Checked In
            </span>
          )}
        </div>
      </div>
    </main>
  );
}

/* ---------- Invalid Card (Dark Theme) ---------- */
function InvalidCard({ message }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-6">
      <div className="w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-6 text-center space-y-4">

        <div className="text-5xl">⚠️</div>

        <h1 className="text-2xl font-bold">
          Pass Not Verified
        </h1>

        <p className="text-zinc-400">
          {message}
        </p>

        <span className="inline-block rounded-full bg-red-500/15 text-red-400 px-4 py-2 text-sm font-medium">
          ✖ Not Valid
        </span>

        <p className="text-xs text-zinc-500 pt-4">
          If you believe this is a mistake, please contact the event organizer.
        </p>
      </div>
    </main>
  );
}

/* ---------- Info Row ---------- */
function Info({ label, value }) {
  return (
    <div className="flex justify-between border-b border-white/10 pb-2 text-zinc-300">
      <span className="text-zinc-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
