import { getDb } from "@/lib/mongodb";
import { hasSession } from "@/lib/auth";
type Owner = { _id: string; email: string; passwordHash: string; createdAt: Date };
export async function GET() { const owner = await (await getDb()).collection<Owner>("users").findOne({ _id: "owner" }); return Response.json({ accountExists: Boolean(owner), authenticated: await hasSession() }); }
