import { hasSession } from "@/lib/auth";
import { createPost, publicPosts, type PostInput } from "@/lib/posts";
const valid = (value: unknown): value is PostInput => Boolean(value && typeof value === "object" && ["draft", "published"].includes((value as PostInput).status) && typeof (value as PostInput).title === "string" && typeof (value as PostInput).content === "string");
export async function GET() { return Response.json(await publicPosts()); }
export async function POST(request: Request) { if (!(await hasSession())) return Response.json({ error: "Unauthorized" }, { status: 401 }); const body = await request.json(); if (!valid(body)) return Response.json({ error: "Invalid post data" }, { status: 400 }); return Response.json(await createPost(body), { status: 201 }); }
