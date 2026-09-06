import Link from "next/link";
import styles from "../app/factory-nav.module.css";

const links = [
  ["/", "BOT CORE"],
  ["/gift", "GIFT A BOT"],
  ["/crew", "MY BOT CREW"],
  ["/earn", "BOT EARN MODE"],
  ["/service", "SERVICE"],
  ["/executive", "EXECUTIVE SUITE"],
  ["/robots", "REAL ROBOTS"],
] as const;

export default function FactoryNav(){
  return <nav className={styles.nav} aria-label="BOT Factory">
    <div className={styles.inner}>
      <Link href="/" className={styles.brand}>THE BOT FACTORY</Link>
      <div className={styles.links}>{links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</div>
    </div>
  </nav>;
}
