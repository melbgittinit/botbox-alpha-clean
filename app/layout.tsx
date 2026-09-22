import "./globals.css";
import type { ReactNode } from "react";
import RevenueTracker from "../components/RevenueTracker";
import SiteChrome from "../components/SiteChrome";

export const metadata = {
  title: "THE BOT FACTORY",
  description: "Build one. Pick one. Put it to work.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RevenueTracker />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
