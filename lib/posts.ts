import "server-only";
import { ObjectId, WithId } from "mongodb";
import { getDb } from "./mongodb";

export type PostStatus = "draft" | "published";
export type PostInput = { title: string; excerpt: string; tags: string; categoryIds: string[]; content: string; coverImage?: string; status: PostStatus };
export type Post = PostInput & { id: string; createdAt: string; updatedAt: string; publishedAt: string | null };
type StoredPost = PostInput & { createdAt: Date; updatedAt: Date; publishedAt: Date | null };
const collection = async () => (await getDb()).collection<StoredPost>("posts");
const toPost = (post: WithId<StoredPost>): Post => ({ ...post, id: post._id.toHexString(), categoryIds: post.categoryIds ?? [], createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString(), publishedAt: post.publishedAt?.toISOString() ?? null });

export async function publicPosts() { return (await (await collection()).find({ status: "published" }).sort({ publishedAt: -1 }).toArray()).map(toPost); }
export async function allPosts() { return (await (await collection()).find().sort({ updatedAt: -1 }).toArray()).map(toPost); }
export async function postById(id: string) { if (!ObjectId.isValid(id)) return null; const post = await (await collection()).findOne({ _id: new ObjectId(id) }); return post ? toPost(post) : null; }
export async function postsByCategoryId(categoryId: string) { return (await (await collection()).find({ status: "published", categoryIds: categoryId }).sort({ publishedAt: -1 }).toArray()).map(toPost); }
export async function createPost(input: PostInput) { const now = new Date(); const result = await (await collection()).insertOne({ ...input, categoryIds: input.categoryIds ?? [], createdAt: now, updatedAt: now, publishedAt: input.status === "published" ? now : null }); return postById(result.insertedId.toHexString()); }
export async function updatePost(id: string, input: PostInput) { if (!ObjectId.isValid(id)) return null; const current = await postById(id); if (!current) return null; const now = new Date(); await (await collection()).updateOne({ _id: new ObjectId(id) }, { $set: { ...input, categoryIds: input.categoryIds ?? [], updatedAt: now, publishedAt: input.status === "published" ? (current.publishedAt ? new Date(current.publishedAt) : now) : null } }); return postById(id); }
export async function deletePost(id: string) { if (!ObjectId.isValid(id)) return false; return (await (await collection()).deleteOne({ _id: new ObjectId(id) })).deletedCount === 1; }
