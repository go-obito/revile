import { notFound } from "next/navigation";
import Link from "next/link";
import { allCategories, categoryBySlug } from "@/lib/categories";
import { categoryLink, UNCATEGORIZED_LABEL } from "@/lib/category-link";
import { postsByCategoryId } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const [category, categories] = await Promise.all([categoryBySlug(slug), allCategories()]);
  if (!category) notFound();

  const posts = await postsByCategoryId(category.id);

  return (
    <main className="site-home">
      <style>{`
        .site-home { min-height: 100vh; background: var(--paper); color: var(--ink); }
        .site-home .site-header { max-width: 1240px; min-height: 86px; margin: auto; padding: 0 30px; display: flex; align-items: center; border-bottom: 1px solid var(--line); }
        .site-home .brand { font: 700 30px/1 var(--font-montserrat); letter-spacing: -2.2px; }
        .site-home .brand span { color: var(--blue); }
        .site-home .nav { display: flex; gap: 29px; margin-left: 96px; font-size: 14px; }
        .site-home .nav a { transition: color 220ms ease; color: var(--ink); }
        .site-home .nav a:hover, .site-home .nav a.active { color: var(--blue); }
        .site-home .header-actions { margin-left: auto; display: flex; align-items: center; gap: 22px; }
        .site-home .desk-link { font: 500 12px var(--font-poppins); color: var(--blue); text-transform: uppercase; letter-spacing: 1px; }

        .category-hero { max-width: 1240px; margin: auto; padding: 64px 30px 48px; border-bottom: 1px solid var(--line); }
        .category-hero .eyebrow { text-transform: uppercase; letter-spacing: 2px; font: 500 10px var(--font-poppins); color: var(--blue); margin: 0 0 16px; }
        .category-hero h1 { margin: 0 0 14px; font: 500 clamp(40px, 6vw, 72px)/1 var(--font-montserrat); letter-spacing: -3px; color: var(--ink); }
        .category-hero p { color: var(--muted); font-size: 15px; line-height: 1.65; margin: 0; max-width: 480px; }

        .public-posts { max-width: 1240px; margin: 0 auto; padding: 48px 30px 80px; display: grid; grid-template-columns: repeat(2, minmax(280px, 1fr)); gap: 28px; }
        .story-card { background: var(--paper); border: 1px solid var(--line); display: flex; flex-direction: column; min-height: 420px; }
        .story-image { height: 280px; background: var(--line); overflow: hidden; border-bottom: 1px solid var(--line); }
        .story-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .story-image-grid { width: 100%; height: 100%; display: block; background: repeating-linear-gradient(45deg, var(--line), var(--line) 1px, transparent 1px, transparent 8px), var(--paper); }
        .story-copy { padding: 30px 32px 34px; flex: 1; }
        .post-meta { display: flex; align-items: center; gap: 12px; color: var(--blue); font: 500 10px var(--font-poppins); letter-spacing: 1.7px; text-transform: uppercase; margin: 0 0 16px; }
        .post-date { color: var(--muted); }
        .story-copy h2 { font: 500 34px/1.08 var(--font-montserrat); color: var(--ink); letter-spacing: -1.4px; margin: 0 0 14px; }
        .post-excerpt { color: var(--muted); font-size: 14px; line-height: 1.6; margin: 0; }
        .read-link { display: inline-flex; align-items: center; gap: 9px; color: var(--blue); font: 500 11px var(--font-poppins); text-transform: uppercase; letter-spacing: 1px; margin-top: 26px; }
        .empty-posts { grid-column: 1 / -1; min-height: 220px; display: flex; align-items: center; justify-content: center; color: var(--muted); font: 500 14px var(--font-poppins); border: 1px solid var(--line); background: var(--paper); }

        .site-footer { max-width: 1240px; margin: 0 auto; padding: 40px 30px 70px; background: var(--ink); color: var(--paper); border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; gap: 24px; font: 500 11px var(--font-poppins); text-transform: uppercase; letter-spacing: 1.4px; }
        .site-footer .brand { font-size: 28px; color: var(--paper); }
        .site-footer .brand span { color: var(--paper); }
        .site-footer-links { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
        .site-footer-links a { color: var(--paper); opacity: 0.82; }
        .site-footer-links a:hover { color: var(--blue); opacity: 1; }

        @media (max-width: 960px) { .public-posts { grid-template-columns: 1fr; } }
        @media (max-width: 760px) {
          .site-home .site-header { min-height: 70px; padding: 0 20px; }
          .site-home .nav { display: none; }
          .category-hero { padding: 40px 20px 32px; }
          .public-posts { padding: 32px 20px 60px; }
          .site-footer { padding: 32px 20px 46px; flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <header className="site-header">
        <Link className="brand" href="/">revile<span>.</span></Link>
        <nav className="nav">
          {categories.map((cat) => {
            const { href, label } = categoryLink(cat);
            return (
              <Link key={cat.id} href={href} className={cat.slug === slug ? "active" : undefined}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="header-actions">
          <Link className="desk-link" href="/">Home <span>↗</span></Link>
        </div>
      </header>

      <div className="category-hero">
        <p className="eyebrow">Category</p>
        <h1>{category.name}</h1>
        {category.description && <p>{category.description}</p>}
      </div>

      <section className="public-posts">
        {posts.length === 0 ? (
          <div className="empty-posts"><p>No posts in this category yet.</p></div>
        ) : (
          posts.map((post) => {
            const postCategories = categories.filter((c) => post.categoryIds.includes(c.id));
            const categoryLabel = postCategories.length > 0
              ? postCategories.map((c) => c.name).join(", ")
              : UNCATEGORIZED_LABEL;
            return (
              <article className="story-card" key={post.id}>
                <div className="story-image">
                  {post.coverImage ? <img src={post.coverImage} alt="" /> : <span className="story-image-grid" />}
                </div>
                <div className="story-copy">
                  <p className="post-meta">
                    <span>{categoryLabel}</span>
                    <span className="post-date">
                      {new Date(post.publishedAt ?? post.updatedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </p>
                  <h2>{post.title}</h2>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <Link className="read-link" href={`/#posts`}>Read the piece <span>→</span></Link>
                </div>
              </article>
            );
          })
        )}
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