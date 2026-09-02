const ITEMS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Politics",
  "Geography",
  "Economics",
  "Adaptive quizzes",
  "Clear formulas",
  "Image doubts",
  "Cross-device sync",
  "Fast replies",
  "Syllabus-smart",
];

export function DockitMarquee() {
  const track = [...ITEMS, ...ITEMS];

  return (
    <div className="dockit-marquee" aria-hidden>
      <div className="dockit-marquee-fade dockit-marquee-fade--left" />
      <div className="dockit-marquee-fade dockit-marquee-fade--right" />
      <div className="dockit-marquee-track">
        {track.map((item, i) => (
          <span key={`${item}-${i}`} className="dockit-marquee-item">
            <span className="dockit-marquee-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
