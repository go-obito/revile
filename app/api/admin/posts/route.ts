import { hasSession } from "@/lib/auth";
import { allPosts } from "@/lib/posts";
export async function GET() { if (!(await hasSession())) return Response.json({ error: "Unauthorized" }, { status: 401 }); return Response.json(await allPosts()); }
