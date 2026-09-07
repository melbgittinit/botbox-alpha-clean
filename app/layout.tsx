import "./globals.css";
import type { ReactNode } from "react";
import FactoryNav from "../components/FactoryNav";
import FacePass from "../components/FacePass";

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
        <FactoryNav />
        <FacePass />
        {children}
      </body>
    </html>
  );
}
