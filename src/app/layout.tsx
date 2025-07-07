import type { Metadata } from "next";
import { inter, amatic } from './fonts'
import "./globals.css";

export const metadata: Metadata = {
  title: "Blank Space - Turn Your Photos Into Coloring Books",
  description: "Convert your favorite photos into personalized coloring books with our AI-powered transformation tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${amatic.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
