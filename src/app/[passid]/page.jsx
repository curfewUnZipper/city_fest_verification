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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Pass Verification
        </h1>

        <div className="space-y-4 text-gray-700">
          <Info label="Name" value={data.name} />
          <Info label="Date" value={data.date} />
          <Info label="Phone" value={data.phone} />
          <Info label="Email" value={data.email} />
        </div>

        <div className="mt-6 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold">
            ✔ Verified
          </span>
        </div>
      </div>
    </main>
  );
}

/* ---------- Reusable Invalid Card ---------- */
function InvalidCard({ message }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>

        <h1 className="text-2xl font-bold mb-2">
          Pass Not Verified
        </h1>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <span className="inline-block px-4 py-2 rounded-full bg-red-100 text-red-700 font-semibold">
          ✖ Not Valid
        </span>

        <p className="text-xs text-gray-400 mt-6">
          If you believe this is a mistake, please contact the event organizer.
        </p>
      </div>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="font-medium">{label}</span>
      <span className="text-gray-600">{value}</span>
    </div>
  );
}
