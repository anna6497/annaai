import type {
  Metadata,
} from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import InstallAnnaAI from "@/components/pwa/InstallAnnaAI";
import PwaBottomNav from "@/components/pwa/PwaBottomNav";

import "./globals.css";


const geistSans =
  Geist({
    variable:
      "--font-geist-sans",

    subsets: [
      "latin",
    ],
  });


const geistMono =
  Geist_Mono({
    variable:
      "--font-geist-mono",

    subsets: [
      "latin",
    ],
  });


export const metadata:
  Metadata = {
  title:
    "Anna AI",

  description:
    "Speak Chinese with your AI Best Friend",

  applicationName:
    "Anna AI",

  appleWebApp: {
    capable:
      true,

    title:
      "Anna AI",

    statusBarStyle:
      "black-translucent",
  },

  icons: {
    icon:
      "/pwa/anna-ai-icon.png",

    apple:
      "/pwa/anna-ai-icon.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="
          min-h-full
          flex
          flex-col
          bg-[#09030f]
        "
      >
        {children}

        <PwaBottomNav />

        <InstallAnnaAI />
      </body>
    </html>
  );
}