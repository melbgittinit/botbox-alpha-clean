import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pretty Girl Palace | HUB",
  description: "There’s a room for you here. Confidence, connection, commerce and opportunity inside the HUB.",
};

export default function PgpLayout({ children }: { children: ReactNode }) {
  return children;
}
