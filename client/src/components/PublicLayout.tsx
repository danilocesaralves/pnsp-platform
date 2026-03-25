import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Menu, X, Music2, MapPin, BookOpen, Mic2, Briefcase,
  LayoutDashboard, LogOut, User, Settings, ChevronDown,
  Shield, Star,
} from "lucide-react";
import { PNSPLogo } from "@/components/PNSPLogo";

const NAV_LINKS = [
  { href: "/perfis", label: "Perfis", icon: User },
  { href: "/ofertas", label: "Ofertas", icon: Briefcase },
  { href: "/oportunidades", label: "Oportunidades", icon: Music2 },
  { href: "/mapa", label: "Mapa Vivo", icon: MapPin },
  { href: "/academia", label: "Academia", icon: BookOpen },
  { href: "/estudios", label: "Estúdios", icon: Mic2 },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (href: string) => location.startsWith(href);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/">
              <PNSPLogo variant="full" size="sm" className="cursor-pointer" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href}>
                  <span
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer font-body ${
                      isActive(href)
                        ? "text-foreground bg-accent/20 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-9 px-2 rounded-lg">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback
                          className="text-xs font-semibold"
                          style={{ background: "var(--o500)", color: "var(--n950)" }}
                        >
                          {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate font-body">
                        {user.name}
                      </span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold font-body">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      {(user.role === "admin" || user.role === "owner") && (
                        <Badge
                          variant="secondary"
                          className="mt-1.5 text-xs pnsp-badge-gold border-0"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {user.role === "owner" ? "Proprietário" : "Admin"}
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/minha-conta">
                        <User className="h-4 w-4 mr-2" />
                        Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {(user.role === "admin" || user.role === "owner") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Shield className="h-4 w-4 mr-2" />
                            Painel Admin
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/proprietario">
                            <Settings className="h-4 w-4 mr-2" />
                            Dashboard Proprietário
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => logout()}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild className="font-body">
                    <a href={getLoginUrl()}>Entrar</a>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="hidden sm:flex font-body font-semibold"
                    style={{ background: "var(--o500)", color: "var(--n950)" }}
                  >
                    <a href={getLoginUrl()}>Cadastrar grátis</a>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-background/98 backdrop-blur-md">
            <div className="container py-3 space-y-0.5">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <span
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer font-body ${
                      isActive(href)
                        ? "text-foreground bg-accent/20 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-3 border-t border-border flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 font-body" asChild>
                    <a href={getLoginUrl()}>Entrar</a>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 font-body font-semibold"
                    style={{ background: "var(--o500)", color: "var(--n950)" }}
                    asChild
                  >
                    <a href={getLoginUrl()}>Cadastrar</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer style={{ background: "var(--n950)", color: "var(--n50)" }}>
        <div className="container py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <PNSPLogo variant="full" size="md" theme="dark" className="mb-5" />
              <p className="text-sm leading-relaxed font-body" style={{ color: "var(--n400)" }}>
                A infraestrutura digital nacional para o ecossistema do samba e do pagode.
                Conectando artistas, grupos, estúdios e parceiros em todo o Brasil.
              </p>
              <div className="flex gap-3 mt-5">
                <div className="pnsp-badge-gold text-xs">
                  <Star className="h-3 w-3" />
                  Plataforma Nacional
                </div>
                <div className="pnsp-badge-green text-xs">
                  Cultura Brasileira
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 font-display" style={{ color: "var(--o300)" }}>
                Plataforma
              </h4>
              <ul className="space-y-2.5">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href}>
                      <span
                        className="text-sm font-body transition-colors cursor-pointer"
                        style={{ color: "var(--n400)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--n50)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--n400)")}
                      >
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 font-display" style={{ color: "var(--o300)" }}>
                Institucional
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/sobre", label: "Sobre a PNSP" },
                  { href: "/para-artistas", label: "Para Artistas" },
                  { href: "/para-contratantes", label: "Para Contratantes" },
                  { href: "/academia", label: "Academia" },
                  { href: "/contato", label: "Contato" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href}>
                      <span
                        className="text-sm font-body transition-colors cursor-pointer"
                        style={{ color: "var(--n400)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--n50)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--n400)")}
                      >
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3"
            style={{ borderTop: "1px solid var(--n800)" }}
          >
            <p className="text-xs font-body" style={{ color: "var(--n600)" }}>
              © 2025 PNSP — Plataforma Nacional de Samba e Pagode. Todos os direitos reservados.
            </p>
            <p className="text-xs font-body" style={{ color: "var(--n600)" }}>
              Feito com amor pelo samba brasileiro 🇧🇷
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
