import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Generative UI — a page that builds itself",
  description:
    "This page has no interface. It generates one as we talk: chat, and the answers arrive as interfaces composed on the spot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // The inline script sets data-theme before hydration — expected mismatch.
      suppressHydrationWarning
    >
      <head>
        {/* Apply the stored theme before first paint — no flash of the wrong
            skin. Neu (light neumorphism) is the default. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('genui-theme');document.documentElement.dataset.theme=t==='glass'?'glass':'neu'}catch(e){document.documentElement.dataset.theme='neu'}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
