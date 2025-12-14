export async function getPassDetails(passid) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}?paymentId=${passid}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const json = await res.json();

    // Booking not found or malformed response
    if (
      !json ||
      !Array.isArray(json.persons) ||
      json.persons.length === 0
    ) {
      return null;
    }

    const person = json.persons[0];

    return {
      name: person.name || "—",
      phone: person.phone || "—",
      email: person.email || "—",
      date: new Date(json.orderDate).toLocaleDateString(),
      isVerified: Boolean(json.isVerified),
    };
  } catch (err) {
    console.error("getPassDetails error:", err);
    return null;
  }
}
