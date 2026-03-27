import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Badge, profileTypeBadgeVariant } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { PNSPLogo } from "@/components/PNSPLogo";
import { CardSkeleton } from "@/components/ui/SkeletonLoader";
import {
  Music2, Users, MapPin, BookOpen, Mic2, Guitar, Star,
  ArrowRight, Search, Briefcase, Target, Building2,
  ChevronRight, TrendingUp, CheckCircle2, Zap, Globe,
} from "lucide-react";
import { PROFILE_TYPES } from "@shared/pnsp";

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const PROFILE_TYPES_GRID = [
  { label: "Artistas Solo",    icon: Mic2,      href: "/perfis?tipo=artista_solo", color: "var(--g500)" },
  { label: "Grupos & Bandas",  icon: Users,     href: "/perfis?tipo=grupo_banda",  color: "var(--o500)" },
  { label: "Produtores",       icon: Music2,    href: "/perfis?tipo=produtor",     color: "#8b5cf6" },
  { label: "Professores",      icon: BookOpen,  href: "/perfis?tipo=professor",    color: "#3b82f6" },
  { label: "Estúdios",         icon: Building2, href: "/estudios",                 color: "var(--g700)" },
  { label: "Luthiers",         icon: Guitar,    href: "/perfis?tipo=luthier",      color: "#f97316" },
  { label: "Contratantes",     icon: Briefcase, href: "/perfis?tipo=contratante",  color: "#0891b2" },
  { label: "Oportunidades",    icon: Target,    href: "/oportunidades",            color: "#ec4899" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Mic2,
    title: "Crie seu perfil",
    desc: "Monte sua vitrine profissional com bio, portfólio, vídeos e redes sociais. Grátis para sempre.",
    color: "var(--o500)",
  },
  {
    step: "02",
    icon: Globe,
    title: "Conecte-se ao ecossistema",
    desc: "Encontre artistas, produtores, estúdios e contratantes em todo o Brasil. Uma rede inteira do samba.",
    color: "var(--g500)",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Cresça no mercado",
    desc: "Publique ofertas, candidate-se a oportunidades e expanda sua carreira no pagode nacional.",
    color: "#8b5cf6",
  },
];

/* ─── Animated Counter ──────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1500, enabled = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled || target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, enabled]);
  return count;
}

function AnimatedStat({ value, label, icon: Icon, color }: { value: number | string; label: string; icon: React.ElementType; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const numericValue = typeof value === "number" ? value : parseInt(String(value)) || 0;
  const count = useCountUp(numericValue, 1200, visible);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <Icon className="h-6 w-6 mx-auto mb-2" style={{ color }} />
      <div
        className="text-4xl lg:text-5xl font-display font-bold mb-1 tabular-nums"
        style={{ color: "var(--n950)" }}
      >
        {visible ? (numericValue > 0 ? count : value) : 0}
        {numericValue > 0 && <span className="text-2xl font-medium">+</span>}
      </div>
      <p className="text-sm font-body font-medium" style={{ color: "var(--n700, #374151)" }}>{label}</p>
    </div>
  );
}

/* ─── Profile Card (Home featured) ─────────────────────────────────────────── */
function FeaturedProfileCard({ profile }: { profile: any }) {
  return (
    <Link href={`/perfil/${profile.slug?.toLowerCase()}`}>
      <div className="pnsp-profile-card cursor-pointer group overflow-hidden">
        {/* Avatar area */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.displayName)}`}
            alt={profile.displayName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white text-sm font-semibold font-body flex items-center gap-1.5">
              Ver perfil <ArrowRight className="h-4 w-4" />
            </span>
          </div>
          {profile.isFeatured && (
            <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1 backdrop-blur-sm">
              <Star className="h-3.5 w-3.5" style={{ color: "var(--o500)" }} />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="p-4">
          <h3 className="font-body font-semibold text-foreground truncate mb-1">{profile.displayName}</h3>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={profileTypeBadgeVariant(profile.profileType)} className="text-xs">
              {PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES] || profile.profileType?.replace(/_/g, " ")}
            </Badge>
          </div>
          {profile.city && (
            <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{profile.city}, {profile.state}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Skeleton for featured profile ────────────────────────────────────────── */
function FeaturedProfileSkeleton() {
  return (
    <div className="pnsp-profile-card overflow-hidden animate-pulse">
      <div className="aspect-square pnsp-skeleton" />
      <div className="p-4 space-y-2">
        <div className="pnsp-skeleton h-4 w-3/4" />
        <div className="pnsp-skeleton h-5 w-24 rounded-full" />
        <div className="pnsp-skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}

/* ─── Home ──────────────────────────────────────────────────────────────────── */
export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: stats } = trpc.platform.publicStats.useQuery();
  const { data: featuredProfiles, isLoading: loadingProfiles } = trpc.profiles.listFeatured.useQuery({ limit: 6 });
  const { data: recentOfferings, isLoading: loadingOfferings } = trpc.offerings.listRecent.useQuery({ limit: 3 });

  return (
    <PublicLayout>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white animated-gradient"
        style={{
          background: "linear-gradient(135deg, #0A0A0A 0%, #0d1a00 30%, #1a1200 60%, #0A0A0A 100%)",
          backgroundSize: "300% 300%",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute rounded-full blur-3xl opacity-25 animate-float"
            style={{ width: "42rem", height: "42rem", top: "-12rem", right: "-10rem", background: "var(--o500)" }}
          />
          <div
            className="absolute rounded-full blur-3xl opacity-12"
            style={{ width: "32rem", height: "32rem", bottom: "-10rem", left: "-8rem", background: "var(--g500)" }}
          />
          <div
            className="absolute rounded-full blur-2xl opacity-15"
            style={{ width: "22rem", height: "22rem", top: "55%", left: "35%", background: "var(--o300)" }}
          />
          {/* Wave line decoration */}
          <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 40 C360 80 720 0 1080 40 C1260 60 1350 50 1440 40 L1440 80 L0 80 Z" fill="var(--background)" />
          </svg>
        </div>

        <div className="container relative z-10 py-24 lg:py-32">
          <div className="max-w-4xl">
            <div className="mb-10 animate-slide-up">
              <PNSPLogo variant="full" size="2xl" theme="dark" className="drop-shadow-2xl" />
            </div>

            <h1
              className="pnsp-hero-text mb-6 animate-slide-up animate-delay-100"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.05 }}
            >
              O ecossistema digital do{" "}
              <span className="pnsp-text-gradient">samba</span>
              <br />e do{" "}
              <span style={{ color: "var(--g500)" }}>pagode</span>{" "}
              brasileiro
            </h1>

            <p
              className="text-lg lg:text-xl font-body mb-10 max-w-2xl leading-relaxed animate-slide-up animate-delay-200"
              style={{ color: "var(--n200)" }}
            >
              Conectamos artistas, produtores, estúdios, contratantes e toda a cadeia do samba nacional. Uma rede para crescer, colaborar e se apresentar ao Brasil.
            </p>

            <div className="flex flex-wrap gap-4 mb-16 animate-slide-up animate-delay-300">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  variant="gold"
                  className="h-12 px-8 text-base font-body font-semibold rounded-xl"
                  style={{ background: "var(--o500)", color: "var(--n950)" }}
                  asChild
                >
                  <Link href="/dashboard">
                    Acessar Dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="gold"
                  className="h-12 px-8 text-base font-body font-semibold rounded-xl"
                  style={{ background: "var(--o500)", color: "var(--n950)" }}
                  asChild
                >
                  <a href="/entrar">
                    Criar meu perfil grátis <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base font-body font-semibold rounded-xl border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/perfis">
                  <Search className="h-4 w-4" /> Explorar a plataforma
                </Link>
              </Button>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up animate-delay-400">
              {[
                { label: "Artistas", value: stats?.profileCount ?? 0, icon: Users, color: "var(--o500)" },
                { label: "Oportunidades", value: stats?.opportunityCount ?? 0, icon: Target, color: "var(--g500)" },
                { label: "Cidades", value: stats?.cityCount ?? 0, icon: MapPin, color: "#8b5cf6" },
                { label: "Estúdios", value: stats?.studioCount ?? 0, icon: Building2, color: "#3b82f6" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="pnsp-glass rounded-xl p-4 text-center">
                  <Icon className="h-4 w-4 mx-auto mb-1" style={{ color }} />
                  <span className="text-xl font-display font-semibold" style={{ color }}>
                    {typeof value === "number" && value > 0 ? `${value}+` : value || "—"}
                  </span>
                  <p className="text-xs font-body mt-0.5" style={{ color: "var(--n400)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <div className="pnsp-divider mx-auto mb-4" />
            <h2 className="pnsp-section-title text-3xl lg:text-4xl text-foreground mb-3">
              Como funciona
            </h2>
            <p className="text-muted-foreground font-body max-w-lg mx-auto">
              Em três passos simples você está conectado ao maior ecossistema do samba nacional
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color }, i) => (
              <div
                key={step}
                className={`text-center animate-slide-up animate-delay-${(i + 1) * 200}`}
              >
                <div
                  className="relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon className="h-9 w-9" style={{ color }} />
                  <span
                    className="absolute -top-3 -right-3 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center font-body shadow-sm"
                    style={{ background: color, color: "#fff" }}
                  >
                    {step}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-10 right-0 translate-x-1/2">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXPLORE POR CATEGORIA ────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "var(--n50)" }}>
        <div className="container">
          <div className="text-center mb-10">
            <div className="pnsp-divider mx-auto mb-4" />
            <h2 className="pnsp-section-title text-3xl text-foreground mb-3">Explore por categoria</h2>
            <p className="text-muted-foreground font-body max-w-xl mx-auto">
              Encontre o que você precisa no ecossistema completo do samba e pagode
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PROFILE_TYPES_GRID.map(({ label, icon: Icon, href, color }) => (
              <Link key={href} href={href}>
                <div className="pnsp-card p-5 text-center cursor-pointer group hover-lift">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110 duration-300"
                    style={{ background: `${color}18` }}
                  >
                    <Icon className="h-6 w-6" style={{ color }} />
                  </div>
                  <p className="text-sm font-body font-semibold text-foreground">{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUEM ESTÁ NA PNSP ────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="pnsp-divider mb-4" />
              <h2 className="pnsp-section-title text-3xl lg:text-4xl text-foreground mb-2">
                Conheça quem está transformando o samba
              </h2>
              <p className="text-muted-foreground font-body">Artistas e profissionais em destaque</p>
            </div>
            <Button variant="ghost" className="font-body hidden sm:flex flex-shrink-0" asChild>
              <Link href="/perfis">Ver todos <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {loadingProfiles
              ? Array.from({ length: 6 }).map((_, i) => <FeaturedProfileSkeleton key={i} />)
              : featuredProfiles?.length
              ? featuredProfiles.map(p => <FeaturedProfileCard key={p.id} profile={p} />)
              : (
                <div className="col-span-6 text-center py-12 text-muted-foreground font-body">
                  Nenhum perfil em destaque ainda.
                </div>
              )}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Button variant="outline" className="font-body" asChild>
              <Link href="/perfis">Ver todos os perfis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── OPORTUNIDADES EM DESTAQUE ────────────────────────────────────── */}
      {(loadingOfferings || (recentOfferings && recentOfferings.length > 0)) && (
        <section className="py-16" style={{ background: "var(--n50)" }}>
          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="pnsp-divider mb-4" />
                <h2 className="pnsp-section-title text-3xl text-foreground mb-2">Ofertas recentes</h2>
                <p className="text-muted-foreground font-body">Serviços disponíveis no ecossistema</p>
              </div>
              <Button variant="ghost" className="font-body hidden sm:flex flex-shrink-0" asChild>
                <Link href="/ofertas">Ver todas <ChevronRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {loadingOfferings
                ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                : recentOfferings?.map((offering) => (
                    <Link key={offering.id} href={`/ofertas/${offering.id}`}>
                      <div
                        className="pnsp-profile-card p-6 cursor-pointer h-full flex flex-col"
                        style={{ background: "var(--card)" }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="green" className="text-xs capitalize">
                            {offering.category?.replace(/_/g, " ")}
                          </Badge>
                          {offering.price && (
                            <span className="text-sm font-semibold font-body" style={{ color: "var(--g700)" }}>
                              R$ {Number(offering.price).toLocaleString("pt-BR")}
                            </span>
                          )}
                        </div>
                        <h3 className="font-body font-semibold text-foreground mb-2 line-clamp-2 flex-1">
                          {offering.title}
                        </h3>
                        {offering.city && (
                          <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-auto pt-3">
                            <MapPin className="h-3 w-3" />
                            {offering.city}, {offering.state}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── NÚMEROS QUE IMPORTAM ─────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "var(--o500)" }}>
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="pnsp-section-title text-3xl lg:text-4xl font-bold mb-3" style={{ color: "var(--n950)" }}>
              Números que importam
            </h2>
            <p className="font-body text-lg" style={{ color: "var(--n800, #1f2937)" }}>
              A PNSP cresce junto com o samba e o pagode brasileiro
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedStat value={stats?.profileCount ?? 0} label="Artistas cadastrados" icon={Users} color="var(--n950)" />
            <AnimatedStat value={stats?.studioCount ?? 0} label="Estúdios parceiros" icon={Building2} color="var(--n950)" />
            <AnimatedStat value={stats?.opportunityCount ?? 0} label="Oportunidades abertas" icon={Target} color="var(--n950)" />
            <AnimatedStat value={stats?.cityCount ?? 0} label="Cidades cobertas" icon={MapPin} color="var(--n950)" />
          </div>
        </div>
      </section>

      {/* ─── POR QUE A PNSP ───────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <div className="pnsp-divider mx-auto mb-4" />
            <h2 className="pnsp-section-title text-3xl text-foreground mb-3">Tudo que o ecossistema precisa</h2>
            <p className="text-muted-foreground font-body max-w-xl mx-auto">
              Uma infraestrutura digital completa para artistas, profissionais e parceiros
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Users, title: "Vitrines Profissionais", desc: "Perfis completos com bio, portfólio, vídeos, áudio e redes sociais.", color: "var(--o500)" },
              { icon: Briefcase, title: "Motor de Ofertas", desc: "Publique e encontre serviços: shows, aulas, instrumentos, produção musical.", color: "var(--g500)" },
              { icon: Target, title: "Motor de Oportunidades", desc: "Vagas em grupos, projetos culturais, eventos e colaborações.", color: "#8b5cf6" },
              { icon: MapPin, title: "Mapa Vivo Nacional", desc: "Visualize artistas, grupos, estúdios e eventos em todo o Brasil.", color: "#ef4444" },
              { icon: BookOpen, title: "Academia Digital", desc: "Biblioteca de conteúdo educacional sobre samba e pagode.", color: "#3b82f6" },
              { icon: Building2, title: "Hub de Estúdios", desc: "Encontre estúdios de gravação e ensaio com preços e reservas.", color: "var(--g700)" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="pnsp-card p-6 group hover-lift">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                  style={{ background: `${color}18` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ────────────────────────────────────────────────────── */}
      <section
        className="py-24"
        style={{ background: "linear-gradient(135deg, #0A0A0A 0%, var(--n900) 100%)" }}
      >
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <CheckCircle2 className="h-6 w-6" style={{ color: "var(--g500)" }} />
              <span className="text-sm font-body font-medium" style={{ color: "var(--g500)" }}>
                100% gratuito para artistas
              </span>
            </div>
            <h2
              className="pnsp-section-title text-3xl lg:text-5xl mb-5"
              style={{ color: "var(--n50)" }}
            >
              Faça parte do movimento
            </h2>
            <p className="font-body mb-10 text-lg leading-relaxed" style={{ color: "var(--n400)" }}>
              Crie seu perfil gratuito, publique ofertas, candidate-se a oportunidades
              e conecte-se com o ecossistema nacional do samba e pagode.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                variant="gold"
                className="h-13 px-10 font-body font-semibold rounded-xl text-base"
                style={{ background: "var(--o500)", color: "var(--n950)" }}
                asChild
              >
                <a href="/entrar">
                  Começar agora — é grátis <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-13 px-10 font-body font-semibold rounded-xl text-base border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/mapa">
                  <MapPin className="h-4 w-4" /> Ver mapa nacional
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
