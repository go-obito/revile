import { compare } from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { createSession } from "@/lib/auth";
type Owner = { _id: string; email: string; passwordHash: string; createdAt: Date };
export async function POST(request: Request) { const { email, password } = await request.json(); const owner = await (await getDb()).collection<Owner>("users").findOne({ _id: "owner" }); if (!owner || typeof email !== "string" || typeof password !== "string" || owner.email !== email.toLowerCase().trim() || !(await compare(password, owner.passwordHash))) return Response.json({ error: "Invalid email or password." }, { status: 401 }); await createSession(); return Response.json({ ok: true }); }
