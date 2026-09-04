import type { ReactNode } from "react";
import "./hub.css";

export default function HubLayout({ children }: { children: ReactNode }) {
  return <div className="hub-scope">{children}</div>;
}
