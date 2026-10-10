import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  metadataBase: new URL("https://xagentx.si"),
  title: {
    default: "Agent X — Hire Intelligence",
    template: "%s | Agent X",
  },
  description: "Deploy a human-led AI workforce around the mission you need accomplished.",
  applicationName: "Agent X",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Agent X — Hire Intelligence",
    description: "Deploy your AI workforce with clear roles, human approvals, mission tracking, and accountable intelligence.",
    url: "https://xagentx.si",
    siteName: "Agent X",
    type: "website",
  },
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
