import { Link, useLocation } from "wouter";

const GOLD = "#C9A84C";
const INACTIVE = "rgba(255,255,255,0.45)";

const tabs = [
  {
    label: "Home",
    href: "/",
    Icon: ({ color }: { color: string }) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Explorar",
    href: "/explorar",
    Icon: ({ color }: { color: string }) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    label: "Oportunidades",
    href: "/oportunidades",
    Icon: ({ color }: { color: string }) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    label: "Mensagens",
    href: "/mensagens",
    Icon: ({ color }: { color: string }) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Perfil",
    href: "/dashboard",
    Icon: ({ color }: { color: string }) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

type Tab = (typeof tabs)[0];

function TabItem({ tab, active }: { tab: Tab; active: boolean }) {
  const color = active ? GOLD : INACTIVE;
  return (
    <Link
      href={tab.href}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        minHeight: 48,
        position: "relative",
        color,
        transition: "color 0.2s ease",
        textDecoration: "none",
        paddingTop: active ? 10 : 6,
      }}
    >
      {active && (
        <span
          style={{
            position: "absolute",
            top: 4,
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: GOLD,
          }}
        />
      )}
      <tab.Icon color={color} />
      <span style={{ fontSize: 10, fontWeight: 500, lineHeight: 1, color }}>
        {tab.label}
      </span>
    </Link>
  );
}

export default function BottomNav() {
  const [location] = useLocation();

  function isActive(href: string) {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  }

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <TabItem key={tab.href} tab={tab} active={isActive(tab.href)} />
      ))}
    </nav>
  );
}
