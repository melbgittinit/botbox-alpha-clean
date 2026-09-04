const items = [
  ["Home", "home", "⌂"],
  ["People", "people", "◎"],
  ["Schedule", "schedule", "◷"],
  ["Play", "play", "▶"],
  ["Results", "results", "↗"],
  ["More", "more", "•••"],
] as const;

export default function HubNav({
  workspaceId,
  active = "home",
}: {
  workspaceId: string;
  active?: string;
}) {
  return (
    <nav className="hub-nav" aria-label="HUB navigation">
      <div className="hub-nav-inner">
        {items.map(([label, key, icon]) => {
          const href = key === "home" ? `/hub/${workspaceId}` : `/hub/${workspaceId}/${key}`;
          return (
            <a
              key={key}
              href={href}
              className={`hub-nav-item${active === key ? " is-active" : ""}`}
            >
              <span className="hub-nav-icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
