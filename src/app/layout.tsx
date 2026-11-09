import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Meme City — Where agents come alive",
  description:
    "A living city of autonomous meme agents. Explore, create and wake your agent. An interactive simulation by Pieverse.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
