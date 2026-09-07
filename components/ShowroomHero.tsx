"use client";

import { usePathname } from "next/navigation";
import { h00 } from "../lib/hero-chunks/h00";
import styles from "./showroom-hero.module.css";

export default function ShowroomHero() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <section className={styles.shell} aria-label="The Bot Factory showroom">
      <div className={styles.frame}>
        <img
          className={styles.image}
          src={`data:image/webp;base64,${h00}`}
          alt="The Bot Stores glass BOT FACTORY delivery-tower showroom with finished bot displays"
        />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.label}>
          <span>THE BOT FACTORY</span>
          <strong>THE SHOWROOM IS OPEN.</strong>
          <p>Build one or pick one below. The interactive catalog is the authoritative current inventory.</p>
        </div>
      </div>
    </section>
  );
}
