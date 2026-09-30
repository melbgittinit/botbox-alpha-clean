const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
const briefByLens = {
  innovation: {
    name:"Executive Decision-Leverage Agent",
    need:"Repeated high-value decisions are slowed by fragmented knowledge and inconsistent evaluation.",
    job:"Gather context, compare three opportunities by value, feasibility and authority risk, then recommend a pilot candidate.",
    pilot:"One executive team, one decision class and a limited knowledge set over a defined evaluation period.",
    measures:"Decision time, opportunity quality, adoption and the percentage of recommendations accepted for human review.",
    authority:"The agent may recommend and brief. Humans retain final scope, financial, contractual and deployment authority."
  },
  governance: {
    name:"Governed Agent Authority Pilot",
    need:"The organization needs useful agent behavior without creating unclear or uncontrolled decision authority.",
    job:"Declare identity, permitted resources, approval levels and stop conditions while producing an auditable recommendation path.",
    pilot:"One bounded workflow with named owners, explicit escalation rules and a documented revoke-and-stop procedure.",
    measures:"Correct escalations, boundary compliance, reviewer confidence, exception rate and time to human resolution.",
    authority:"The agent may act only inside the approved workflow. A human owns exceptions, commitments and material decisions."
  },
  revenue: {
    name:"Revenue-Moment Agent",
    need:"A valuable customer moment is being lost between discovery, qualification, conversion, retention or expansion.",
    job:"Serve one named revenue moment with relevant knowledge, guided questions and a qualified human handoff.",
    pilot:"One customer segment, one channel and one measurable conversion or retention event with a controlled comparison group.",
    measures:"Qualified progression, conversion lift, response time, handoff quality and customer opt-out rate.",
    authority:"The agent may educate and qualify. Pricing exceptions, guarantees, purchases and final commitments require human approval."
  },
  access: {
    name:"Focused Growth-Stage Pilot",
    need:"A smaller organization needs a credible first agent without the scope or risk of an institutional program.",
    job:"Improve one high-value repeated workflow using a narrow knowledge set and a clear path to a human owner.",
    pilot:"One use case, one accountable owner, a short evaluation window and a defined ceiling on access and authority.",
    measures:"Hours saved, qualified outcomes, user satisfaction, exception rate and readiness for the next phase.",
    authority:"Smaller scope does not reduce governance: identity, permission, consent, review and stop controls remain explicit."
  }
};

function updateBrief(lens) {
  const brief = briefByLens[lens] || briefByLens.innovation;
  document.querySelector("#briefName").textContent = brief.name;
  document.querySelector("#briefNeed").textContent = brief.need;
  document.querySelector("#briefJob").textContent = brief.job;
  document.querySelector("#briefPilot").textContent = brief.pilot;
  document.querySelector("#briefMeasures").textContent = brief.measures;
  document.querySelector("#briefAuthority").textContent = brief.authority;
}

function activateTab(tab, moveFocus = true) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  panels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute("aria-controls"); });
  updateBrief(tab.dataset.lens);
  if (moveFocus) tab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab, false));
  tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    activateTab(tabs[next]);
  });
});

document.querySelectorAll("[data-copy-target]").forEach(button => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    const status = button.closest("section")?.querySelector(".copy-status");
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      if (status) status.textContent = "Copied to clipboard.";
      const original = button.textContent;
      button.textContent = "Copied";
      window.setTimeout(() => { button.textContent = original; }, 1800);
    } catch {
      if (status) status.textContent = "Copy was unavailable. Select the text manually.";
    }
  });
});

document.querySelector("[data-print]")?.addEventListener("click", () => window.print());

const mediaRequestForm = document.querySelector("#mediaRequestForm");
mediaRequestForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const status = document.querySelector("#mediaRequestStatus");
  const submit = mediaRequestForm.querySelector('[type="submit"]');
  const form = new FormData(mediaRequestForm);
  const payload = Object.fromEntries(form.entries());
  payload.contact_consent = form.get("contact_consent") === "on";
  submit.disabled = true;
  status.textContent = "Submitting for human review…";
  try {
    const response = await fetch("/api/media-access", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The request could not be submitted.");
    mediaRequestForm.reset();
    status.textContent = result.request_id
      ? `Request received for human review. Reference: ${result.request_id}`
      : "Request received for human review.";
  } catch (error) {
    status.textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});
