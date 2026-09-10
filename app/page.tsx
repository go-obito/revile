import SearchClient from "@/components/SearchClient";
import { publicPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await publicPosts();

  return <SearchClient posts={posts} />;
}
