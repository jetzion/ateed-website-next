/**
 * Absolute URL for a Contentful image, resized by Contentful's Images API.
 *
 * Pre-resizing matters in production: the Next.js image optimizer runs in a
 * memory-limited Lambda and returns 502 for multi-MB originals (a 7.3 MB,
 * 5504px JPEG failed). Contentful hands it a small WebP instead.
 */
export function contentfulImageUrl(url: string | undefined, width: number) {
  if (!url) return null;
  const absolute = url.startsWith("//") ? `https:${url}` : url;
  const sep = absolute.includes("?") ? "&" : "?";
  return `${absolute}${sep}fm=webp&w=${width}&q=80`;
}
