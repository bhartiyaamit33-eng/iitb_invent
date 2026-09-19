import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconResearchPaper(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 8h14l8 8v24H14z" />
      <path d="M28 8v8h8" />
      <path d="M20 24h12M20 30h12M20 36h8" />
    </Svg>
  );
}

export function IconPoster(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="12" y="10" width="24" height="30" rx="2" />
      <path d="M18 6h12v6H18z" />
      <path d="M18 22h12M18 28h12M18 34h8" />
    </Svg>
  );
}

export function IconAward(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="24" cy="18" r="9" />
      <path d="M24 13v2M21 18h6" />
      <path d="M18 26l-4 14 10-6 10 6-4-14" />
    </Svg>
  );
}

export function IconPublish(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 36l4.2-1.2L36 17a4 4 0 10-5.7-5.7L12.5 29.2 11 36z" />
      <path d="M28.5 13.5l5.7 5.7" />
    </Svg>
  );
}

export function IconNetwork(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="16" cy="16" r="5" />
      <circle cx="32" cy="16" r="5" />
      <circle cx="24" cy="34" r="5" />
      <path d="M20 19l-2 10M28 19l2 10M21 16h6" />
    </Svg>
  );
}

export function IconWorkshop(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="10" y="12" width="28" height="18" rx="1.5" />
      <path d="M16 36h16M24 30v6" />
      <circle cx="18" cy="21" r="1.2" fill="currentColor" stroke="none" />
      <path d="M22 26h12M22 21h10" />
    </Svg>
  );
}

export function IconScholar(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 20l16-8 16 8-16 8-16-8z" />
      <path d="M14 23v8c4 3 16 3 20 0v-8" />
      <path d="M40 20v10" />
    </Svg>
  );
}

export function IconPostdoc(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="24" cy="16" r="6" />
      <path d="M12 38c1.5-8 7-12 12-12s10.5 4 12 12" />
      <path d="M32 14l4-6 4 2" />
    </Svg>
  );
}

export function IconFaculty(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="24" cy="14" r="5" />
      <path d="M12 38c1.5-9 7-14 12-14s10.5 5 12 14" />
      <path d="M32 20l6 2v8l-6 2" />
      <path d="M38 24h4" />
    </Svg>
  );
}

export const TRACK_ICONS = {
  paper: IconResearchPaper,
  poster: IconPoster,
} as const;

export const TIMELINE_ICONS = {
  award: IconAward,
  publish: IconPublish,
  network: IconNetwork,
  workshop: IconWorkshop,
} as const;

export const APPLICANT_ICONS = {
  phd: IconScholar,
  postdoc: IconPostdoc,
  faculty: IconFaculty,
} as const;
