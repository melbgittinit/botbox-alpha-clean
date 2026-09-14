import "./creator-college.css";
import CreatorCollegeClient from "./CreatorCollegeClient";

export const metadata = {
  title: "Creator College | The HUB",
  description: "Turn your ideas, skills, knowledge, and experiences into something real.",
};

export default function CreatorCollegePage() {
  return (
    <>
      <section
        aria-label="Creator College platform identity"
        style={{
          background: "#050505",
          color: "#fff",
          borderBottom: "1px solid rgba(216,177,90,.28)",
          padding: "12px 22px",
          display: "flex",
          gap: "14px",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <a
          href="/hub"
          style={{
            color: "#d8b15a",
            textDecoration: "none",
            fontWeight: 800,
            letterSpacing: ".08em",
            fontSize: "12px",
          }}
        >
          ← THE HUB
        </a>
        <div style={{ textAlign: "center", flex: "1 1 320px" }}>
          <strong style={{ letterSpacing: ".08em" }}>CREATOR COLLEGE</strong>
          <span style={{ opacity: .62, margin: "0 9px" }}>•</span>
          <span style={{ opacity: .78, fontSize: "13px" }}>AI Assisted — Powered by The HUB</span>
        </div>
        <a
          href="/creator-college/desk"
          style={{
            color: "#fff",
            textDecoration: "none",
            border: "1px solid rgba(255,255,255,.18)",
            borderRadius: "999px",
            padding: "7px 12px",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          MY CREATOR DESK
        </a>
      </section>
      <CreatorCollegeClient />
    </>
  );
}
