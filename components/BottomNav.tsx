export default function BottomNav({
  familyId = "banks-family",
}: {
  familyId?: string;
}) {
  return (
    <nav className="nav">
      <div className="navin">
        <a href={`/family/${familyId}`}>HOME</a>

        <a href={`/family/${familyId}/people`}>
          PEOPLE
        </a>

        <a href={`/family/${familyId}/add`}>
          <span className="add">+</span>
          ADD
        </a>

        <a href={`/family/${familyId}/ask`}>
          ASK
        </a>

        <a href={`/family/${familyId}/inbox`}>
          FAMILY
        </a>
      </div>
    </nav>
  );
}
