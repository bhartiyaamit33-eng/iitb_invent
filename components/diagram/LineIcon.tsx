const ICONS = {
  research: "M8 20 V8 h8 l6 6 v12 H8z M16 8 v6 h6 M11 16 h8 M11 20 h6",
  founders: "M16 8 a4 4 0 1 0 0.01 0z M8 26 v-2 c0-4 4-6 8-6 s8 2 8 6 v2",
  investors: "M6 22 L16 10 L22 16 L28 8 M6 26 h22",
  incubators: "M8 24 V12 l8-4 8 4 v12 M16 8 v16 M10 24 h12",
  students: "M6 14 l10-6 10 6-10 6z M10 16 v6 l6 3 6-3 v-6",
  operators: "M8 16 h16 M16 8 v16 M10 10 h12 M10 22 h12",
  mentors: "M10 18 c0-6 12-6 12 0 M12 22 h8 M16 10 v2",
} as const;

export function LineIcon({
  name,
}: {
  name: keyof typeof ICONS;
}) {
  return (
    <svg viewBox="0 0 32 32" className="line-icon" aria-hidden="true">
      <path
        d={ICONS[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
