import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

// Inter substitutes for Nng (DESIGN.md typography substitutes); ss01/tnum are
// enabled globally in globals.css. Bound to --font-nng so the theme can map it.
const inter = Inter({
  variable: "--font-nng",
  subsets: ["latin"],
  display: "swap",
});

// JetBrains Mono substitutes for Apercu pro mono (monospaced accent).
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-apercu-pro-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Intro to Cloud",
  description:
    "Learn basic cloud concepts and view each one through the lens of AWS or Azure. Free, open-source, no login.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
