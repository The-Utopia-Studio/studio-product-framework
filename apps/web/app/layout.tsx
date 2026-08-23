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
    siteName: "Studio Product Framework",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio Product Framework",
    description:
      "Composable, AI-native product framework for SaaS and credit-metered agents.",
  },
  // Favicon and social preview image are generated (see app/icon.tsx,
  // app/opengraph-image.tsx) from the actual applied brand color and
  // PRODUCT_NAME — not hardcoded here — so every venture gets its own
  // instead of the template's own placeholder art.
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
