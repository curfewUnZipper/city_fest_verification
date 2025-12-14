export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");

  if (!paymentId) {
    return Response.json({ error: "Missing paymentId" }, { status: 400 });
  }

  const res = await fetch(
    `https://cityfest.vercel.app/api/save-booking?paymentId=${paymentId}`,
    { cache: "no-store" }
  );

  const data = await res.text();

  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(req) {
  const body = await req.json();

  const res = await fetch(
    "https://cityfest.vercel.app/api/save-booking",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.text();

  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
