/**
 * Shared (client + server) category primitives.
 * Keep this file free of server-only imports — it is imported by Client Components.
 *
 * This is the ONLY place where a /category/ URL is ever constructed.
 * All navlinks, chips, and breadcrumbs must call `categoryLink` instead of
 * building the href inline.
 */

export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
};

/**
 * The single source of truth for category URL + display label.
 * Changing the URL pattern here propagates everywhere automatically.
 */
export function categoryLink(category: Category): { href: string; label: string } {
  return { href: `/category/${category.slug}`, label: category.name };
}

/**
 * Fallback label shown when a post has no recognised categories.
 * Change this string here — it is never repeated elsewhere in the code.
 */
export const UNCATEGORIZED_LABEL = "Uncategorized";
