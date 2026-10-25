import type { Metadata } from "next";
import { Cinzel_Decorative, Cormorant_Garamond } from "next/font/google";
import { readInvitation } from "@/lib/database";
import { coupleDisplayName, getDriveThumbnailUrl } from "@/lib/gdrive";
import "./globals.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

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

export async function generateMetadata(): Promise<Metadata> {
  const invitation = await readInvitation();
  const title = invitation.couple.title;
  const coupleName = coupleDisplayName(invitation.couple);
  const description = `Undangan pernikahan ${coupleName} — ${invitation.events.displayDate}. Buka undangan untuk melihat detail acara.`;
  const coverImage = getDriveThumbnailUrl(invitation.photos.cover, 1200);

  return {
    title,
    description,
    metadataBase: new URL(siteOrigin),
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: title,
      title,
      description,
      url: "/",
      images: [{
        url: coverImage || "/icon.png",
        alt: `Foto cover undangan pernikahan ${coupleName}`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage || "/icon.png"],
    },
  };
}

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
