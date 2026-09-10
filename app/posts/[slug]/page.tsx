import { notFound } from "next/navigation";
import Link from "next/link";
import { allCategories } from "@/lib/categories";
import { categoryLink, UNCATEGORIZED_LABEL } from "@/lib/category-link";
import { postBySlug } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function PostReaderPage({ params }: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  const [post, categories] = await Promise.all([postBySlug(slug), allCategories()]);

  if (!post || post.status !== "published") notFound();

  const postCategories = categories.filter((category) => post.categoryIds.includes(category.id));
  const categoryLabel = postCategories.length > 0
    ? postCategories.map((category) => category.name).join(", ")
    : UNCATEGORIZED_LABEL;

  return (
    <main className="article-page">
      <style>{`
        .article-page { min-height: 100vh; background: var(--paper); color: var(--ink); }
        .article-page .site-header { max-width: 1240px; min-height: 86px; margin: auto; padding: 0 30px; display: flex; align-items: center; border-bottom: 1px solid var(--line); position: relative; }
        .article-page .brand { font: 700 30px/1 var(--font-montserrat); letter-spacing: -2.2px; color: var(--ink); }
        .article-page .brand span { color: var(--blue); }
        .article-page .nav { display: flex; gap: 29px; margin-left: 96px; font-size: 14px; }
        .article-page .nav a { transition: color 220ms ease; color: var(--ink); }
        .article-page .nav a:hover { color: var(--blue); }
        .article-page .desk-link { font: 500 12px var(--font-poppins); color: var(--blue); text-transform: uppercase; letter-spacing: 1px; margin-left: auto; }

        .article-shell { max-width: 980px; margin: 0 auto; padding: 50px 30px 80px; }
        .article-card { background: var(--paper); border: 1px solid var(--line); padding: clamp(24px, 4vw, 44px); box-shadow: 0 30px 90px rgba(16,26,46,0.05); }
        .article-cover { width: 100%; height: min(420px, 46vw); min-height: 280px; background: var(--line); overflow: hidden; margin-bottom: 26px; }
        .article-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .article-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; color: var(--muted); font: 500 10px var(--font-poppins); letter-spacing: 1.7px; text-transform: uppercase; }
        .article-meta .category-label { color: var(--blue); }
        .article-card h1 { font: 500 clamp(50px, 7vw, 76px)/1.05 var(--font-montserrat); color: var(--ink); letter-spacing: -3px; margin: 16px 0 10px; }
        .article-excerpt { color: var(--muted); font: 400 18px/1.7 var(--font-roboto); margin: 0 0 30px; }
        .article-content { border-top: 1px solid var(--line); padding-top: 30px; color: var(--ink); font: 400 18px/1.9 var(--font-roboto); }
        .article-content p { margin: 0 0 1.2em; }
        .article-content h2, .article-content h3 { font-family: var(--font-montserrat); color: var(--ink); font-weight: 500; margin: 34px 0 14px; }
        .article-content h2 { font-size: 34px; line-height: 1.25; letter-spacing: -1px; }
        .article-content h3 { font-size: 26px; line-height: 1.25; letter-spacing: -1px; }
        .article-content blockquote { border-left: 3px solid var(--blue); padding: 0 0 0 22px; color: var(--muted); margin: 26px 0; font-family: var(--font-playfair); font-style: italic; font-size: 26px; line-height: 1.5; }
        .article-content img { max-width: 100%; display: block; margin: 30px 0; border-radius: 3px; }
        .article-content a { color: var(--blue); }
        .article-content pre { background: var(--ink); color: var(--paper); padding: 20px; overflow: auto; border-radius: 4px; }
        .article-content ul, .article-content ol { padding-left: 24px; }
        .article-content code { font-family: monospace; }

        .site-footer { max-width: 1240px; margin: 0 auto; padding: 40px 30px 70px; background: var(--ink); color: var(--paper); border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; gap: 24px; font: 500 11px var(--font-poppins); text-transform: uppercase; letter-spacing: 1.4px; }
        .site-footer .brand { font-size: 28px; color: var(--paper); }
        .site-footer .brand span { color: var(--paper); }
        .site-footer-links { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
        .site-footer-links a { color: var(--paper); opacity: 0.82; }
        .site-footer-links a:hover { color: var(--blue); opacity: 1; }

        @media (max-width: 760px) {
          .article-page .site-header { min-height: 70px; padding: 0 20px; }
          .article-page .nav { display: none; }
          .article-shell { padding: 24px 20px 60px; }
          .site-footer { padding: 32px 20px 46px; flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <header className="site-header">
        <Link className="brand" href="/">revile<span>.</span></Link>
        <nav className="nav">
          {categories.map((cat) => {
            const { href, label } = categoryLink(cat);
            return <Link key={cat.id} href={href}>{label}</Link>;
          })}
        </nav>
        <Link className="desk-link" href="/">Home <span>↗</span></Link>
      </header>

      <section className="article-shell">
        <article className="article-card">
          {post.coverImage && <div className="article-cover"><img src={post.coverImage} alt="" /></div>}
          <div className="article-meta">
            <span className="category-label">{categoryLabel}</span>
            <span>·</span>
            <span>{new Date(post.publishedAt ?? post.updatedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
          <h1>{post.title}</h1>
          <p className="article-excerpt">{post.excerpt}</p>
          <div className="article-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </section>

      <footer className="site-footer">
        <Link className="brand" href="/">revile<span>.</span></Link>
        <nav className="site-footer-links">
          {categories.map((cat) => {
            const { href, label } = categoryLink(cat);
            return <Link key={cat.id} href={href}>{label}</Link>;
          })}
        </nav>
      </footer>
    </main>
  );
}
