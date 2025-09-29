import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paju Restaurant - Fine Dining Experience",
  description: "Experience exceptional Korean-inspired cuisine in an intimate setting. Breakfast, lunch, and dinner service available.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}