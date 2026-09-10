import { hasSession } from "@/lib/auth";
import { updateCategory, deleteCategory, type CategoryInput } from "@/lib/categories";

/** PUT /api/categories/[id] - auth-gated; renames a category (slug is re-derived). */
export async function PUT(request: Request, { params }: RouteContext<"/api/categories/[id]">) {
  if (!(await hasSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.name || typeof body.name !== "string" || !body.name.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }
  const input: CategoryInput = { name: body.name.trim() };
  if (body.description && typeof body.description === "string") input.description = body.description.trim();
  const result = await updateCategory(id, input);
  return result ? Response.json(result) : Response.json({ error: "Not found" }, { status: 404 });
}

/** DELETE /api/categories/[id] - auth-gated; deletes a category.
 *  Posts that referenced this category show UNCATEGORIZED_LABEL as fallback. */
export async function DELETE(_: Request, { params }: RouteContext<"/api/categories/[id]">) {
  if (!(await hasSession())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  return (await deleteCategory(id))
    ? new Response(null, { status: 204 })
    : Response.json({ error: "Not found" }, { status: 404 });
}