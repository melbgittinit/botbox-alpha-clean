"use client";

import { usePathname } from "next/navigation";
import styles from "./showroom-hero.module.css";

const HERO_URL = "https://cdn.shopify.com/s/files/1/1982/3607/files/bot-factory-glass-delivery-tower-hero.webp?v=1788752448";

export default function ShowroomHero() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <section className={styles.shell} aria-label="The Bot Factory showroom">
      <figure className={styles.frame}>
        <img
          className={styles.image}
          src={HERO_URL}
          width={1672}
          height={941}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          alt="The Bot Factory glass delivery-tower showroom with finished bot displays"
        />
        <figcaption className={styles.caption}>
          <div>
            <span>THE BOT FACTORY SHOWROOM</span>
            <strong>Build one. Pick one. Put it to work.</strong>
          </div>
          <p>Showroom concept image. The interactive Prebuilt Lot below is the authoritative current bot catalog and naming source.</p>
        </figcaption>
      </figure>
    </section>
  );
}
