import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menu, X, User, Briefcase, Music2, MapPin, BookOpen,
  Mic2, LayoutDashboard, LogOut, Settings, Shield,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/perfis",       label: "Perfis",        icon: User },
  { href: "/ofertas",      label: "Ofertas",        icon: Briefcase },
  { href: "/oportunidades",label: "Oportunidades",  icon: Music2 },
  { href: "/mapa",         label: "Mapa Vivo",      icon: MapPin },
  { href: "/academia",     label: "Academia",       icon: BookOpen },
  { href: "/estudios",     label: "Estúdios",       icon: Mic2 },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (href: string) => location.startsWith(href);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", flexDirection: "column" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(12,10,8,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212,146,10,0.12)",
        height: 68,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32 }}>

          {/* Logo */}
          <Link href="/">
            <span style={{
              fontFamily: "'Syne',system-ui,sans-serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#00C4A0",
              cursor: "pointer",
              letterSpacing: "-0.02em",
              userSelect: "none",
            }}>
              PNSP
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, justifyContent: "center" }}
            className="hidden-mobile">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}>
                <span className={`nav-link ${isActive(href) ? "active" : ""}`}>
                  {label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 10px 6px 6px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(237,236,234,0.06)",
                    background: "#111111",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    color: "#EDECEA",
                    fontFamily: "'Inter',system-ui,sans-serif",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.35)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(237,236,234,0.06)"; }}
                  >
                    <Avatar style={{ width: 28, height: 28 }}>
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name ?? "")}`} alt={user.name ?? ""} />
                      <AvatarFallback style={{ background: "#00C4A0", color: "#0A0A0A", fontSize: 12, fontWeight: 700 }}>
                        {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span style={{ fontSize: "0.875rem", fontWeight: 500, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name}
                    </span>
                    <span style={{ color: "rgba(237,236,234,0.5)", fontSize: 10 }}>▾</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" style={{ minWidth: 200 }}>
                  <div style={{ padding: "10px 14px" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, fontFamily: "'Inter',system-ui,sans-serif" }}>{user.name}</p>
                    <p style={{ fontSize: "0.75rem", opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/minha-conta">
                      <User style={{ width: 14, height: 14, marginRight: 8 }} />Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard style={{ width: 14, height: 14, marginRight: 8 }} />Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === "admin" || user.role === "owner") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield style={{ width: 14, height: 14, marginRight: 8 }} />Painel Admin
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/proprietario">
                          <Settings style={{ width: 14, height: 14, marginRight: 8 }} />Proprietário
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} style={{ color: "#EF4444" }}>
                    <LogOut style={{ width: 14, height: 14, marginRight: 8 }} />Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <a href="/entrar" style={{
                  padding: "8px 18px",
                  color: "rgba(237,236,234,0.8)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  fontFamily: "'Inter',system-ui,sans-serif",
                  transition: "color 0.2s",
                  borderRadius: "12px",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#00C4A0"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(237,236,234,0.8)"; }}
                >
                  Entrar
                </a>
                <a href="/entrar" style={{
                  padding: "8px 18px",
                  background: "#00C4A0",
                  color: "#0A0A0A",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  fontFamily: "'Inter',system-ui,sans-serif",
                  borderRadius: "12px",
                  transition: "all 0.25s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#33D4B4"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#00C4A0"; }}
                >
                  Cadastrar grátis
                </a>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              style={{
                display: "none",
                padding: 8,
                border: "1px solid rgba(237,236,234,0.06)",
                borderRadius: "6px",
                color: "#EDECEA",
                background: "none",
                cursor: "pointer",
              }}
              className="show-mobile"
            >
              {mobileOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="animate-slide-down" style={{
          position: "fixed",
          top: 68, left: 0, right: 0,
          background: "rgba(20,16,8,0.98)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(237,236,234,0.06)",
          padding: "16px 24px 24px",
          zIndex: 49,
        }}>
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <span
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 500,
                  fontFamily: "'Inter',system-ui,sans-serif",
                  cursor: "pointer",
                  marginBottom: 4,
                  color: isActive(href) ? "#00C4A0" : "rgba(237,236,234,0.8)",
                  background: isActive(href) ? "rgba(0,196,160,0.1)" : "transparent",
                  transition: "all 0.25s ease",
                }}
                onClick={() => setMobileOpen(false)}
              >
                <Icon style={{ width: 16, height: 16 }} />
                {label}
              </span>
            </Link>
          ))}
          {!isAuthenticated && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(237,236,234,0.06)", display: "flex", gap: 8 }}>
              <a href="/entrar" style={{ flex: 1, textAlign: "center", padding: "11px", border: "1px solid rgba(237,236,234,0.12)", borderRadius: "12px", color: "rgba(237,236,234,0.8)", fontSize: "0.875rem", fontWeight: 500, fontFamily: "'Inter',system-ui,sans-serif" }}>
                Entrar
              </a>
              <a href="/entrar" style={{ flex: 1, textAlign: "center", padding: "11px", background: "#00C4A0", borderRadius: "12px", color: "#0A0A0A", fontSize: "0.875rem", fontWeight: 700, fontFamily: "'Inter',system-ui,sans-serif" }}>
                Cadastrar
              </a>
            </div>
          )}
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
