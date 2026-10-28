import type { Document } from "@contentful/rich-text-types";

export interface ContentfulAsset {
  sys: { id: string };
  fields: {
    title?: string;
    description?: string;
    file?: {
      url?: string;
      details?: {
        image?: { width?: number; height?: number };
      };
    };
  };
}

export interface ContentfulEntry<F = Record<string, unknown>> {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: F;
}

export interface AuthorFields {
  name?: string;
  jobTitle?: string;
  profilePicture?: ContentfulAsset;
  linkedInLink?: string;
}

export interface BlogPostFields {
  title: string;
  excerpt?: string;
  content?: Document;
  heroImage?: ContentfulAsset;
  publishDate?: string;
  author?: { sys: { id: string } };
  featured?: boolean;
}

export interface PrivacyPolicyFields {
  title?: string;
  content?: Document;
  lastUpdated?: string;
}

export interface HeroSectionFields {
  heading?: string;
  subheading?: string;
  page?: string;
  image?: ContentfulAsset;
}

export interface ServiceFields {
  title?: string;
  description?: string;
  icon?: ContentfulAsset;
  order?: number;
}

export type BlogPost = ContentfulEntry<BlogPostFields>;
export type Author = ContentfulEntry<AuthorFields>;
export type PrivacyPolicy = ContentfulEntry<PrivacyPolicyFields>;
