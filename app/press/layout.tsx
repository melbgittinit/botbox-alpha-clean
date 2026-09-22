import type { ReactNode } from "react";

export const metadata = {
  title: "The Bot Stores • Media Floor",
  description: "Official Bot Stores press environment for Fresh Dings, Bot of the Day, Headline Bell and authorized AI media statements.",
  robots: { index: false, follow: false, nocache: true }
};

export default function PressLayout({children}:{children:ReactNode}){ return children; }
