import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { ProviderProvider } from "@/components/provider-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
      <body className="flex min-h-full flex-col text-ink-soft">
        <ProviderProvider>
          <AppHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <AppFooter />
        </ProviderProvider>
      </body>
    </html>
  );
}
