export async function verifyPass(passid) {
  // simulate network delay (optional but realistic)
  await new Promise((r) => setTimeout(r, 300));

  if (passid !== "abc123") return null;

  return {
    passid: "abc123",
    date: "2025-02-15",
    name: "Mitchell Jackson",
    phone: "+91 9876543210",
    email: "mitchell@example.com",
    isVerified: false, // toggle this to true to test "Already Verified"
  };
}
