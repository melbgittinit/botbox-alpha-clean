import Link from "next/link";
import styles from "../app/bot-factory.module.css";

type RoomCard = {
  mark: string;
  title: string;
  promise: string;
  description: string;
  status?: string;
};

export default function FactoryRoom({
  eyebrow,
  title,
  subtitle,
  cards,
  note,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: RoomCard[];
  note: string;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.stage}>
        UNPUBLISHED ALPHA — THE BOT FACTORY • this room is connected to the locked Factory architecture, but live transactions and production automations are not enabled yet.
      </div>
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div className={styles.actions}>
            <Link className={`${styles.btn} ${styles.light}`} href="/">RETURN TO BOT CORE</Link>
          </div>
        </header>

        <section className={styles.work}>
          <div className={styles.note}>{note}</div>
          <div className={styles.grid}>
            {cards.map((card) => (
              <article className={styles.card} key={card.title}>
                <div className={styles.mark}>{card.mark}</div>
                <div className={styles.meta}>{card.status || "FACTORY ROOM"}</div>
                <h3>{card.title}</h3>
                <p className={styles.promise}>{card.promise}</p>
                <p className={styles.desc}>{card.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
