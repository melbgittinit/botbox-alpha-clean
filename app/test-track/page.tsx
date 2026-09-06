"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../bot-factory.module.css";

const botOptions = [
  ["mebot", "MeBOT"],
  ["fam", "FAM BOT"],
  ["coffee", "Coffee Bot / QWAZY"],
  ["wbells", "W. Bells"],
  ["mtc", "MY MTC"],
  ["pop", "POP — Predictor On Purpose"],
  ["zipper", "Zipper / Lead Zeppelin"],
  ["impostr", "imPOSTR"],
  ["tvme", "TVME / Get ME on TV"],
  ["slide", "SLIDE HustL"],
  ["tracking", "Tracking Bot"],
  ["elevate", "Elevate Bot"],
  ["beauty", "Beauty BOT"],
  ["register", "Register ME BOT"],
  ["creator", "Creator Closer Bot"],
  ["fundus", "Fund Us Bot"],
  ["freemoney", "Free Money Bot"],
  ["ufo", "UFO BOT"],
] as const;

export default function TestTrackPage() {
  const [botId, setBotId] = useState("mebot");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function runTest() {
    setLoading(true);
    setResult("");
    setNotice("");
    try {
      const response = await fetch("/api/try", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Test failed");
      setResult(data.result || "No result returned.");
      setNotice(data.notice || "");
    } catch (error) {
      setResult(error instanceof Error ? error.message : "The test could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.stage}>UNPUBLISHED ALPHA — CONTROLLED TEST TRACK • server-backed, no external AI model or checkout.</div>
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <div className={styles.eyebrow}>BOT CORE — TEST TRACK</div>
          <h1>Prove the promise before the purchase.</h1>
          <p>This internal alpha track moves TRY IT across a real server boundary while keeping the output contained, explainable and non-persistent.</p>
          <div className={styles.actions}><Link className={`${styles.btn} ${styles.light}`} href="/">RETURN TO BOT CORE</Link></div>
        </header>

        <section className={styles.work}>
          <div className={styles.note}><b>CONTROLLED ALPHA:</b> prompts are limited in length, bot IDs are allow-listed, responses are not cached, and this route does not write prompts to the database. It is intentionally not yet an open-ended AI chat.</div>
          <div className={styles.form}>
            <div className={styles.q}>
              <label htmlFor="bot-select">Choose a bot to test</label>
              <select id="bot-select" className={styles.demoInput} value={botId} onChange={(event)=>setBotId(event.target.value)}>
                {botOptions.map(([id,name])=><option key={id} value={id}>{name}</option>)}
              </select>
            </div>
            <div className={styles.q}>
              <label htmlFor="test-prompt">Give it one real situation</label>
              <textarea id="test-prompt" rows={5} maxLength={800} value={prompt} onChange={(event)=>setPrompt(event.target.value)} placeholder="Example: I own a salon and have three empty appointment slots this Thursday." />
            </div>
            <button className={`${styles.btn} ${styles.primary}`} disabled={loading} onClick={runTest}>{loading ? "RUNNING TEST…" : "RUN CONTROLLED TEST"}</button>
            {result && <div className={styles.result}>{result}</div>}
            {notice && <p className={styles.privacy}>{notice}</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
