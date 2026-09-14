import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconStar(props: IconProps) {
  return (
    <Svg fill="currentColor" stroke="none" {...props}>
      <path d="M12 3.5l2.6 5.3 5.9.6-4.4 4 1.2 5.8L12 16.3l-5.3 2.9 1.2-5.8-4.4-4 5.9-.6z" />
    </Svg>
  );
}

export function IconStarOutline(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5l2.6 5.3 5.9.6-4.4 4 1.2 5.8L12 16.3l-5.3 2.9 1.2-5.8-4.4-4 5.9-.6z" />
    </Svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 13l4 4L19 7" />
    </Svg>
  );
}

export function IconFootball(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8l3 2.2-1.1 3.6h-3.8L9 10.2z" />
      <path d="M12 8V5.5M14.9 10.2l2.4-1.5M9.1 10.2l-2.4-1.5M9.9 13.8l-1.1 3M14.1 13.8l1.1 3" />
    </Svg>
  );
}

export function IconBasketball(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18" />
      <path d="M5.6 5.6c2.6 3.4 2.6 9.4 0 12.8M18.4 5.6c-2.6 3.4-2.6 9.4 0 12.8" />
    </Svg>
  );
}

export function IconTennis(props: IconProps) {
  return (
    <Svg {...props}>
      <ellipse cx="10" cy="8.5" rx="5.5" ry="6.5" />
      <path d="M6.5 4.5c1 2 1 6.5 0 8.5M13.5 4.5c-1 2-1 6.5 0 8.5M5.2 8h9.6" />
      <path d="M13.5 13.5L20 20" />
    </Svg>
  );
}

export function IconVolleyball(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c3 2.4 3 15.6 0 18" />
      <path d="M4.8 7.2C8 9.6 16 9.6 19.2 7.2M4.8 16.8C8 14.4 16 14.4 19.2 16.8" />
    </Svg>
  );
}

export function IconSwimming(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 8.5c1.7-1.7 3.4-1.7 5 0s3.4 1.7 5 0 3.4-1.7 5 0 3.4 1.7 5 0" />
      <path d="M2 13.5c1.7-1.7 3.4-1.7 5 0s3.4 1.7 5 0 3.4-1.7 5 0 3.4 1.7 5 0" />
      <path d="M2 18.5c1.7-1.7 3.4-1.7 5 0s3.4 1.7 5 0 3.4-1.7 5 0 3.4 1.7 5 0" />
    </Svg>
  );
}

export function IconRunning(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="14.5" cy="4.5" r="1.6" fill="currentColor" stroke="none" />
      <path d="M11 8l3.5-1.5 2.5 3-3 2 .5 4.5-3.5 4M14.5 12l3 1.5 3-1M11 8L7 9.5v4M7 13.5L4 18" />
    </Svg>
  );
}

export function IconYoga(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="4.5" r="1.6" fill="currentColor" stroke="none" />
      <path d="M12 8v4M12 12l-5 3M12 12l5 3M7 15l-1.5 4M17 15l1.5 4M8.5 19h7" />
    </Svg>
  );
}

export function IconHockey(props: IconProps) {
  return (
    <Svg {...props}>
      <ellipse cx="16.5" cy="18" rx="3" ry="1.4" />
      <path d="M4 4l3.2 12.4a2 2 0 0 0 2 1.6H14" />
    </Svg>
  );
}

export function IconBadminton(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="17" r="1.6" />
      <path d="M12 15.4L9 5.5c1.6-.6 3-.6 3-2.5 0 1.9 1.4 1.9 3 2.5z" />
      <path d="M12 15.4l-2-6.4M12 15.4l2-6.4M12 15.4V8" />
    </Svg>
  );
}

export function IconWorkout(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
      <path d="M3 9.5v5M7 8v8M17 8v8M21 9.5v5" />
    </Svg>
  );
}

export function IconActivity(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </Svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  );
}

export function IconTicket(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
      <path d="M14 6v12" strokeDasharray="2 2" />
    </Svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconMapPin(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </Svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </Svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 19c1.2-3.2 3.7-4.8 6.5-4.8s5.3 1.6 6.5 4.8" />
      <path d="M15.5 5.2a3.2 3.2 0 0 1 0 6" />
      <path d="M16.5 14.4c2.2.4 3.9 1.9 4.8 4.6" />
    </Svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="3" width="12" height="18" rx="1" />
      <path d="M8 7h4M8 11h4M8 15h4" />
      <path d="M16 21v-8h4v8" />
    </Svg>
  );
}

export function IconTrendingUp(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </Svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export function IconInbox(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12l2.5-7h11L20 12" />
      <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6h-5a3 3 0 0 1-6 0z" />
    </Svg>
  );
}

export const SPORT_ICONS: Record<string, (props: IconProps) => JSX.Element> = {
  football: IconFootball,
  basketball: IconBasketball,
  tennis: IconTennis,
  volleyball: IconVolleyball,
  swimming: IconSwimming,
  running: IconRunning,
  yoga: IconYoga,
  hockey: IconHockey,
  badminton: IconBadminton,
  workout: IconWorkout,
};

export function SportIcon({ slug, ...props }: { slug?: string } & IconProps) {
  const Cmp = (slug && SPORT_ICONS[slug]) || IconActivity;
  return <Cmp {...props} />;
}
