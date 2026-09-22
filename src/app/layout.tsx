import type { Metadata } from "next";
import { Fredoka, Geist, Geist_Mono, Luckiest_Guy } from "next/font/google";

import { CuisineSound } from "@/components/cuisine-sound";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Springfield Kitchen's two faces. The design system loads them from Google
// Fonts with a <link>; next/font self-hosts the same files, which drops the
// third-party request and the layout shift that comes with it.
const luckiestGuy = Luckiest_Guy({
  variable: "--font-luckiest-guy",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dueling Kebabs",
  description:
    "Tell it what is in your pantry, your fridge and your freezer. It tells you what you can cook right now.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${luckiestGuy.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Renders nothing. It listens for clicks on any cuisine link, from
            any page, so the filter chips and the globe can stay server-rendered
            links with no JavaScript of their own. */}
        <CuisineSound />
        {/* sonner ships its own Toaster but nothing rendered it, so every
            toast() in the app was a no-op until this landed. */}
        <Toaster />
      </body>
    </html>
  );
}
