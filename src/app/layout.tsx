import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipStream | Copy anywhere. Paste everywhere. Instantly.",
  description: "Secure, end-to-end encrypted cross-device clipboard sync. Seamlessly bridge your devices with instant clipboard sharing.",
  keywords: ["clipboard sync", "cross-device clipboard", "encrypted clipboard", "copy paste sync", "productivity tool"],
  openGraph: {
    title: "ClipStream | Universal Clipboard Sync",
    description: "Secure, end-to-end encrypted cross-device clipboard sync.",
    url: "https://clipstream.io",
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
    title: "ClipStream | Universal Clipboard Sync",
    description: "Secure, end-to-end encrypted cross-device clipboard sync.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-body selection:bg-accent/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
