import { Link, useLocation } from "wouter";
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
        color: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
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
  const [, navigate] = useLocation();

  return (
    <div
      className="mobile-only"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: "rgba(0,0,0,0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center" }}>
        <img
          src="/logo-pnsp-crop.png"
          alt="PNSP"
          height={32}
          style={{ filter: "brightness(0) invert(1)", display: "block" }}
        />
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {!loading && isAuthenticated && user ? (
          <>
            <div style={{ display: "flex", alignItems: "center", padding: 4, cursor: "pointer" }}>
              <BellIcon />
            </div>
            <div onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
              <Avatar name={user.name ?? user.email ?? "U"} />
            </div>
          </>
        ) : (
          <>
            <div
              onClick={() => navigate("/entrar")}
              style={{
                border: "1px solid rgba(255,255,255,0.25)",
                background: "transparent",
                color: "#fff",
                padding: "6px 16px",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              Entrar
            </div>
            <div
              onClick={() => navigate("/cadastrar")}
              style={{
                background: "#C9A84C",
                color: "#000",
                fontWeight: 700,
                padding: "6px 16px",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              Cadastrar
            </div>
          </>
        )}
      </div>
    </div>
  );
}
