import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href: string) => location.startsWith(href);

  return (
    <div style={{ minHeight: "100vh", background: "var(--preto)", display: "flex", flexDirection: "column" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(10,8,0,0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212,160,23,0.15)",
        height: 68,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.8)" : "none",
        transition: "box-shadow 0.3s ease",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32 }}>

          {/* Logo */}
          <Link href="/">
            <img src="/logo-pnsp-crop.png" alt="PNSP" title="PNSP - Plataforma Nacional do Samba e Pagode" style={{ height: 64, width: "auto", cursor: "pointer", display: "block", filter: "invert(1) brightness(1.2)", objectFit: "contain", background: "none" }} />
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
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--creme-10)",
                    background: "var(--terra)",
                    cursor: "pointer",
                    transition: "var(--transition)",
                    color: "var(--creme)",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.35)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--creme-10)"; }}
                  >
                    <Avatar style={{ width: 28, height: 28 }}>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name ?? "")}&backgroundColor=D4A017&textColor=0a0a0a&fontWeight=700&fontSize=40&radius=50`} alt={user.name ?? ""} />
                      <AvatarFallback style={{ background: "var(--ouro)", color: "var(--preto)", fontSize: 12, fontWeight: 700 }}>
                        {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name}
                    </span>
                    <span style={{ color: "var(--creme-50)", fontSize: 10 }}>▾</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" style={{ minWidth: 200 }}>
                  <div style={{ padding: "10px 14px" }}>
                    <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, fontFamily: "var(--font-body)" }}>{user.name}</p>
                    <p style={{ fontSize: "var(--text-xs)", opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</p>
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
                  {(user.role === "admin" || user.role === "owner" || user.email === "composisamba@gmail.com") && (
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
                  <DropdownMenuItem onClick={() => logout()} style={{ color: "var(--vermelho)" }}>
                    <LogOut style={{ width: 14, height: 14, marginRight: 8 }} />Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <a href="/entrar" style={{
                  padding: "8px 18px",
                  color: "var(--creme-80)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  fontFamily: "var(--font-body)",
                  transition: "color 0.2s",
                  borderRadius: "var(--radius-md)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--ouro)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--creme-80)"; }}
                >
                  Entrar
                </a>
                <a href="/entrar" style={{
                  padding: "8px 18px",
                  background: "var(--ouro)",
                  color: "var(--preto)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 700,
                  fontFamily: "var(--font-body)",
                  borderRadius: "var(--radius-md)",
                  transition: "var(--transition)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--ouro-claro)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--ouro)"; }}
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
                border: "1px solid var(--creme-10)",
                borderRadius: "var(--radius-sm)",
                color: "var(--creme)",
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
          borderBottom: "1px solid var(--creme-10)",
          padding: "16px 24px 24px",
          zIndex: 49,
        }}>
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <span
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-base)",
                  fontWeight: 500,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  marginBottom: 4,
                  color: isActive(href) ? "var(--ouro)" : "var(--creme-80)",
                  background: isActive(href) ? "var(--ouro-sutil)" : "transparent",
                  transition: "var(--transition)",
                }}
                onClick={() => setMobileOpen(false)}
              >
                <Icon style={{ width: 16, height: 16 }} />
                {label}
              </span>
            </Link>
          ))}
          {!isAuthenticated && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--creme-10)", display: "flex", gap: 8 }}>
              <a href="/entrar" style={{ flex: 1, textAlign: "center", padding: "11px", border: "1px solid var(--creme-20)", borderRadius: "var(--radius-md)", color: "var(--creme-80)", fontSize: "var(--text-sm)", fontWeight: 500, fontFamily: "var(--font-body)" }}>
                Entrar
              </a>
              <a href="/entrar" style={{ flex: 1, textAlign: "center", padding: "11px", background: "var(--ouro)", borderRadius: "var(--radius-md)", color: "var(--preto)", fontSize: "var(--text-sm)", fontWeight: 700, fontFamily: "var(--font-body)" }}>
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
