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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Menu, X, Music, MapPin, BookOpen, Mic2, Briefcase, LayoutDashboard,
  LogOut, User, Settings, ChevronDown, Bell, Shield,
} from "lucide-react";
import { LOGO_URL } from "@shared/pnsp";

const NAV_LINKS = [
  { href: "/perfis", label: "Perfis", icon: User },
  { href: "/ofertas", label: "Ofertas", icon: Briefcase },
  { href: "/oportunidades", label: "Oportunidades", icon: Music },
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
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img
                src={LOGO_URL}
                alt="PNSP"
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href}>
                  <span
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      isActive(href)
                        ? "text-foreground bg-accent/20"
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
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                    <Bell className="h-4 w-4" />
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                          {user.name}
                        </span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        {user.role === "admin" || user.role === "owner" ? (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {user.role === "owner" ? "Proprietário" : "Admin"}
                          </Badge>
                        ) : null}
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
                          {user.role === "owner" && (
                            <DropdownMenuItem asChild>
                              <Link href="/proprietario">
                                <Settings className="h-4 w-4 mr-2" />
                                Dashboard Proprietário
                              </Link>
                            </DropdownMenuItem>
                          )}
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
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={getLoginUrl()}>Entrar</a>
                  </Button>
                  <Button size="sm" asChild className="hidden sm:flex">
                    <a href={getLoginUrl()}>Cadastrar</a>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="container py-3 space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <span
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                      isActive(href)
                        ? "text-foreground bg-accent/20"
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
                <div className="pt-2 border-t border-border flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={getLoginUrl()}>Entrar</a>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <a href={getLoginUrl()}>Cadastrar</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-primary text-primary-foreground mt-auto">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <img src={LOGO_URL} alt="PNSP" className="h-10 w-auto mb-4 invert" />
              <p className="text-sm text-primary-foreground/70 max-w-xs leading-relaxed">
                A infraestrutura digital nacional para o ecossistema do samba e do pagode.
                Conectando artistas, grupos, estúdios e parceiros em todo o Brasil.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Plataforma</h4>
              <ul className="space-y-2">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href}>
                      <span className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors cursor-pointer">
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Institucional</h4>
              <ul className="space-y-2">
                <li><Link href="/sobre"><span className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors cursor-pointer">Sobre a PNSP</span></Link></li>
                <li><Link href="/para-artistas"><span className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors cursor-pointer">Para Artistas</span></Link></li>
                <li><Link href="/para-contratantes"><span className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors cursor-pointer">Para Contratantes</span></Link></li>
                <li><Link href="/contato"><span className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors cursor-pointer">Contato</span></Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-primary-foreground/50">
              © 2025 PNSP — Plataforma Nacional de Samba e Pagode. Todos os direitos reservados.
            </p>
            <p className="text-xs text-primary-foreground/50">
              Feito com amor pelo samba brasileiro
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
