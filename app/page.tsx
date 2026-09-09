import Link from "next/link";
import { publicPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await publicPosts();
  return <main className="empty-home"><div><a className="brand" href="/">revile<span>.</span></a>{posts.length === 0 ? <p>Writing in progress.</p> : <section className="public-posts">{posts.map((post) => <article key={post.id}><p className="eyebrow">{post.tags || "Latest"}</p><h1>{post.title}</h1><p>{post.excerpt}</p></article>)}</section>}</div><Link href="/sign-in">Writing desk <span>↗</span></Link></main>;
}
