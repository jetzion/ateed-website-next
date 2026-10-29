import { Metadata } from "next";
import { getHeroSection, getBlogPosts } from "@/lib/contentful";
import { PageHero } from "@/components/sections/PageHero";
import { FeaturedPost } from "@/components/sections/FeaturedPost";
import { BlogCard } from "@/components/sections/BlogCard";
import { BlogGrid } from "@/components/sections/BlogGrid";
import type { Author, BlogPost, ContentfulEntry } from "@/types/contentful";

interface BlogHeroFields {
  heading?: string;
  description?: string;
  heroImage?: { fields?: { file?: { url?: string } } };
}

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read the latest insights, tutorials, and updates from Ateed Tech on software development, technology trends, and digital innovation.",
  alternates: { canonical: "/blog" },
};

export const dynamic = "force-static";
export const revalidate = 3600;

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const currentYear = new Date().getFullYear();
  const options: Intl.DateTimeFormatOptions =
    date.getFullYear() === currentYear
      ? { month: "long", day: "numeric" }
      : { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function getSlug(title: string) {
  return encodeURIComponent(title.trim().toLowerCase().replace(/\s+/g, "-"));
}

function getImageUrl(url?: string, width?: number) {
  if (!url) return undefined;
  const normalized = url.startsWith("//") ? `https:${url}` : url;
  // Pre-resize Contentful assets via their Image API. Originals can be huge
  // (e.g. 5000px / 5MB) and crash the Next.js image optimizer (HTTP 502);
  // a CDN-resized webp keeps the source small so optimization succeeds.
  if (width && normalized.includes("images.ctfassets.net")) {
    const sep = normalized.includes("?") ? "&" : "?";
    return `${normalized}${sep}fm=webp&w=${width}&q=80`;
  }
  return normalized;
}

export default async function BlogPage() {
  const [heroData, blogResponse] = await Promise.all([
    getHeroSection("Blog"),
    getBlogPosts(),
  ]);

  const hero = heroData[0] as unknown as
    | ContentfulEntry<BlogHeroFields>
    | undefined;
  const heroImageUrl = hero?.fields?.heroImage?.fields?.file?.url;
  const backgroundImage = heroImageUrl
    ? getImageUrl(heroImageUrl, 2000)
    : undefined;

  const posts = blogResponse.items as unknown as BlogPost[];
  const includes = blogResponse.includes;

  // Find featured post
  const featuredPost = posts.find((post) => post.fields.featured);
  const regularPosts = posts;

  // Helper to get author from includes
  const getAuthor = (post: BlogPost): Author | null => {
    const authorId = post.fields.author?.sys?.id;
    if (!authorId || !includes?.Entry) return null;
    return (
      (includes.Entry as unknown as Author[]).find(
        (entry) => entry.sys.id === authorId,
      ) ?? null
    );
  };

  return (
    <>
      <PageHero
        heading={hero?.fields?.heading || "Blog"}
        description={
          hero?.fields?.description ||
          "Latest stories and insights from Ateed Tech"
        }
        backgroundImage={backgroundImage}
        nextSectionId="posts"
      />

      <section id="posts" className="scroll-mt-24 py-20 lg:py-28 bg-bg-primary">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                <span className="h-px w-8 bg-accent/50" />
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent">
                  Featured
                </span>
              </div>
              {(() => {
                const author = getAuthor(featuredPost);
                const authorName = author?.fields?.name || "Anonymous";
                const authorAvatar = getImageUrl(
                  author?.fields?.profilePicture?.fields?.file?.url,
                  128,
                );
                const imageUrl = getImageUrl(
                  featuredPost.fields.heroImage?.fields?.file?.url,
                  1600,
                );
                const publishDate = formatDate(
                  featuredPost.fields.publishDate || featuredPost.sys.createdAt,
                );

                return (
                  <FeaturedPost
                    title={featuredPost.fields.title}
                    excerpt={featuredPost.fields.excerpt || ""}
                    imageUrl={imageUrl}
                    slug={getSlug(featuredPost.fields.title)}
                    authorName={authorName}
                    authorAvatar={authorAvatar}
                    publishDate={publishDate}
                  />
                );
              })()}
            </div>
          )}

          {/* Latest Stories */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-accent/50" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent">
                All Posts
              </span>
            </div>
            <h2 className="font-serif heading-md font-normal text-text-primary mb-8">
              Latest Stories
            </h2>

            <BlogGrid>
              {regularPosts.map((post) => {
                const author = getAuthor(post);
                const authorName = author?.fields?.name || "Anonymous";
                const authorAvatar = getImageUrl(
                  author?.fields?.profilePicture?.fields?.file?.url,
                  128,
                );
                const imageUrl = getImageUrl(
                  post.fields.heroImage?.fields?.file?.url,
                  800,
                );
                const publishDate = formatDate(
                  post.fields.publishDate || post.sys.createdAt,
                );

                return (
                  <BlogCard
                    key={post.sys.id}
                    title={post.fields.title}
                    excerpt={post.fields.excerpt || ""}
                    imageUrl={imageUrl}
                    slug={getSlug(post.fields.title)}
                    authorName={authorName}
                    authorAvatar={authorAvatar}
                    publishDate={publishDate}
                    featured={post.fields.featured}
                  />
                );
              })}
            </BlogGrid>

            {posts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-text-tertiary text-lg">
                  No blog posts found. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
