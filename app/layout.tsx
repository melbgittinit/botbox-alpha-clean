import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "BOTBOX Family Edition",
  description: "Preserve it. Connect it. Complete it. Pass it down.",
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
