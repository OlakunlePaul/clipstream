import type { Metadata } from "next";
import { IBM_Plex_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClipStream — Clipboard sync for developers",
  description: "End-to-end encrypted clipboard sync across Mac, Linux, and Android. Built for developers who don't live on one OS. Under 50ms on local network.",
  metadataBase: new URL("https://clipstream.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ClipStream — Clipboard sync for developers",
    description: "End-to-end encrypted clipboard sync across Mac, Linux, and Android. Built for developers who don't live on one OS. Under 50ms on local network.",
    url: "https://clipstream.dev",
    siteName: "ClipStream",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClipStream — Clipboard sync for developers",
    description: "End-to-end encrypted clipboard sync across Mac, Linux, and Android. Built for developers who don't live on one OS. Under 50ms on local network.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${ibmPlexMono.variable} ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col font-sans selection:bg-accent/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
