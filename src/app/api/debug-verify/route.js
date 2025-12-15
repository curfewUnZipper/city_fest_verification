import fs from "fs";
import path from "path";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

 const filePath = path.join(
  process.cwd(),
  "src",
  "lib",
  "passes",
  "event_pass_codes.txt"
);

  const content = fs.readFileSync(filePath, "utf-8");

  const exists = content
    .split("\n")
    .map(l => l.trim())
    .includes(code);

  return Response.json({
    code,
    exists,
  });
}
