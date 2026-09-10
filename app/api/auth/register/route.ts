import { hash } from "bcryptjs";
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

  if (!emailPattern.test(email)) {
    return Response.json({ error: "Provide a valid email address." }, { status: 400 });
  }

  if (password.length < 8 || password.length > 72) {
    return Response.json({ error: "Password must be at least 8 characters and no more than 72 characters." }, { status: 400 });
  }

  const db = await getDb();
  const users = db.collection<Owner>("users");

  const existing = await users.findOne({ _id: "owner" });
  if (existing) {
    return Response.json({ error: "An owner account already exists." }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  await users.insertOne({
    _id: "owner",
    email,
    passwordHash,
    createdAt: new Date(),
  });

  await createSession();
  return Response.json({ ok: true }, { status: 201 });
}
