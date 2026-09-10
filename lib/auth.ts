import "server-only";
import { auth } from "@clerk/nextjs/server";

export async function hasSession() {
  const { userId } = await auth();
  return Boolean(userId);
}

export async function createSession() {
  return;
}

export async function clearSession() {
  return;
}
