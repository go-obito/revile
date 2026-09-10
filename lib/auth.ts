import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { loadEnv } from "@/lib/env";

loadEnv();

const cookieName = "revile_session";
const key = () => {
  if (!process.env.AUTH_SECRET) throw new Error("Missing AUTH_SECRET environment variable.");
  return new TextEncoder().encode(process.env.AUTH_SECRET);
};

export async function createSession() {
  const token = await new SignJWT({ role: "owner" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(key());
  const store = await cookies();
  store.set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function hasSession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return false;
  try { return (await jwtVerify(token, key())).payload.role === "owner"; } catch { return false; }
}

export async function clearSession() { (await cookies()).delete(cookieName); }
