import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio Product Framework",
  description:
    "Composable, AI-native product framework for SaaS and credit-metered agents — Convex, Clerk, billing, Effect, and agent OS.",
  keywords: [
    "Studio Product Framework",
    "Convex",
    "Clerk",
    "Next.js",
    "AI agents",
    "SaaS",
  ],
  authors: [{ name: "Studio Product Framework" }],
  openGraph: {
    type: "website",
    title: "Studio Product Framework",
    description:
      "Composable, AI-native product framework for SaaS and credit-metered agents.",
    url: "https://github.com/The-Utopia-Studio/studio-product-framework",
    siteName: "Studio Product Framework",
    images: [{ url: "/favicon.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio Product Framework",
    description:
      "Composable, AI-native product framework for SaaS and credit-metered agents.",
    images: ["/favicon.png"],
  },
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.convex.dev" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        />
      </head>
      <body>
        <ClerkProvider
          signUpFallbackRedirectUrl="/"
          signInFallbackRedirectUrl="/"
        >
          <Providers>
            <Analytics />
            {children}
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
