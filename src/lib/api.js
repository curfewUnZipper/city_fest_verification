// export async function getPassDetails(passid) {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/pass/${passid}`,
//     { cache: "no-store" }
//   );

//   if (!res.ok) return null;

//   return res.json();
// }


export async function getPassDetails(passid) {
  // MOCK DATA (no backend)
  if (passid == "123") {
    return {
      date: "2025-02-15",
      name: "Mitchell Jackson",
      phone: "+91 9876543210",
      email: "mitchell@example.com"
    };
  }

  // Any other pass → invalid
  return null;
}
