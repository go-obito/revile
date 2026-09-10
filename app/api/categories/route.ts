import { hasSession } from "@/lib/auth";
import { allCategories, createCategory, type CategoryInput } from "@/lib/categories";

/** GET /api/categories — public; returns all categories sorted by name. */
export async function GET() {
  return Response.json(await allCategories());
}

/** POST /api/categories — auth-gated; creates a new category. */
export async function POST(request: Request) {
  if (!(await hasSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.name || typeof body.name !== "string" || !body.name.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }
  const input: CategoryInput = { name: body.name.trim() };
  if (body.description && typeof body.description === "string") input.description = body.description.trim();
  return Response.json(await createCategory(input), { status: 201 });
}
