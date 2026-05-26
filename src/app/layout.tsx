import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidgetLoader } from "@/components/ai/ChatWidgetLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Ateed Tech | Custom Software Development",
    template: "%s | Ateed Tech",
  },
  description:
    "A custom software development firm focused on web and mobile applications, enterprise systems, cloud infrastructure, and AI technologies.",
  keywords: [
    "custom software development",
    "web development",
    "mobile app development",
    "enterprise software",
    "AI development",
    "Florida software company",
  ],
  authors: [{ name: "Ateed Tech" }],
  creator: "Ateed Tech",
  metadataBase: new URL("https://www.ateedtech.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.ateedtech.com",
    siteName: "Ateed Tech",
    title: "Ateed Tech | Custom Software Development",
    description:
      "A custom software development firm focused on web and mobile applications, enterprise systems, cloud infrastructure, and AI technologies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ateed Tech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ateed Tech | Custom Software Development",
    description:
      "A custom software development firm focused on web and mobile applications, enterprise systems, cloud infrastructure, and AI technologies.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Set a `js` class before first paint so CSS can hide GSAP-animated
            elements only when JS is present — no FOUC, no flash, and content
            stays visible if JS never loads. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <link rel="preconnect" href="https://images.ctfassets.net" />
        <link rel="dns-prefetch" href="https://images.ctfassets.net" />
      </head>
      <body
        className={`${inter.variable} ${newsreader.variable} font-sans antialiased bg-bg-primary text-text-primary`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatWidgetLoader />
      </body>
    </html>
  );
}
