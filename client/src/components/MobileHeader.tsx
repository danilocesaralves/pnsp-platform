import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#C9A84C",
        color: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
        cursor: "pointer",
      }}
    >
      {initials}
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function MobileHeader() {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <header className="mobile-header">
      <Link href="/" style={{ display: "flex", alignItems: "center" }}>
        <img
          src="/logo-pnsp-crop.png"
          alt="PNSP"
          style={{ height: 32, width: "auto", display: "block" }}
        />
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {!loading && isAuthenticated && user ? (
          <>
            <div style={{ display: "flex", alignItems: "center", padding: 4, cursor: "pointer" }}>
              <BellIcon />
            </div>
            <Link href="/dashboard">
              <Avatar name={user.name ?? user.email ?? "U"} />
            </Link>
          </>
        ) : !loading ? (
          <>
            <Link
              href="/entrar"
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                borderRadius: 8,
                padding: "0 14px",
                height: 32,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              Entrar
            </Link>
            <Link
              href="/cadastrar"
              style={{
                background: "#C9A84C",
                border: "none",
                color: "#0a0a0a",
                borderRadius: 8,
                padding: "0 14px",
                height: 32,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              Cadastrar
            </Link>
          </>
        ) : null}
      </div>
    </header>
  );
}
