type HubContextVisualProps = {
  mode: string;
  workspaceName: string;
  eventTitle?: string | null;
  eventMeta?: string | null;
  imageUrl?: string | null;
  compact?: boolean;
};

type VisualFamily = "family" | "creator" | "gathering" | "teaching" | "group";

function visualFamily(mode: string): VisualFamily {
  if (mode === "CREATOR" || mode === "BUSINESS") return "creator";
  if (mode === "CHURCH" || mode === "EVENT") return "gathering";
  if (mode === "COACH" || mode === "TEACHER") return "teaching";
  if (mode === "FAMILY") return "family";
  return "group";
}

function modeLabel(mode: string) {
  if (mode === "CREATOR" || mode === "BUSINESS") return "CREATOR / BUSINESS";
  if (mode === "CHURCH" || mode === "EVENT") return "CHURCH / EVENT";
  if (mode === "COACH" || mode === "TEACHER") return "COACH / TEACHER";
  return mode;
}

const VISUAL_META: Record<VisualFamily, readonly [string, string]> = {
  family: ["⌂", "HOME / PEOPLE"],
  creator: ["✦", "STUDIO / AUDIENCE"],
  gathering: ["◇", "STAGE / GATHERING"],
  teaching: ["◎", "FIELD / CLASSROOM"],
  group: ["◫", "GROUP / TEAM"],
};

export default function HubContextVisual({
  mode,
  workspaceName,
  eventTitle,
  eventMeta,
  imageUrl,
  compact = false,
}: HubContextVisualProps) {
  const family = visualFamily(mode);
  const [icon, motif] = VISUAL_META[family];

  return (
    <section className={`hub-context-card hub-context-${family}${compact ? " is-compact" : ""}`}>
      <div className="hub-context-copy">
        <div className="hub-you-are-here">YOU ARE HERE</div>
        <div className="hub-system-name">THE HUB</div>
        <div className="hub-context-mode">{modeLabel(mode)}</div>
        <h1>{workspaceName}</h1>

        {eventTitle ? (
          <div className="hub-current-event">
            <span>CURRENT EVENT</span>
            <strong>{eventTitle}</strong>
            {eventMeta ? <small>{eventMeta}</small> : null}
          </div>
        ) : (
          <div className="hub-current-event is-empty">
            <span>CURRENT EVENT</span>
            <strong>No event selected yet</strong>
          </div>
        )}
      </div>

      <div
        className={`hub-context-visual hub-context-visual-${family}${imageUrl ? " has-image" : ""}`}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        aria-hidden="true"
      >
        <div className="hub-visual-glow" />
        <div className="hub-visual-frame" />
        <div className="hub-visual-line hub-visual-line-one" />
        <div className="hub-visual-line hub-visual-line-two" />
        <div className="hub-visual-core">
          <span>{icon}</span>
        </div>
        <div className="hub-visual-caption">{motif}</div>
      </div>
    </section>
  );
}
