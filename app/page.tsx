import SearchClient from "@/components/SearchClient";
import { publicPosts } from "@/lib/posts";
import { allCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [posts, categories] = await Promise.all([publicPosts(), allCategories()]);
  return <SearchClient posts={posts} categories={categories} />;
}
