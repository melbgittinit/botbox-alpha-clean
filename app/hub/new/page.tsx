import { WorkspaceMode } from "@prisma/client";
import { createWorkspace } from "../actions";

export const dynamic = "force-dynamic";

const MODES: WorkspaceMode[] = [
  WorkspaceMode.FAMILY,
  WorkspaceMode.CREATOR,
  WorkspaceMode.BUSINESS,
  WorkspaceMode.CHURCH,
  WorkspaceMode.EVENT,
  WorkspaceMode.COACH,
  WorkspaceMode.TEACHER,
  WorkspaceMode.GROUP,
];

const fieldStyle = {
  width: "100%",
  marginTop: 8,
  padding: "15px 16px",
  borderRadius: 14,
  border: "1px solid var(--line)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text)",
};

export default function NewWorkspacePage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="kicker">HUB / New Workspace</div>
        <h1>Create a workspace</h1>
        <p>
          Start with the operating context. People, groups, events, and the
          next action can build from here.
        </p>
      </section>

      <form action={createWorkspace} className="card">
        <label>
          <div className="kicker">Workspace name</div>
          <input
            name="name"
            required
            autoComplete="off"
            style={fieldStyle}
            placeholder="My workspace"
          />
        </label>

        <label style={{ display: "block", marginTop: 20 }}>
          <div className="kicker">Workspace mode</div>
          <select name="mode" defaultValue={WorkspaceMode.FAMILY} style={fieldStyle}>
            {MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginTop: 20 }}>
          <div className="kicker">Tagline — optional</div>
          <input
            name="tagline"
            autoComplete="off"
            style={fieldStyle}
            placeholder="What is this workspace here to do?"
          />
        </label>

        <button className="primary" type="submit" style={{ marginTop: 24 }}>
          CREATE WORKSPACE
        </button>
      </form>

      <a className="secondary" href="/hub">
        Back to HUB
      </a>
    </main>
  );
}
