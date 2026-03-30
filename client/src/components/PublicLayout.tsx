import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import SchemaOrg from "@/components/SchemaOrg";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menu, X, User, Briefcase, Music2, MapPin, BookOpen,
  Mic2, LayoutDashboard, LogOut, Settings, Shield, MessageSquare, FileText, DollarSign,
  Users, TrendingUp, Star,
} from "lucide-react";
import { NotificationDropdown } from "@/components/BookingFlow";

const NAV_LINKS = [
  { href: "/perfis",       label: "Perfis",        icon: User },
  { href: "/ofertas",      label: "Ofertas",        icon: Briefcase },
  { href: "/oportunidades",label: "Oportunidades",  icon: Music2 },
  { href: "/mapa",         label: "Mapa Vivo",      icon: MapPin },
  { href: "/academia",     label: "Academia",       icon: BookOpen },
  { href: "/estudios",     label: "Estúdios",       icon: Mic2 },
  { href: "/comunidade",   label: "Comunidade",     icon: Users },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const { data: unreadCount = 0 } = trpc.chat.getUnreadCount.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 30000 },
  );
  const { data: pendingBookings = 0 } = trpc.bookings.getPendingCount.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 30000 },
  );

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
        minHeight: 72,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        overflow: "visible",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.8)" : "none",
        transition: "box-shadow 0.3s ease",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, overflow: "visible" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", overflow: "visible", flexShrink: 0 }}>
            <img src="/logo-pnsp-crop.png" alt="PNSP" title="PNSP - Plataforma Nacional do Samba e Pagode" style={{ height: 64, width: "auto", display: "block", flexShrink: 0, objectFit: "contain", filter: "invert(1) brightness(1.2)", cursor: "pointer" }} />
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
            {isAuthenticated && user && (
              <>
                <Link href="/dashboard">
                  <span
                    className="hidden-mobile"
                    style={{
                      padding: "7px 16px",
                      background: isActive("/dashboard") ? "var(--ouro-sutil)" : "var(--terra)",
                      border: `1px solid ${isActive("/dashboard") ? "rgba(212,146,10,0.40)" : "var(--creme-10)"}`,
                      borderRadius: "var(--radius-md)",
                      color: isActive("/dashboard") ? "var(--ouro)" : "var(--creme-50)",
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      fontFamily: "var(--font-body)",
                      cursor: "pointer",
                      transition: "var(--transition)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <LayoutDashboard style={{ width: 14, height: 14 }} />
                    Dashboard
                  </span>
                </Link>
                <Link href="/mensagens">
                  <span
                    className="hidden-mobile"
                    style={{
                      position: "relative",
                      padding: "7px 16px",
                      background: isActive("/mensagens") ? "var(--ouro-sutil)" : "var(--terra)",
                      border: `1px solid ${isActive("/mensagens") ? "rgba(212,146,10,0.40)" : "var(--creme-10)"}`,
                      borderRadius: "var(--radius-md)",
                      color: isActive("/mensagens") ? "var(--ouro)" : "var(--creme-50)",
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      fontFamily: "var(--font-body)",
                      cursor: "pointer",
                      transition: "var(--transition)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <MessageSquare style={{ width: 14, height: 14 }} />
                    Mensagens
                    {unreadCount > 0 && (
                      <span style={{
                        minWidth: 17, height: 17,
                        background: "var(--ouro)",
                        color: "var(--preto)",
                        borderRadius: 999,
                        fontSize: 9,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                        marginLeft: 2,
                      }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </span>
                </Link>
                <Link href="/negociacoes">
                  <span
                    className="hidden-mobile"
                    style={{
                      position: "relative",
                      padding: "7px 16px",
                      background: isActive("/negociacoes") ? "var(--ouro-sutil)" : "var(--terra)",
                      border: `1px solid ${isActive("/negociacoes") ? "rgba(212,146,10,0.40)" : "var(--creme-10)"}`,
                      borderRadius: "var(--radius-md)",
                      color: isActive("/negociacoes") ? "var(--ouro)" : "var(--creme-50)",
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      fontFamily: "var(--font-body)",
                      cursor: "pointer",
                      transition: "var(--transition)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <FileText style={{ width: 14, height: 14 }} />
                    Negociações
                    {pendingBookings > 0 && (
                      <span style={{
                        minWidth: 17, height: 17,
                        background: "#2563EB",
                        color: "white",
                        borderRadius: 999,
                        fontSize: 9,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                        marginLeft: 2,
                      }}>
                        {pendingBookings > 9 ? "9+" : pendingBookings}
                      </span>
                    )}
                  </span>
                </Link>
                <span className="hidden-mobile">
                  <NotificationDropdown />
                </span>
              </>
            )}
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
                  <DropdownMenuItem asChild>
                    <Link href="/mensagens">
                      <MessageSquare style={{ width: 14, height: 14, marginRight: 8 }} />
                      Mensagens
                      {unreadCount > 0 && (
                        <span style={{ marginLeft: "auto", minWidth: 17, height: 17, background: "var(--ouro)", color: "var(--preto)", borderRadius: 999, fontSize: 9, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/negociacoes">
                      <FileText style={{ width: 14, height: 14, marginRight: 8 }} />
                      Negociações
                      {pendingBookings > 0 && (
                        <span style={{ marginLeft: "auto", minWidth: 17, height: 17, background: "#2563EB", color: "white", borderRadius: 999, fontSize: 9, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                          {pendingBookings > 9 ? "9+" : pendingBookings}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/contratos">
                      <FileText style={{ width: 14, height: 14, marginRight: 8 }} />Contratos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/patrocinadores">
                      <Briefcase style={{ width: 14, height: 14, marginRight: 8 }} />Patrocinadores
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pagamentos">
                      <DollarSign style={{ width: 14, height: 14, marginRight: 8 }} />Pagamentos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/marketing">
                      <TrendingUp style={{ width: 14, height: 14, marginRight: 8 }} />Marketing IA
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/memorias">
                      <Star style={{ width: 14, height: 14, marginRight: 8 }} />Memórias
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === "admin" || user.role === "owner" || user.email === "composisamba@gmail.com") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/agencia">
                          <Target style={{ width: 14, height: 14, marginRight: 8, color: "var(--ouro)" }} />
                          <span style={{ color: "var(--ouro)", fontWeight: 600 }}>Agência Autônoma</span>
                        </Link>
                      </DropdownMenuItem>
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
          {isAuthenticated ? (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--creme-10)", display: "flex", flexDirection: "column", gap: 4 }}>
              <Link href="/dashboard">
                <span style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "var(--radius-md)", color: "var(--ouro)", background: "var(--ouro-sutil)", fontSize: "var(--text-base)", fontWeight: 700, fontFamily: "var(--font-body)", cursor: "pointer" }} onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard style={{ width: 16, height: 16 }} />
                  Dashboard Proprietário
                </span>
              </Link>
              <Link href="/mensagens">
                <span style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "var(--radius-md)", color: "var(--creme-80)", fontSize: "var(--text-base)", fontWeight: 500, fontFamily: "var(--font-body)", cursor: "pointer" }} onClick={() => setMobileOpen(false)}>
                  <MessageSquare style={{ width: 16, height: 16 }} />
                  Mensagens
                  {unreadCount > 0 && (
                    <span style={{ marginLeft: 4, minWidth: 18, height: 18, background: "var(--ouro)", color: "var(--preto)", borderRadius: 999, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
              </Link>
              <Link href="/negociacoes">
                <span style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "var(--radius-md)", color: "var(--creme-80)", fontSize: "var(--text-base)", fontWeight: 500, fontFamily: "var(--font-body)", cursor: "pointer" }} onClick={() => setMobileOpen(false)}>
                  <FileText style={{ width: 16, height: 16 }} />
                  Negociações
                  {pendingBookings > 0 && (
                    <span style={{ marginLeft: 4, minWidth: 18, height: 18, background: "#2563EB", color: "white", borderRadius: 999, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                      {pendingBookings > 9 ? "9+" : pendingBookings}
                    </span>
                  )}
                </span>
              </Link>
              <Link href="/minha-conta">
                <span style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "var(--radius-md)", color: "var(--creme-80)", fontSize: "var(--text-base)", fontWeight: 500, fontFamily: "var(--font-body)", cursor: "pointer" }} onClick={() => setMobileOpen(false)}>
                  <User style={{ width: 16, height: 16 }} />
                  Minha Conta
                </span>
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "var(--radius-md)", color: "var(--vermelho)", fontSize: "var(--text-base)", fontWeight: 500, fontFamily: "var(--font-body)", cursor: "pointer", background: "none", border: "none", width: "100%", textAlign: "left" }}>
                <LogOut style={{ width: 16, height: 16 }} />
                Sair
              </button>
            </div>
          ) : (
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
      <SchemaOrg type="organization" />
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
