"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Post } from "@/lib/posts";
import type { Category } from "@/lib/category-link";
import { categoryLink, UNCATEGORIZED_LABEL } from "@/lib/category-link";

type SearchClientProps = {
  posts: Post[];
  categories: Category[];
};

type RankedPost = {
  post: Post;
  score: number;
};

export default function SearchClient({ posts, categories }: SearchClientProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  /** Build a lookup map so post chips resolve O(1) instead of O(n) per post. */
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  /** Resolve a post's categoryIds to display text (or fallback). */
  function resolveCategories(post: Post): { label: string; href?: string }[] {
    const resolved = post.categoryIds
      .map((id) => categoryMap.get(id))
      .filter((c): c is Category => Boolean(c));
    if (resolved.length === 0) return [{ label: UNCATEGORIZED_LABEL }];
    return resolved.map((c) => ({ ...categoryLink(c) }));
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const id = window.setTimeout(() => mobileInputRef.current?.focus(), 20);
    return () => clearTimeout(id);
  }, [mobileOpen]);

  useEffect(() => {
    const normalized = query.trim().toLowerCase();

    if (normalized.length < 3) {
      setLoading(false);
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      const ranked = rankPosts(posts, normalized);
      setResults(ranked.map((item) => item.post));
      setLoading(false);
      setDesktopOpen(true);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, posts]);

  const featured = posts[0];

  return (
    <main className="site-home">
      <style>{`
        .site-home { min-height: 100vh; background: var(--paper); color: var(--ink); }
        .site-home .site-header { max-width: 1240px; min-height: 86px; margin: auto; padding: 0 30px; display: flex; align-items: center; border-bottom: 1px solid var(--line); position: relative; }
        .site-home .brand { font: 700 30px/1 var(--font-montserrat); letter-spacing: -2.2px; }
        .site-home .brand span { color: var(--blue); }
        .site-home .nav { display: flex; gap: 29px; margin-left: 96px; font-size: 14px; }
        .site-home .nav a { transition: color 220ms ease; color: var(--ink); }
        .site-home .nav a:hover { color: var(--blue); }
        .site-home .header-actions { margin-left: auto; display: flex; align-items: center; gap: 22px; }
        .site-home .search-wrap { position: relative; height: 34px; width: 170px; border-bottom: 1px solid #cfd4de; display: flex; align-items: center; gap: 8px; }
        .site-home .search-wrap svg { width: 16px; fill: none; stroke: var(--muted); stroke-width: 1.7; flex: 0 0 16px; }
        .site-home .search-wrap input { border: 0; outline: 0; background: transparent; width: 100%; font: 13px var(--font-roboto); color: var(--ink); }
        .site-home .search-wrap input::placeholder { color: var(--muted); }
        .site-home .search-wrap button { border: 0; background: transparent; color: var(--muted); padding: 0; cursor: pointer; }
        .site-home .desk-link { font: 500 12px var(--font-poppins); color: var(--blue); text-transform: uppercase; letter-spacing: 1px; }
        .site-home .desk-link span { margin-left: 5px; }

        .site-home .search-dropdown { position: absolute; left: 0; top: calc(100% + 12px); width: min(420px, 42vw); background: var(--paper); border: 1px solid var(--line); box-shadow: 0 24px 90px rgba(16,26,46,0.14); z-index: 50; }
        .site-home .search-dropdown .search-dropdown-head { padding: 12px; border-bottom: 1px solid var(--line); font: 500 10px var(--font-poppins); color: var(--muted); text-transform: uppercase; letter-spacing: 1.8px; }
        .site-home .search-dropdown .search-result-list { max-height: 320px; overflow: auto; }
        .site-home .search-dropdown .search-result { border-bottom: 1px solid var(--line); padding: 13px 14px; background: var(--paper); }
        .site-home .search-dropdown .search-result:last-child { border-bottom: 0; }
        .site-home .search-result a { display: flex; gap: 12px; align-items: center; justify-content: space-between; }
        .site-home .search-result .result-title { font: 500 15px var(--font-montserrat); color: var(--ink); }
        .site-home .search-result .result-meta { color: var(--muted); font: 500 10px var(--font-poppins); text-transform: uppercase; letter-spacing: 1px; }
        .site-home .search-result .result-arrow { color: var(--blue); font-size: 16px; }
        .site-home .search-dropdown .no-results { padding: 20px; color: var(--muted); font: 500 13px var(--font-roboto); }
        .site-home .search-loading { display: flex; align-items: center; gap: 8px; padding: 12px 14px; color: var(--muted); font: 500 11px var(--font-poppins); }
        .site-home .search-loading span { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--blue); border-top-color: transparent; animation: spin 800ms linear infinite; }

        .site-home .hero { max-width: 1240px; min-height: 514px; margin: auto; padding: 80px 30px 48px; display: grid; grid-template-columns: minmax(420px, 0.9fr) minmax(420px, 1fr); align-items: center; gap: 50px; }
        .site-home .hero-copy-wrap { position: relative; z-index: 1; }
        .site-home .hero h1 { margin: 0; font: 400 clamp(56px,7.5vw,100px)/.95 var(--font-montserrat); letter-spacing: -6px; color: var(--ink); }
        .site-home .hero h1 em { font-family: var(--font-playfair); font-style: italic; font-weight: 400; color: var(--blue); }
        .site-home .hero-copy { max-width: 380px; color: var(--muted); line-height: 1.65; font-size: 15px; margin: 30px 0 0; }
        .site-home .hero-actions { display: flex; align-items: center; gap: 14px; margin-top: 26px; }
        .site-home .hero-actions .primary-button, .hero-actions .ghost-button { height: 48px; padding: 0 22px; display: inline-flex; align-items: center; justify-content: center; font: 500 11px var(--font-poppins); letter-spacing: 1.2px; text-transform: uppercase; }
        .site-home .hero-actions .primary-button { background: var(--blue); color: var(--paper); }
        .site-home .hero-actions .ghost-button { border: 1px solid var(--line); color: var(--ink); background: transparent; }
        .site-home .hero-feature { position: relative; min-height: 420px; display: flex; flex-direction: column; justify-content: center; }
        .site-home .hero-feature-image { width: min(100%,460px); min-height: 420px; background: var(--line); box-shadow: 0 30px 120px rgba(16,26,46,.18); border: 1px solid var(--line); overflow: hidden; margin-left: auto; display: flex; align-items: center; justify-content: center; }
        .site-home .hero-feature-image img { width: 100%; height: 420px; object-fit: cover; display: block; }
        .site-home .hero-gradient { width: 100%; height: 420px; background: radial-gradient(circle, var(--blue), var(--ink)); }
        .site-home .hero-feature-meta { max-width: 400px; background: var(--paper); border: 1px solid var(--line); padding: 24px 30px; margin: -60px 0 0 30px; position: relative; z-index: 2; }
        .site-home .hero-feature-meta h2 { font: 500 34px/1.12 var(--font-montserrat); color: var(--ink); letter-spacing: -1px; margin: 8px 0 10px; }
        .site-home .hero-feature-meta p { color: var(--muted); line-height: 1.6; margin: 0; font-size: 14px; }
        .site-home .latest-strip { max-width: 1240px; margin: 0 auto 30px; padding: 0 30px; display: flex; align-items: center; gap: 16px; font: 500 11px var(--font-poppins); text-transform: uppercase; color: var(--blue); letter-spacing: 2px; }
        .site-home .latest-strip .line { flex: 1; height: 1px; background: var(--line); }
        .site-home .latest-strip .muted { color: var(--muted); }
        .site-home .public-posts { max-width: 1240px; margin: 0 auto; padding: 0 30px 80px; display: grid; grid-template-columns: repeat(2, minmax(280px, 1fr)); gap: 28px; }
        .site-home .story-card { background: var(--paper); border: 1px solid var(--line); display: flex; flex-direction: column; min-height: 420px; }
        .site-home .story-image { height: 280px; background: var(--line); overflow: hidden; border-bottom: 1px solid var(--line); }
        .site-home .story-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .site-home .story-image-grid { width: 100%; height: 100%; display: block; background: repeating-linear-gradient(45deg, var(--line), var(--line) 1px, transparent 1px, transparent 8px), var(--paper); }
        .site-home .story-copy { padding: 30px 32px 34px; flex: 1; }
        .site-home .post-meta { display: flex; align-items: center; gap: 12px; font: 500 10px var(--font-poppins); letter-spacing: 1.7px; text-transform: uppercase; margin: 0 0 16px; }
        .site-home .post-date { color: var(--muted); }
        .site-home .cat-chip { color: var(--blue); transition: opacity 180ms ease; }
        .site-home .cat-chip:hover { opacity: 0.75; }
        .site-home .cat-chip-plain { color: var(--muted); }
        .site-home .story-copy h2 { font: 500 34px/1.08 var(--font-montserrat); color: var(--ink); letter-spacing: -1.4px; margin: 0 0 14px; }
        .site-home .post-excerpt { color: var(--muted); font-size: 14px; line-height: 1.6; margin: 0; }
        .site-home .read-link { display: inline-flex; align-items: center; gap: 9px; color: var(--blue); font: 500 11px var(--font-poppins); text-transform: uppercase; letter-spacing: 1px; margin-top: 26px; }
        .site-home .empty-posts { grid-column: 1 / -1; min-height: 220px; display: flex; align-items: center; justify-content: center; color: var(--muted); font: 500 14px var(--font-poppins); border: 1px solid var(--line); background: var(--paper); }

        .site-home .newsletter-hero { max-width: 1240px; margin: 0 auto; padding: 54px 30px 30px; display: grid; grid-template-columns: minmax(440px, 1fr) minmax(380px, 0.92fr); align-items: center; gap: 30px; }
        .site-home .newsletter-copy { padding: 20px 0; }
        .site-home .newsletter-copy .issue-tag { display: inline-flex; align-items: center; gap: 8px; color: var(--blue); font: 700 11px var(--font-poppins); text-transform: uppercase; letter-spacing: 1.8px; margin-bottom: 20px; }
        .site-home .newsletter-copy h1 { margin: 0 0 20px; font: 400 clamp(56px, 7vw, 82px)/1 var(--font-montserrat); color: var(--ink); letter-spacing: -3px; }
        .site-home .newsletter-copy h1 span { color: var(--blue); }
        .site-home .newsletter-copy .newsletter-summary { max-width: 540px; color: var(--muted); font: 400 18px/1.7 var(--font-roboto); margin: 0 0 30px; }
        .site-home .newsletter-form { display: flex; align-items: center; max-width: 500px; min-height: 48px; border: 1px solid var(--line); background: var(--paper); border-radius: 2px; overflow: hidden; }
        .site-home .newsletter-form input { flex: 1; min-width: 0; height: 48px; border: 0; outline: 0; background: transparent; padding: 0 16px; color: var(--ink); font: 14px var(--font-roboto); }
        .site-home .newsletter-form input::placeholder { color: var(--muted); }
        .site-home .newsletter-form button { height: 48px; padding: 0 30px; border: 0; background: var(--blue); color: var(--paper); font: 700 11px var(--font-poppins); text-transform: uppercase; letter-spacing: 1.2px; cursor: pointer; }
        .site-home .newsletter-visual { min-height: 440px; display: flex; align-items: center; justify-content: center; position: relative; }
        .site-home .newsletter-visual .image-card { width: min(440px, 100%); min-height: 420px; border-radius: 0; background: linear-gradient(150deg, var(--line), var(--paper)); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 30px 90px rgba(16,26,46,0.12); position: relative; }
        .site-home .newsletter-visual .image-card::before { content: ""; position: absolute; inset: 0; background-image: radial-gradient(var(--blue) 1px, transparent 1px); background-size: 24px 24px; opacity: 0.18; transform: rotate(-8deg); }
        .site-home .newsletter-visual .image-card::after { content: ""; position: absolute; width: 90%; height: 90%; left: 5%; top: 5%; border-radius: 50%; border: 1px solid var(--blue); opacity: 0.6; transform: rotate(10deg); }
        .site-home .newsletter-visual .image-card .image-inner { position: relative; z-index: 2; width: 180px; height: 180px; border-radius: 50%; background: var(--blue); color: var(--paper); font: 700 56px/180px var(--font-montserrat); text-align: center; box-shadow: inset 0 0 0 14px var(--paper); }
        .site-home .newsletter-visual .image-card .image-inner::before, .site-home .newsletter-visual .image-card .image-inner::after { content: ""; position: absolute; width: 16px; height: 120px; background: var(--ink); top: 30px; border-radius: 12px; }
        .site-home .newsletter-visual .image-card .image-inner::before { left: -40px; transform: rotate(-35deg); }
        .site-home .newsletter-visual .image-card .image-inner::after { right: -40px; transform: rotate(35deg); }
        .site-home .latest-news-section { max-width: 1240px; margin: 0 auto; padding: 20px 30px 80px; }
        .site-home .latest-news-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
        .site-home .latest-news-head h2 { font: 500 30px/1 var(--font-montserrat); color: var(--ink); margin: 0; letter-spacing: -1px; }
        .site-home .latest-news-head h2 a { color: var(--blue); font: 700 11px var(--font-poppins); text-transform: uppercase; letter-spacing: 1px; }
        .site-home .latest-news-grid { display: grid; grid-template-columns: repeat(3, minmax(210px, 1fr)); gap: 28px; }
        .site-home .latest-news-card { background: var(--paper); border: 1px solid var(--line); min-height: 320px; display: flex; flex-direction: column; box-shadow: 0 12px 40px rgba(16,26,46,0.05); }
        .site-home .latest-news-card-image { height: 180px; background: var(--line); overflow: hidden; border-bottom: 1px solid var(--line); position: relative; }
        .site-home .latest-news-card-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .site-home .latest-news-card-content { padding: 22px 24px 26px; }
        .site-home .latest-news-card-content .news-category { color: var(--blue); font: 700 10px var(--font-poppins); letter-spacing: 1.5px; text-transform: uppercase; }
        .site-home .latest-news-card-content h3 { color: var(--ink); font: 500 24px/1.2 var(--font-montserrat); letter-spacing: -0.7px; margin: 12px 0 10px; }
        .site-home .latest-news-card-content p { color: var(--muted); font: 14px/1.7 var(--font-roboto); margin: 0 0 8px; }
        .site-home .latest-news-card-content a { color: var(--blue); font: 700 11px var(--font-poppins); text-transform: uppercase; letter-spacing: 1px; }
        .site-home .floating-subscribe { position: fixed; right: 24px; bottom: 36px; z-index: 20; background: var(--blue); color: var(--paper); border-radius: 26px; padding: 12px 21px; font: 700 11px var(--font-poppins); text-transform: uppercase; border: 0; box-shadow: 0 16px 36px rgba(25,92,255,0.25); }

        .site-home .site-footer { max-width: 1240px; margin: 0 auto; padding: 40px 30px 70px; background: var(--ink); color: var(--paper); border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; gap: 24px; font: 500 11px var(--font-poppins); text-transform: uppercase; letter-spacing: 1.4px; }
        .site-home .site-footer .brand { font-size: 28px; color: var(--paper); }
        .site-home .site-footer .brand span { color: var(--paper); }
        .site-home .site-footer-links { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
        .site-home .site-footer-links a { color: var(--paper); opacity: 0.82; }
        .site-home .site-footer-links a:hover { color: var(--blue); }
        .site-home .site-footer-copy { color: var(--muted); font-family: var(--font-playfair); font-style: italic; font-size: 12px; letter-spacing: .5px; text-transform: none; }
        .site-home .footer-socials { display: flex; align-items: center; gap: 12px; }
        .site-home .footer-social { width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(255,255,255,.30); color: var(--paper); background: transparent; transition: background 260ms ease, border-color 260ms ease, color 260ms ease; }
        .site-home .footer-social svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; }
        .site-home .footer-social:hover { background: var(--paper); color: var(--ink); border-color: var(--paper); }
        .site-home .footer-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
        .site-home .footer-column { display: flex; flex-direction: column; gap: 14px; align-items: flex-start; }

        .site-home .mobile-search { display: none; }
        @media (max-width: 960px) { .site-home .hero { grid-template-columns: 1fr; } .site-home .hero-feature-image { margin-left: 0; } .site-home .public-posts { grid-template-columns: 1fr; } }

        @media (max-width: 760px) {
          .site-home .site-header { min-height: 70px; padding: 0 20px; }
          .site-home .desktop-nav { display: none; }
          .site-home .header-actions { width: auto; flex: 1; justify-content: flex-end; margin-left: 10px; }
          .site-home .desk-link { display: none; }
          .site-home .search-wrap { display: none; }
          .site-home .mobile-search { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; padding: 0; background: var(--blue); color: var(--paper); border-radius: 50%; border: 0; cursor: pointer; }
          .site-home .mobile-search svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.8; }
          .site-home .hero { min-height: auto; padding: 50px 20px 30px; }
          .site-home .hero h1 { font-size: 56px; letter-spacing: -4px; }
          .site-home .hero-copy { max-width: 100%; }
          .site-home .hero-feature { min-height: auto; }
          .site-home .hero-feature-image { width: 100%; min-height: 280px; }
          .site-home .hero-feature-image img { height: 280px; }
          .site-home .hero-feature-meta { margin: 20px 0 0; max-width: 100%; }
          .site-home .latest-strip { padding: 0 20px; flex-wrap: wrap; }
          .site-home .public-posts { padding: 0 20px 80px; }
          .site-home .site-footer { padding: 32px 20px 46px; flex-direction: column; align-items: flex-start; }

          .site-home .mobile-search-modal-backdrop { position: fixed; inset: 0; background: rgba(16,26,46,.62); z-index: 80; display: flex; align-items: stretch; justify-content: center; }
          .site-home .mobile-search-modal { position: fixed; inset: 0; background: var(--paper); z-index: 90; padding: 24px; display: flex; flex-direction: column; }
          .site-home .mobile-search-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 50px; }
          .site-home .mobile-search-modal-head span { font: 700 13px var(--font-poppins); color: var(--ink); text-transform: uppercase; letter-spacing: 1.4px; }
          .site-home .mobile-search-modal-head button { background: var(--blue); color: var(--paper); border: 0; padding: 12px 16px; font: 700 11px var(--font-poppins); text-transform: uppercase; letter-spacing: 1px; }
          .site-home .mobile-search-modal .mobile-search-form { display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--line); min-height: 50px; }
          .site-home .mobile-search-modal .mobile-search-form svg { width: 20px; height: 20px; fill: none; stroke: var(--blue); stroke-width: 1.6; }
          .site-home .mobile-search-modal .mobile-search-form input { border: 0; outline: none; background: transparent; width: 100%; font: 24px var(--font-montserrat); color: var(--ink); }
          .site-home .mobile-search-modal .mobile-search-drop { flex: 1; overflow: auto; padding-top: 14px; }
          .site-home .mobile-search-modal .search-result { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); padding: 16px 0; }
          .site-home .mobile-search-modal .search-result .result-title { font: 500 20px var(--font-montserrat); color: var(--ink); }
          .site-home .mobile-search-modal .search-result .result-meta { font: 500 10px var(--font-poppins); text-transform: uppercase; color: var(--muted); margin-top: 8px; }
          .site-home .mobile-search-modal .search-result .result-arrow { color: var(--blue); font-size: 22px; }
          .site-home .mobile-search-modal .no-results { color: var(--muted); font: 500 14px var(--font-poppins); }
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <header className="site-header">
        <a className="brand" href="/">revile<span>.</span></a>

        {/* Nav links are derived from the categories array — no string literals */}
        <nav className="nav desktop-nav">
          {categories.map((cat) => {
            const { href, label } = categoryLink(cat);
            return <Link key={cat.id} href={href}>{label}</Link>;
          })}
        </nav>

        <div className="header-actions">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24" aria-label="Search">
              <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="m21 21-4.8-4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <input value={query} aria-label="Search articles" placeholder="Search" autoComplete="off" onClick={() => setDesktopOpen(true)} onFocus={() => setDesktopOpen(true)} onChange={(event) => setQuery(event.target.value)} />
            {query && <button aria-label="Clear search" onClick={() => setQuery("")}>×</button>}
            {desktopOpen && query.trim().length >= 3 && (
              <div className="search-dropdown">
                <div className="search-dropdown-head">{loading ? "Searching" : `${results.length} match${results.length === 1 ? "" : "es"}`}</div>
                {loading ? (
                  <div className="search-loading"><span /><small>Loading</small></div>
                ) : results.length === 0 ? (
                  <div className="no-results">No posts found</div>
                ) : (
                  <div className="search-result-list">
                    {results.map((post) => {
                      const chips = resolveCategories(post);
                      const metaLabel = chips.map((c) => c.label).join(", ");
                      return (
                        <div className="search-result" key={post.id}>
                          <Link href={`/posts/${post.slug ?? post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}>
                            <span>
                              <span className="result-title">{post.title}</span>
                              <span className="result-meta">{metaLabel}</span>
                            </span>
                            <span className="result-arrow">→</span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="mobile-search" aria-label="Open mobile search" onClick={() => setMobileOpen(true)}>
            <svg viewBox="0 0 24 24" aria-label="Search">
              <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="m21 21-4.8-4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>

        </div>
      </header>

      <section className="newsletter-hero">
        <section className="newsletter-copy">
          <div className="issue-tag">Revile / Newsletter</div>
          <h1>Become a Better<br />Linux User</h1>
          <p className="newsletter-summary">With the FOSS Weekly Newsletter, you learn useful Linux tips, discover applications, explore new distros and stay updated with the latest from Linux world.</p>
          <form className="newsletter-form">
            <input aria-label="Your email address" placeholder="Your email address" type="email" />
            <button type="button">Subscribe</button>
          </form>
        </section>

        <section className="newsletter-visual" aria-label="Newsletter graphic">
          <div className="image-card">
            <div className="image-inner">✦</div>
          </div>
        </section>
      </section>

      <section className="latest-news-section">
        <div className="latest-news-head">
          <h2>Latest News <a href="#posts">View All →</a></h2>
        </div>
        <div className="latest-news-grid">
          {posts.slice(0, 3).map((post) => {
            const chips = resolveCategories(post);
            const categoryLabel = chips[0]?.label ?? UNCATEGORIZED_LABEL;
            const foundImage = post.coverImage || "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80";
            return (
              <article className="latest-news-card" key={post.id}>
                <div className="latest-news-card-image"><img src={foundImage} alt="" /></div>
                <div className="latest-news-card-content">
                  <span className="news-category">{categoryLabel}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Link href={`/posts/${post.slug ?? post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}>Read article →</Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <button className="floating-subscribe">Subscribe</button>

      <footer className="site-footer">
        <div className="footer-column">
          <a className="brand" href="/">revile<span>.</span></a>
          <span className="site-footer-copy">Field note archive</span>
          <div className="footer-socials">
            <a className="footer-social" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>
            </a>
            <a className="footer-social" href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
              <svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20" /></svg>
            </a>
            <a className="footer-social" href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <svg viewBox="0 0 24 24"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></svg>
            </a>
          </div>
        </div>
        {/* Footer nav — derived from categories, no hardcoded labels */}
        <nav className="site-footer-links">
          {categories.map((cat) => {
            const { href, label } = categoryLink(cat);
            return <Link key={cat.id} href={href}>{label}</Link>;
          })}
        </nav>
      </footer>

      {mobileOpen && (
        <div className="mobile-search-modal-backdrop">
          <div className="mobile-search-modal">
            <div className="mobile-search-modal-head">
              <span>Search posts</span>
              <button onClick={() => { setMobileOpen(false); setDesktopOpen(false); }}>Cancel</button>
            </div>
            <div className="mobile-search-form">
              <svg viewBox="0 0 24 24" aria-label="Search">
                <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="m21 21-4.8-4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <input ref={mobileInputRef} value={query} aria-label="Search articles" placeholder="Type to search" autoComplete="off" onChange={(event) => setQuery(event.target.value)} />
            </div>
            <div className="mobile-search-drop">
              {loading ? (
                <div className="search-loading"><span /><small>Loading</small></div>
              ) : query.trim().length < 3 ? (
                <div className="no-results">Type at least three characters</div>
              ) : results.length === 0 ? (
                <div className="no-results">No posts found</div>
              ) : (
                results.map((post) => {
                  const chips = resolveCategories(post);
                  const metaLabel = chips.map((c) => c.label).join(", ");
                  return (
                    <div className="search-result" key={post.id}>
                      <Link href={`/posts/${post.slug ?? post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}>
                        <span>
                          <span className="result-title">{post.title}</span>
                          <span className="result-meta">{metaLabel}</span>
                        </span>
                        <span className="result-arrow">→</span>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function rankPosts(posts: Post[], query: string): RankedPost[] {
  const loweredQuery = query.toLowerCase();

  return posts
    .map((post) => {
      const title = post.title.toLowerCase();
      const tags = (post.tags || "").toLowerCase();
      const excerpt = (post.excerpt || "").toLowerCase();

      let score = 0;
      if (title.includes(loweredQuery)) score += 100;
      if (tags.includes(loweredQuery)) score += 40;
      if (excerpt.includes(loweredQuery)) score += 20;

      return { post, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}