import { hash } from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { createSession } from "@/lib/auth";
type Owner = { _id: string; email: string; passwordHash: string; createdAt: Date };
export async function POST(request: Request) { const { email, password } = await request.json(); if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== "string" || password.length < 8) return Response.json({ error: "Provide a valid email and an 8-character password." }, { status: 400 }); try { await (await getDb()).collection<Owner>("users").insertOne({ _id: "owner", email: email.toLowerCase().trim(), passwordHash: await hash(password, 12), createdAt: new Date() }); } catch { return Response.json({ error: "An owner account already exists." }, { status: 409 }); } await createSession(); return Response.json({ ok: true }, { status: 201 }); }
