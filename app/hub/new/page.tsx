import { WorkspaceMode } from "@prisma/client";
import { createWorkspace } from "../actions";

export const dynamic = "force-dynamic";

const MODE_OPTIONS = [
  [WorkspaceMode.FAMILY, "Family", "Home, care, schedules and family life"],
  [WorkspaceMode.CREATOR, "Creator", "Content, launches, projects and audience"],
  [WorkspaceMode.BUSINESS, "Business", "Clients, work, operations and follow-through"],
  [WorkspaceMode.CHURCH, "Church", "People, services, programs and ministry"],
  [WorkspaceMode.EVENT, "Event", "Gatherings, run-of-show and coordination"],
  [WorkspaceMode.COACH, "Coach", "Clients, sessions, groups and progress"],
  [WorkspaceMode.TEACHER, "Teacher", "Learners, lessons, groups and schedules"],
  [WorkspaceMode.GROUP, "Group", "Teams, clubs, committees and shared work"],
] as const;

export default function NewWorkspacePage() {
  return (
    <main className="hub-shell">
      <section className="hub-page-head">
        <div className="hub-eyebrow">SET UP YOUR HUB</div>
        <h1>What are you running?</h1>
        <p className="hub-copy">
          Give HUB a name and operating mode. You can start simple and build from there.
        </p>
      </section>

      <section className="hub-onboarding-card">
        <form action={createWorkspace} className="hub-form">
          <div className="hub-field">
            <label htmlFor="hub-name">What should we call your HUB?</label>
            <input id="hub-name" name="name" required autoComplete="off" placeholder="My Family HUB" />
          </div>

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="hub-field-label">What kind of HUB is this?</legend>
            <div className="hub-mode-choice-grid">
              {MODE_OPTIONS.map(([value, label, description], index) => (
                <label className="hub-mode-choice" key={value}>
                  <input
                    type="radio"
                    name="mode"
                    value={value}
                    defaultChecked={index === 0}
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="hub-field">
            <label htmlFor="hub-tagline">Optional short description / tagline</label>
            <input
              id="hub-tagline"
              name="tagline"
              autoComplete="off"
              placeholder="What is this HUB here to help you run?"
            />
          </div>

          <button className="hub-button hub-button-primary hub-button-full" type="submit">
            BUILD MY HUB
          </button>
        </form>
      </section>

      <a className="hub-button hub-button-secondary" href="/hub" style={{ marginTop: 16 }}>
        Back to THE HUB
      </a>
    </main>
  );
}
