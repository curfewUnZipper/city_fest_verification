export const dynamic = "force-dynamic";

/* ------------------ SERVER FETCH ------------------ */
async function getPassDetails(code) {
  try {
    const res = await fetch(
      `https://cityfest.vercel.app/api/pass/verify?code=${code}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );

    const text = await res.text();

    if (!text || !text.trim().startsWith("{")) {
      console.error("Non-JSON response:", text);
      return { __error: "NON_JSON" };
    }
    console.log(text);
    return JSON.parse(text);
  } catch (err) {
    console.error("Fetch failed:", err);
    return { __error: "FETCH_FAILED" };
  }
}

export default async function PassPage({ params }) {
  const { passid } = await params; // ✅ FIX HERE

  if (!passid || passid.length !== 15) {
    return <InvalidCard message="Invalid pass link" />;
  }

  const data = await getPassDetails(passid);

  if (data.__error) {
    return (
      <InvalidCard message="Verification service temporarily unavailable" />
    );
  }

  if (!data.success && data.errorType === "INVALID_CODE") {
    return <InvalidCard message="Invalid or fake QR code" />;
  }
  if (data.success) {
    console.log(data);
    return (
      <VerifiedCard
        code={passid}
        passType={data.passType}
        isCheckedIn={data.isCheckedIn}
        checkedInAt={data.checkedInAt}
        message={data.message}
      />
    );
  }

  return <InvalidCard message="Invalid or expired pass" />;
}


/* ------------------ VERIFIED CARD ------------------ */
function VerifiedCard({ code, passType, isCheckedIn, checkedInAt, message }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-6">
      <div className="w-full max-w-md rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-6 space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs tracking-wide text-zinc-300">
            City Fest Pass
          </span>

          <h1 className="text-2xl font-bold tracking-tight">
            {passType} Pass
          </h1>

          <p className="text-xs text-zinc-400">
            Code: {code}
          </p>
        </div>

        {/* Status */}
        <div className="pt-4 text-center space-y-2">
          {isCheckedIn ? (
            <>
              <span className="inline-block rounded-full bg-emerald-500/15 text-emerald-400 px-4 py-2 text-sm font-medium">
                ✔ Checked In
              </span>

              {checkedInAt && (
                <p className="text-xs text-zinc-400">
                  Checked in at{" "}
                  {new Date(checkedInAt).toLocaleString()}
                </p>
              )}
            </>
          ) : (
            <span className="inline-block rounded-full bg-yellow-500/15 text-yellow-400 px-4 py-2 text-sm font-medium">
              ⏳ Not Checked In
            </span>
          )}
        </div>

        {/* Backend message */}
        <p className="text-xs text-zinc-500 text-center pt-2">
          {message}
        </p>

        <p className="text-xs text-zinc-500 text-center pt-4">
          Please present this pass at the entry gate for verification.
        </p>
      </div>
    </main>
  );
}

/* ------------------ INVALID CARD ------------------ */
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
