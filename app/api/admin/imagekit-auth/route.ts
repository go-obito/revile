import { createHmac, randomUUID } from "node:crypto";
import { hasSession } from "@/lib/auth";

export async function GET() {
  if (!(await hasSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!publicKey || !privateKey) return Response.json({ error: "Image uploads are not configured. Add the ImageKit environment variables." }, { status: 503 });
  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 10 * 60;
  const signature = createHmac("sha1", privateKey).update(`${token}${expire}`).digest("hex");
  return Response.json({ token, expire, signature, publicKey }, { headers: { "Cache-Control": "no-store" } });
}
