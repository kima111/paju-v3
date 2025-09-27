import type { Metadata } from "next";
import { Libre_Baskerville, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paju - Innovative Korean Cuisine in Seattle",
  description: "Experience exceptional Korean cuisine at Paju, Seattle's celebrated dining destination featuring innovative dishes, locally-sourced ingredients, and warm hospitality.",
  keywords: "Korean restaurant, Seattle dining, Korean cuisine, Paju restaurant, innovative Korean food, Pacific Northwest dining",
  authors: [{ name: "Paju Restaurant" }],
  creator: "Paju Restaurant Seattle",
  publisher: "Paju Restaurant",
  openGraph: {
    title: "Paju - Innovative Korean Cuisine in Seattle",
    description: "Experience exceptional Korean cuisine at Paju, Seattle's celebrated dining destination featuring innovative dishes, locally-sourced ingredients, and warm hospitality.",
    url: "https://pajurestaurant.com",
    siteName: "Paju Restaurant",
    images: [
      {
        url: "/images/restaurant.jpg",
        width: 1200,
        height: 630,
        alt: "Paju Restaurant Interior",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paju - Innovative Korean Cuisine in Seattle",
    description: "Experience exceptional Korean cuisine at Paju, Seattle's celebrated dining destination.",
    images: ["/images/PajuOutdoor.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${libreBaskerville.variable} ${inter.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
