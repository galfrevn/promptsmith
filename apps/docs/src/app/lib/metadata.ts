import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const siteConfig = {
  name: "Promptsmith",
  slogan: "Craft smarter prompts. Build better AI.",
  description:
    "Promptsmith is a minimal, powerful workspace for designing, refining, and managing AI prompts. Built for developers, writers, and creative teams who want clarity and control.",
  url: siteUrl,
  ogImage: "/promptsmith-ogImage.webp",
  creator: "Galfré Valentin",
  keywords: [
    "AI prompts",
    "AI SDK",
    "prompt engineering",
    "AI tools",
    "Next.js",
    "Promptsmith",
    "OpenAI",
    "AI workspace",
    "prompt management",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.slogan}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,

  openGraph: {
    type: "website",
    locale: "en_US",
    title: `${siteConfig.name} — ${siteConfig.slogan}`,
    url: siteConfig.url,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.slogan}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.slogan}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@promptsmith", // o tu handle de Twitter/X
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/promptsmith-icon.svg",
  },
};
