"use client";

import { FormEvent, useState } from "react";

type FormState = {
  name: string;
  email: string;
  organization: string;
  role: string;
  organizationType: string;
  participantCount: string;
  goals: string;
  website: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  organization: "",
  role: "",
  organizationType: "",
  participantCount: "",
  goals: "",
  website: "",
};

export default function InstitutionalPilotForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function patch(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/creator-college/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "We could not save your request.");
      setState("success");
      setMessage("Your pilot request is in. The HUB now has the information needed to review fit and next steps.");
      setForm(initialState);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "We could not save your request. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div style={{ padding: 28, borderRadius: 24, background: "#eefaf3", border: "1px solid #bfe7cf" }}>
        <span className="cc-eyebrow" style={{ color: "#198754" }}>PILOT REQUEST RECEIVED</span>
        <h3 style={{ fontSize: 28, margin: "10px 0" }}>Thank you. Your organization is now in the Creator College pilot pipeline.</h3>
        <p style={{ color: "var(--cc-muted)", lineHeight: 1.65 }}>{message}</p>
        <div className="cc-actions" style={{ justifyContent: "flex-start" }}>
          <button className="primary" type="button" onClick={() => setState("idle")}>SUBMIT ANOTHER REQUEST</button>
          <a className="secondary" href="/creator-college">EXPLORE CREATOR COLLEGE</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        <label style={{ display: "grid", gap: 7 }}>
          <strong>Your name *</strong>
          <input required value={form.name} onChange={(e) => patch("name", e.target.value)} maxLength={120} placeholder="Name" />
        </label>
        <label style={{ display: "grid", gap: 7 }}>
          <strong>Email *</strong>
          <input required type="email" value={form.email} onChange={(e) => patch("email", e.target.value)} maxLength={180} placeholder="you@organization.org" />
        </label>
        <label style={{ display: "grid", gap: 7 }}>
          <strong>Organization *</strong>
          <input required value={form.organization} onChange={(e) => patch("organization", e.target.value)} maxLength={180} placeholder="Organization name" />
        </label>
        <label style={{ display: "grid", gap: 7 }}>
          <strong>Your role</strong>
          <input value={form.role} onChange={(e) => patch("role", e.target.value)} maxLength={120} placeholder="Principal, pastor, director, owner…" />
        </label>
        <label style={{ display: "grid", gap: 7 }}>
          <strong>Organization type *</strong>
          <select required value={form.organizationType} onChange={(e) => patch("organizationType", e.target.value)}>
            <option value="">Choose one</option>
            <option>School</option>
            <option>Church</option>
            <option>Business</option>
            <option>Community / Nonprofit</option>
            <option>Workforce Program</option>
            <option>Other</option>
          </select>
        </label>
        <label style={{ display: "grid", gap: 7 }}>
          <strong>Approximate participants</strong>
          <select value={form.participantCount} onChange={(e) => patch("participantCount", e.target.value)}>
            <option value="">Not sure yet</option>
            <option>1–25</option>
            <option>26–50</option>
            <option>51–100</option>
            <option>101–250</option>
            <option>251–500</option>
            <option>500+</option>
          </select>
        </label>
      </div>

      <label style={{ display: "grid", gap: 7 }}>
        <strong>What would you like your people to create or accomplish? *</strong>
        <textarea required value={form.goals} onChange={(e) => patch("goals", e.target.value)} maxLength={1500} rows={6} placeholder="Tell us what success would look like, what participants should create, or what problem you want Creator College to help solve." />
      </label>

      <label aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        Website
        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => patch("website", e.target.value)} />
      </label>

      {message && state === "error" ? <p role="alert" style={{ color: "#b42318", margin: 0 }}>{message}</p> : null}

      <div className="cc-actions" style={{ justifyContent: "flex-start", marginTop: 4 }}>
        <button className="primary" type="submit" disabled={state === "sending"}>{state === "sending" ? "SENDING…" : "REQUEST A CREATOR COLLEGE PILOT"}</button>
      </div>
      <small style={{ color: "var(--cc-muted)", lineHeight: 1.5 }}>
        This request is used to evaluate pilot fit and follow up about Creator College. Submitting it does not create a contract or payment obligation.
      </small>
    </form>
  );
}
