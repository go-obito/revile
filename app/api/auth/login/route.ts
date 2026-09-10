import { compare } from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import { createSession } from "@/lib/auth";

type Owner = {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!emailPattern.test(email) || password.length < 8 || password.length > 72) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const db = await getDb();
  const owner = await db.collection<Owner>("users").findOne({ _id: "owner" });

  if (!owner || owner.email !== email || !(await compare(password, owner.passwordHash))) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession();
  return Response.json({ ok: true });
}
