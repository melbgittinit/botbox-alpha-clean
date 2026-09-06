import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "THE BOT FACTORY",
  description: "Build one. Pick one. Put it to work.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
