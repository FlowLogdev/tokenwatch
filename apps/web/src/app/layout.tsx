import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokenWatch — AI Spend Observability",
  description: "Know before the invoice arrives. Track what your engineering team spends on AI tools — per engineer, per team, per project.",
  openGraph: {
    title: "TokenWatch",
    description: "AI spend observability for engineering teams",
    url: "https://tokenwatch.flowlog.dev",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
