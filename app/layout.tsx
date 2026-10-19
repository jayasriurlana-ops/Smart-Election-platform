import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicVote | Smart Election Platform",
  description: "A demo online election management and voting prototype for organizations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
