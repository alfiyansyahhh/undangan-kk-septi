import type { Metadata } from "next";
import { Cinzel_Decorative, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Wedding of Meila & Arif",
  description: "Undangan Pernikahan Digital Meila & Arif",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`h-full antialiased scroll-smooth ${cinzel.variable} ${cormorant.variable}`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white selection:bg-amber-900/50 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
