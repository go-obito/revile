import "server-only";
import { ObjectId, WithId } from "mongodb";
import { getDb } from "./mongodb";
import type { Category } from "./category-link";
export type { Category } from "./category-link";
export { categoryLink, UNCATEGORIZED_LABEL } from "./category-link";

type StoredCategory = { slug: string; name: string; description?: string };

const collection = async () => (await getDb()).collection<StoredCategory>("categories");

const toCategory = (doc: WithId<StoredCategory>): Category => ({
  id: doc._id.toHexString(),
  slug: doc.slug,
  name: doc.name,
  ...(doc.description ? { description: doc.description } : {}),
});

/** Derives a URL-safe slug from a display name. */
export function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function allCategories(): Promise<Category[]> {
  return (await (await collection()).find().sort({ name: 1 }).toArray()).map(toCategory);
}

export async function categoryBySlug(slug: string): Promise<Category | null> {
  const doc = await (await collection()).findOne({ slug });
  return doc ? toCategory(doc) : null;
}

export async function categoriesByIds(ids: string[]): Promise<Category[]> {
  const valid = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  if (valid.length === 0) return [];
  return (await (await collection()).find({ _id: { $in: valid } }).toArray()).map(toCategory);
}

export type CategoryInput = { name: string; description?: string };

export async function createCategory(input: CategoryInput): Promise<Category> {
  const slug = slugify(input.name);
  const doc: StoredCategory = { name: input.name.trim(), slug };
  if (input.description) doc.description = input.description;
  const result = await (await collection()).insertOne(doc);
  return { id: result.insertedId.toHexString(), slug, name: doc.name, ...(doc.description ? { description: doc.description } : {}) };
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category | null> {
  if (!ObjectId.isValid(id)) return null;
  const slug = slugify(input.name);
  const set: StoredCategory = { name: input.name.trim(), slug };
  if (input.description) set.description = input.description;
  const result = await (await collection()).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: set },
    { returnDocument: "after" }
  );
  return result ? toCategory(result) : null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  return (await (await collection()).deleteOne({ _id: new ObjectId(id) })).deletedCount === 1;
}
