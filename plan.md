# Revile — personal blog with a private writing desk

"Real eyes realise real lies." A single-author blog: a public reading side anyone can visit, and a private side only you can reach, where you write, edit and publish.

## Public side

- **Home** — a navigation bar with the blog name plus Latest, World, Tech, Football and a search box, collapsing to a tap-to-open menu on phones; below it the latest published posts with cover image, title, date and short excerpt.
- **Home layout** — one large trending post at the top, then a list of other stories where each story shows the image on the left and the preview on the right. Every card shows a tag, the date, and the time posted.
- **Post page** — one post at a time: cover image, title, date, tags, full formatted text. Each post has its own shareable link with proper title/description/preview image for social sharing.
- **Tags** — browse everything filed under a topic.
- **About** — a short personal page.
- Only published posts are ever visible publicly; drafts stay hidden.

## Private side (your admin)

- **Sign in** — email and password. Your account is the only one that can write; the site has no public sign-up.
- **Dashboard** — all your posts, drafts and published together, with status, date, and quick edit/delete.
- **Writing page** — title, a rich text editor (headings, bold/italic, lists, quotes, links, inline images), cover image upload, tags, and a short excerpt.
- **Save as draft** or **Publish** — drafts are private to you and visible in your dashboard; publishing puts the post live. You can unpublish back to draft.

## What I need from you

Your admin account: I'll add a sign-in page, and you create your account on first visit — after that sign-up is closed. Nothing else needed up front. Any About-page text you want is easy to replace later; I'll put a placeholder in for now.

## Typography

Montesserrat for logo name.Poppins for cta.Roboto for overall texts

## Color

Revile primary color is blue, as seen in its logo and call-to-action (CTA) buttons throughout its website. Blue’s connection to trust and professionalism ties back to the security and reliability a user wants in a video communication platform. The use of white in its background and accents creates a sense of clarity, fostering ease of use within the platform.

##

## Technical notes

- Tables: `posts` (title, slug, excerpt, rich-text content, cover image path, status draft/published, published_at, author_id, timestamps), `tags`, `post_tags`. Grants issued for every new public table.
- Roles in a separate `user_roles` table with a `has_role` security-definer function; admin checks server-side only, never client storage.
- RLS: public/anon SELECT limited to `status = 'published'`; owner SELECT/INSERT/UPDATE/DELETE scoped to `auth.uid()` so drafts are readable by their author.
- Admin routes under `src/routes/_authenticated/`; `/` stays public.
- Storage bucket for cover images with RLS: public read, owner-only write.
- Rich text stored as sanitised HTML from a Tiptap-based editor.
- Per-route `head()` metadata; post pages get og:image from the cover image's absolute URL.