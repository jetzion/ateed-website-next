import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/contentful";
import {
  documentToHtmlString,
  type Options,
} from "@contentful/rich-text-html-renderer";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import type { Author, BlogPost } from "@/types/contentful";

export const dynamic = "force-static";
export const revalidate = 3600;

// Generate static params for all blog posts
export async function generateStaticParams() {
  const response = await getBlogPosts();
  return (response.items as unknown as BlogPost[]).map((post) => ({
    slug: encodeURIComponent(
      post.fields.title.trim().toLowerCase().replace(/\s+/g, "-"),
    ),
  }));
}

// Generate metadata for each blog post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const postData = post as unknown as BlogPost;
  const imageUrl = postData.fields.heroImage?.fields?.file?.url;
  // Social-card image: normalize protocol and cap size via Contentful (keep
  // JPEG — webp OG images don't render on every platform).
  const ogImage = imageUrl
    ? `${imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl}?w=1200&q=80`
    : undefined;

  return {
    title: postData.fields.title,
    description: postData.fields.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: postData.fields.title,
      description: postData.fields.excerpt,
      type: "article",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

// Rich text rendering options
const richTextOptions: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => `<strong>${text}</strong>`,
    [MARKS.ITALIC]: (text) => `<em>${text}</em>`,
    [MARKS.UNDERLINE]: (text) => `<u>${text}</u>`,
    [MARKS.CODE]: (text) =>
      `<code class="bg-[#F5F0EB] px-1 rounded">${text}</code>`,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, next) =>
      `<p class="mb-6 text-[#78716C] leading-relaxed">${next(node.content)}</p>`,
    [BLOCKS.HEADING_1]: (node, next) =>
      `<h1 class="font-serif text-4xl font-normal mb-6 mt-8 text-[#1C1917]">${next(node.content)}</h1>`,
    [BLOCKS.HEADING_2]: (node, next) =>
      `<h2 class="font-serif text-3xl font-normal mb-4 mt-8 text-[#1C1917]">${next(node.content)}</h2>`,
    [BLOCKS.HEADING_3]: (node, next) =>
      `<h3 class="font-serif text-2xl font-normal mb-4 mt-6 text-[#1C1917]">${next(node.content)}</h3>`,
    [BLOCKS.HEADING_4]: (node, next) =>
      `<h4 class="font-serif text-xl font-normal mb-3 mt-4 text-[#1C1917]">${next(node.content)}</h4>`,
    [BLOCKS.HEADING_5]: (node, next) =>
      `<h5 class="font-serif text-lg font-normal mb-2 mt-4 text-[#1C1917]">${next(node.content)}</h5>`,
    [BLOCKS.HEADING_6]: (node, next) =>
      `<h6 class="font-serif text-base font-normal mb-2 mt-4 text-[#1C1917]">${next(node.content)}</h6>`,
    [BLOCKS.UL_LIST]: (node, next) =>
      `<ul class="list-disc pl-6 mb-6 space-y-1.5">${next(node.content)}</ul>`,
    [BLOCKS.OL_LIST]: (node, next) =>
      `<ol class="list-decimal pl-6 mb-6 space-y-1.5">${next(node.content)}</ol>`,
    [BLOCKS.LIST_ITEM]: (node, next) =>
      `<li class="text-[#78716C] leading-relaxed">${next(node.content)}</li>`,
    [BLOCKS.QUOTE]: (node, next) =>
      `<blockquote class="border-l-4 border-[#3B8DD6] pl-6 py-2 my-6 italic text-[#78716C]">${next(node.content)}</blockquote>`,
    [BLOCKS.HR]: () => `<hr class="my-8 border-[#E7E5E4]" />`,
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const target = (
        node.data as {
          target?: {
            fields?: {
              title?: string;
              description?: string;
              file?: { url?: string };
            };
          };
        }
      )?.target;
      const { title, description, file } = target?.fields || {};
      const imageUrl = file?.url;
      if (!imageUrl) return "";
      const normalized = imageUrl.startsWith("//")
        ? `https:${imageUrl}`
        : imageUrl;
      // Cap in-body images via Contentful so posts don't ship multi-MB originals.
      const fullUrl = normalized.includes("images.ctfassets.net")
        ? `${normalized}${normalized.includes("?") ? "&" : "?"}fm=webp&w=1600&q=80`
        : normalized;
      return `
        <figure class="my-8">
          <img src="${fullUrl}" alt="${description || title || "Blog image"}" class="rounded-lg w-full" />
          ${description ? `<figcaption class="text-center text-sm text-[#A8A29E] mt-2">${description}</figcaption>` : ""}
        </figure>
      `;
    },
    [INLINES.HYPERLINK]: (node, next) => {
      const href = (node.data as { uri?: string }).uri ?? "";
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-[#3B8DD6] hover:text-[#2B6CB0] hover:underline">${next(node.content)}</a>`;
    },
  },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const currentYear = new Date().getFullYear();
  const options: Intl.DateTimeFormatOptions =
    date.getFullYear() === currentYear
      ? { month: "long", day: "numeric" }
      : { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function getImageUrl(url?: string, width?: number) {
  if (!url) return undefined;
  const normalized = url.startsWith("//") ? `https:${url}` : url;
  // Pre-resize Contentful assets so the Next.js image optimizer isn't handed
  // multi-MB originals (which crash it with HTTP 502).
  if (width && normalized.includes("images.ctfassets.net")) {
    const sep = normalized.includes("?") ? "&" : "?";
    return `${normalized}${sep}fm=webp&w=${width}&q=80`;
  }
  return normalized;
}

function getSlug(title: string) {
  return encodeURIComponent(title.trim().toLowerCase().replace(/\s+/g, "-"));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { post: rawPost, includes } = await getBlogPostBySlug(slug);

  if (!rawPost) {
    notFound();
  }

  const post = rawPost as unknown as BlogPost;

  // Get author from includes
  const authorId = post.fields.author?.sys?.id;
  const author =
    authorId && includes?.Entry
      ? (includes.Entry as unknown as Author[]).find(
          (entry) => entry.sys.id === authorId,
        )
      : null;

  const authorName = author?.fields?.name || "Anonymous";
  const authorTitle = author?.fields?.jobTitle || "Author";
  const authorAvatar = getImageUrl(
    author?.fields?.profilePicture?.fields?.file?.url,
    128,
  );
  const linkedInLink = author?.fields?.linkedInLink;

  const heroImageUrl = getImageUrl(
    post.fields.heroImage?.fields?.file?.url,
    1600,
  );
  const publishDate = formatDate(post.fields.publishDate || post.sys.createdAt);

  // Render rich text content
  let contentHtml = "";
  if (post.fields.content?.nodeType === "document") {
    contentHtml = documentToHtmlString(post.fields.content, richTextOptions);
  } else if (typeof post.fields.content === "string") {
    contentHtml = post.fields.content;
  }

  // Get related posts
  const allPostsResponse = await getBlogPosts({ limit: 4 });
  const relatedPosts = (allPostsResponse.items as unknown as BlogPost[])
    .filter((p) => p.sys.id !== post.sys.id)
    .slice(0, 3);

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.fields.title,
            description: post.fields.excerpt,
            image: heroImageUrl,
            datePublished: post.fields.publishDate || post.sys.createdAt,
            dateModified: post.sys.updatedAt,
            author: {
              "@type": "Person",
              name: authorName,
            },
            publisher: {
              "@type": "Organization",
              name: "Ateed Tech",
              logo: {
                "@type": "ImageObject",
                url: "https://www.ateedtech.com/logo.png",
              },
            },
          }),
        }}
      />

      {/* BreadcrumbList Schema for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.ateedtech.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: "https://www.ateedtech.com/blog",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.fields.title,
                item: `https://www.ateedtech.com/blog/${slug}`,
              },
            ],
          }),
        }}
      />

      <article className="pt-28 lg:pt-36 pb-12 lg:pb-20 bg-bg-primary">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <header className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="font-serif heading-xl font-normal text-text-primary mb-6">
              {post.fields.title}
            </h1>

            {post.fields.excerpt && (
              <p className="text-xl text-text-secondary mb-8">
                {post.fields.excerpt}
              </p>
            )}

            <time className="text-text-tertiary block mb-6">{publishDate}</time>

            {/* Author Info */}
            <div className="flex items-center justify-center gap-4">
              {authorAvatar && (
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={authorAvatar}
                    alt={authorName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="text-left">
                <div className="flex items-center gap-2">
                  {linkedInLink ? (
                    <a
                      href={linkedInLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-text-primary hover:text-accent"
                    >
                      {authorName}
                    </a>
                  ) : (
                    <span className="font-semibold text-text-primary">
                      {authorName}
                    </span>
                  )}
                  {linkedInLink && (
                    <a
                      href={linkedInLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="w-4 h-4 text-accent"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}
                </div>
                <p className="text-sm text-text-tertiary">{authorTitle}</p>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className="text-sm text-text-tertiary">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://www.ateedtech.com/blog/${slug}`)}&text=${encodeURIComponent(post.fields.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-tertiary hover:text-accent"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.ateedtech.com/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-tertiary hover:text-accent"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://www.ateedtech.com/blog/${slug}`)}&title=${encodeURIComponent(post.fields.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-tertiary hover:text-accent"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </header>

          {/* Hero Image */}
          {heroImageUrl && (
            <figure className="max-w-4xl mx-auto mb-12">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border">
                <Image
                  src={heroImageUrl}
                  alt={post.fields.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {post.fields.heroImage?.fields?.description && (
                <figcaption className="text-center text-sm text-text-tertiary mt-3">
                  {post.fields.heroImage.fields.description}
                </figcaption>
              )}
            </figure>
          )}

          {/* Content */}
          <div
            className="max-w-3xl mx-auto blog-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="max-w-6xl mx-auto mt-20 pt-12 border-t border-border">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-px w-8 bg-accent/50" />
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent">
                  More to Read
                </span>
              </div>
              <h2 className="font-serif heading-md font-normal text-text-primary mb-10">
                Latest Stories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => {
                  const relatedAuthorId = relatedPost.fields.author?.sys?.id;
                  const relatedAuthor =
                    relatedAuthorId && allPostsResponse.includes?.Entry
                      ? (
                          allPostsResponse.includes.Entry as unknown as Author[]
                        ).find((entry) => entry.sys.id === relatedAuthorId)
                      : null;
                  const relatedAuthorName =
                    relatedAuthor?.fields?.name || "Anonymous";
                  const relatedAuthorAvatar = getImageUrl(
                    relatedAuthor?.fields?.profilePicture?.fields?.file?.url,
                  );
                  const relatedImageUrl = getImageUrl(
                    relatedPost.fields.heroImage?.fields?.file?.url,
                  );
                  const relatedDate = formatDate(
                    relatedPost.fields.publishDate || relatedPost.sys.createdAt,
                  );

                  return (
                    <article
                      key={relatedPost.sys.id}
                      className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(59,141,214,0.08)",
                        boxShadow:
                          "0 4px 24px rgba(30,80,160,0.06), 0 1px 3px rgba(0,0,0,0.03)",
                      }}
                    >
                      {relatedImageUrl && (
                        <Link
                          href={`/blog/${getSlug(relatedPost.fields.title)}`}
                          className="relative h-48 block overflow-hidden"
                        >
                          <Image
                            src={relatedImageUrl}
                            alt={relatedPost.fields.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        </Link>
                      )}
                      <div className="p-6">
                        <Link
                          href={`/blog/${getSlug(relatedPost.fields.title)}`}
                        >
                          <h3 className="font-serif font-normal text-text-primary mb-2 hover:text-accent transition-colors duration-300 line-clamp-2">
                            {relatedPost.fields.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 mb-4">
                          {relatedPost.fields.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            {relatedAuthorAvatar && (
                              <div className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-accent/10">
                                <Image
                                  src={relatedAuthorAvatar}
                                  alt={relatedAuthorName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <span className="font-medium text-text-primary">
                              {relatedAuthorName}
                            </span>
                          </div>
                          <time className="text-text-tertiary">
                            {relatedDate}
                          </time>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
}
