export function buildReviewAlert(queueItem) {
  return {
    subject: `BRIDGE-1 ${queueItem.priority === "high" ? "high-priority " : ""}opportunity: ${queueItem.organization || "Organization pending"}`,
    text: [
      "A BRIDGE-1 opportunity is ready for authorized human review.",
      `Organization: ${queueItem.organization || "Not provided"}`,
      `Recommended agent: ${queueItem.recommended_agent || "Not finalized"}`,
      `Commercial class: ${queueItem.investment_class || "Not finalized"}`,
      `Priority: ${queueItem.priority || "normal"}`,
      `Handoff ID: ${queueItem.handoff_id}`,
      "Open the protected BRIDGE-1 review dashboard for the brief and permitted contact details."
    ].join("\n")
  };
}

export async function sendReviewAlert(queueItem) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.REVIEW_EMAIL;
  const from = process.env.ALERT_FROM_EMAIL;
  if (!apiKey || !to || !from) return { status:"not_configured" };
  const alert = buildReviewAlert(queueItem);
  const response = await fetch("https://api.resend.com/emails", {
    method:"POST",
    headers:{ "Authorization":`Bearer ${apiKey}`, "Content-Type":"application/json" },
    body:JSON.stringify({ from, to:[to], subject:alert.subject, text:alert.text })
  });
  return response.ok ? { status:"sent" } : { status:"failed", code:response.status };
}
