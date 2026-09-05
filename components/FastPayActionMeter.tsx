"use client";

import { useMemo, useState } from "react";

export type FastPayMeterQuote = {
  actionKey: string;
  actionLabel: string;
  cost: number;
  unlimited: boolean;
  remaining: number | null;
  remainingAfter: number | null;
  canProceed: boolean;
  scarcity: "healthy" | "low" | "critical" | "empty";
};

export type FastPayOfferChoice = {
  key: string;
  label: string;
  priceLabel: string;
  detail?: string;
  style: "BUY" | "PACK" | "UPGRADE";
};

type Props = {
  quote: FastPayMeterQuote;
  actionVerb?: string;
  expirationLabel?: string;
  offers?: FastPayOfferChoice[];
  busy?: boolean;
  onUseAction: () => Promise<void> | void;
  onChooseOffer?: (offer: FastPayOfferChoice) => Promise<void> | void;
};

export default function FastPayActionMeter({
  quote,
  actionVerb = "Use action",
  expirationLabel,
  offers = [],
  busy = false,
  onUseAction,
  onChooseOffer,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  const summary = useMemo(() => {
    if (quote.unlimited) return `This action is included. Your access is unlimited.`;
    if (quote.remaining === null) return "Your remaining actions are being checked.";
    if (!quote.canProceed) return `You have ${quote.remaining} ${quote.actionLabel} remaining.`;
    return `This uses ${quote.cost}. You have ${quote.remaining} now and ${quote.remainingAfter} remaining after this.`;
  }, [quote]);

  const urgency = quote.scarcity === "critical" || quote.scarcity === "empty";

  return (
    <section aria-label="Action value" style={{ maxWidth: 520, border: "1px solid currentColor", borderRadius: 22, padding: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", opacity: .72 }}>
            Before you continue
          </div>
          <h2 style={{ margin: "8px 0 6px", fontSize: 25 }}>Know what this action uses.</h2>
        </div>
        <div style={{ textAlign: "right", minWidth: 92 }} aria-live="polite">
          <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
            {quote.unlimited ? "∞" : quote.remaining ?? "—"}
          </div>
          <div style={{ fontSize: 12, opacity: .72 }}>remaining</div>
        </div>
      </div>

      <p style={{ fontSize: 16, lineHeight: 1.5, margin: "16px 0 8px", fontWeight: urgency ? 700 : 500 }}>{summary}</p>
      {expirationLabel ? <p style={{ margin: "0 0 18px", fontSize: 13, opacity: .75 }}>{expirationLabel}</p> : null}

      {quote.canProceed ? (
        <div style={{ display: "grid", gridTemplateColumns: confirming ? "1fr 1fr" : "1fr", gap: 10 }}>
          {!confirming ? (
            <button type="button" disabled={busy} onClick={() => setConfirming(true)} style={buttonStyle(true)}>
              {actionVerb}
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  await onUseAction();
                  setConfirming(false);
                }}
                style={buttonStyle(true)}
              >
                {busy ? "Working…" : `Yes — use ${quote.cost}`}
              </button>
              <button type="button" disabled={busy} onClick={() => setConfirming(false)} style={buttonStyle(false)}>
                Keep working
              </button>
            </>
          )}
        </div>
      ) : null}

      {offers.length > 0 ? (
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid currentColor" }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
            {quote.canProceed ? "Want more room?" : "Choose what works best:"}
          </div>
          <div style={{ display: "grid", gap: 9 }}>
            {offers.map((offer) => (
              <button
                key={offer.key}
                type="button"
                disabled={busy || !onChooseOffer}
                onClick={() => onChooseOffer?.(offer)}
                style={{ ...buttonStyle(false), display: "flex", justifyContent: "space-between", textAlign: "left" }}
              >
                <span>
                  <strong>{offer.label}</strong>
                  {offer.detail ? <span style={{ display: "block", fontSize: 12, opacity: .7 }}>{offer.detail}</span> : null}
                </span>
                <strong>{offer.priceLabel}</strong>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p style={{ margin: "16px 0 0", fontSize: 12, lineHeight: 1.45, opacity: .7 }}>
        We show what an action uses before it happens and what remains afterward. No hidden deductions.
      </p>
    </section>
  );
}

function buttonStyle(primary: boolean): React.CSSProperties {
  return {
    appearance: "none",
    border: "1px solid currentColor",
    borderRadius: 14,
    padding: "13px 15px",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    background: primary ? "currentColor" : "transparent",
    color: primary ? "Canvas" : "inherit",
  };
}
