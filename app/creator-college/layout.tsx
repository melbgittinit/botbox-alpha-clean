import "./milestone4.css";

export default function CreatorCollegeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cc4-frame">
      {children}
      <nav className="cc4-nav" aria-label="Creator College">
        <a href="/creator-college"><span>⌂</span><b>Campus</b></a>
        <a href="/creator-college/desk"><span>✦</span><b>Desk</b></a>
        <a href="/creator-college/locker"><span>▦</span><b>Locker</b></a>
        <a href="/creator-college/profile"><span>◎</span><b>Profile</b></a>
      </nav>
    </div>
  );
}
