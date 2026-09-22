"use client";

import { usePathname } from "next/navigation";
import FactoryNav from "./FactoryNav";
import FacePass from "./FacePass";
import ShowroomHero from "./ShowroomHero";
import IdentityBridge from "./IdentityBridge";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pressMode = pathname.startsWith("/press");

  if (pressMode) return <>{children}</>;

  return (
    <>
      <FactoryNav />
      <FacePass />
      <ShowroomHero />
      {children}
      <IdentityBridge />
    </>
  );
}
