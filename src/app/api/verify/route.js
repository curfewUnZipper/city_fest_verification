const BASE_URL = "https://cityfest.vercel.app/api/pass/verify";

// GET → verify pass status
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return Response.json(
        { success: false, message: "Missing code" },
        { status: 400 }
      );
    }

    const upstream = await fetch(
      `${BASE_URL}?code=${encodeURIComponent(code)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data = await upstream.json();

    return Response.json(data, {
      status: upstream.status,
    });
  } catch (err) {
    console.error("VERIFY GET proxy error:", err);
    return Response.json(
      { success: false, message: "Verification service unavailable" },
      { status: 502 }
    );
  }
}

// PUT → check-in pass (maps to POST upstream)
export async function PUT(req) {
  try {
    const body = await req.json();

    if (!body?.code) {
      return Response.json(
        { success: false, message: "Missing code" },
        { status: 400 }
      );
    }

    const upstream = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: body.code }),
    });

    const data = await upstream.json();

    return Response.json(data, {
      status: upstream.status,
    });
  } catch (err) {
    console.error("VERIFY PUT proxy error:", err);
    return Response.json(
      { success: false, message: "Check-in service unavailable" },
      { status: 502 }
    );
  }
}
