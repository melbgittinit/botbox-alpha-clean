import { captureLeaderLead } from "../app/hub/leaders/actions";

export default function LeaderInterestForm({
  lane,
  title,
  organizationLabel = "Organization / family name",
  cohortPlaceholder,
}: {
  lane: "pastors-on-point" | "family-hub-love" | "mom-connected";
  title: string;
  organizationLabel?: string;
  cohortPlaceholder?: string;
}) {
  return (
    <section className="leader-interest-card">
      <div>
        <div className="hub-eyebrow">START THE CONVERSATION</div>
        <h2>{title}</h2>
        <p>Tell us where this would help. We’ll use this to shape the right HUB setup and hardware path.</p>
      </div>
      <form action={captureLeaderLead} className="leader-interest-form">
        <input type="hidden" name="lane" value={lane} />
        <input name="name" placeholder="Your name" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="organization" placeholder={organizationLabel} />
        <input name="role" placeholder="Your role / relationship" />
        <input name="cohort" placeholder={cohortPlaceholder || "Group or community you serve"} />
        <select name="hardwareInterest" defaultValue="">
          <option value="">Hardware interest (optional)</option>
          <option value="own-device">Use my own device</option>
          <option value="tabletop">Tabletop HUB</option>
          <option value="room">Room HUB</option>
          <option value="command-center">Command Center</option>
          <option value="not-sure">Not sure yet</option>
        </select>
        <label className="leader-consent">
          <input type="checkbox" name="consent" value="yes" required />
          <span>I want HUB to contact me about this lane and related setup options.</span>
        </label>
        <button className="hub-button hub-button-primary" type="submit">SEND MY INTEREST</button>
      </form>
    </section>
  );
}
