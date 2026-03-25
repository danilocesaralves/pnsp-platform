import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { PNSPLogo } from "@/components/PNSPLogo";
import {
  Music2, Users, MapPin, BookOpen, Mic2, Guitar, Star,
  ArrowRight, Search, Briefcase, Target, Building2,
  ChevronRight, TrendingUp, Award, Globe,
} from "lucide-react";

const PROFILE_TYPES = [
  { label: "Artistas Solo", icon: Mic2, href: "/perfis?tipo=artista_solo", color: "var(--o500)" },
  { label: "Grupos & Bandas", icon: Users, href: "/perfis?tipo=grupo", color: "var(--g500)" },
  { label: "Produtores", icon: Music2, href: "/perfis?tipo=produtor", color: "#8b5cf6" },
  { label: "Professores", icon: BookOpen, href: "/perfis?tipo=professor", color: "#3b82f6" },
  { label: "Estúdios", icon: Building2, href: "/estudios", color: "var(--g700)" },
  { label: "Luthiers", icon: Guitar, href: "/perfis?tipo=luthier", color: "#f97316" },
  { label: "Contratantes", icon: Briefcase, href: "/perfis?tipo=contratante", color: "#0891b2" },
  { label: "Eventos", icon: Star, href: "/oportunidades", color: "#ec4899" },
];

const FEATURES = [
  {
    icon: Users,
    title: "Vitrines Profissionais",
    desc: "Perfis completos com bio, portfólio, vídeos, áudio e redes sociais para artistas, grupos e profissionais.",
    color: "var(--o500)",
  },
  {
    icon: Briefcase,
    title: "Motor de Ofertas",
    desc: "Publique e encontre serviços: shows, aulas, instrumentos, produção musical e muito mais.",
    color: "var(--g500)",
  },
  {
    icon: Target,
    title: "Motor de Oportunidades",
    desc: "Vagas em grupos, projetos culturais, eventos e colaborações com sistema de candidatura.",
    color: "#8b5cf6",
  },
  {
    icon: MapPin,
    title: "Mapa Vivo Nacional",
    desc: "Visualize artistas, grupos, estúdios e eventos em todo o Brasil em tempo real.",
    color: "#ef4444",
  },
  {
    icon: BookOpen,
    title: "Academia Digital",
    desc: "Biblioteca de conteúdo educacional: artigos, vídeos e tutoriais sobre samba e pagode.",
    color: "#3b82f6",
  },
  {
    icon: Building2,
    title: "Hub de Estúdios",
    desc: "Encontre estúdios de gravação e ensaio com equipamentos, preços e reservas online.",
    color: "var(--g700)",
  },
];

function ProfileCardSkeleton() {
  return (
    <div className="pnsp-card p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="pnsp-skeleton w-12 h-12 rounded-full" />
        <div className="flex-1">
          <div className="pnsp-skeleton h-4 w-32 mb-2" />
          <div className="pnsp-skeleton h-3 w-20" />
        </div>
      </div>
      <div className="pnsp-skeleton h-3 w-full mb-2" />
      <div className="pnsp-skeleton h-3 w-3/4" />
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: stats } = trpc.platform.publicStats.useQuery();
  const { data: featuredProfiles, isLoading: loadingProfiles } = trpc.profiles.listFeatured.useQuery({ limit: 6 });
  const { data: recentOfferings, isLoading: loadingOfferings } = trpc.offerings.listRecent.useQuery({ limit: 4 });

  const platformStats = [
    { label: "Perfis Ativos", value: stats?.profileCount ?? "—", icon: Users, color: "var(--o500)" },
    { label: "Oportunidades", value: stats?.opportunityCount ?? "—", icon: Target, color: "var(--g500)" },
    { label: "Cidades", value: stats?.cityCount ?? "—", icon: MapPin, color: "#8b5cf6" },
    { label: "Estúdios", value: stats?.studioCount ?? "—", icon: Building2, color: "#3b82f6" },
  ];

  return (
    <PublicLayout>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background: "linear-gradient(135deg, var(--n950) 0%, var(--n900) 50%, oklch(0.18 0.04 85) 100%)",
          minHeight: "88vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: "40rem",
              height: "40rem",
              top: "-10rem",
              right: "-10rem",
              background: "var(--o500)",
            }}
          />
          <div
            className="absolute rounded-full blur-3xl opacity-10"
            style={{
              width: "30rem",
              height: "30rem",
              bottom: "-8rem",
              left: "-8rem",
              background: "var(--g500)",
            }}
          />
          <div
            className="absolute rounded-full blur-2xl opacity-15"
            style={{
              width: "20rem",
              height: "20rem",
              top: "50%",
              left: "30%",
              background: "var(--o300)",
            }}
          />
        </div>

        <div className="container relative z-10 py-20 lg:py-28">
          <div className="max-w-4xl">
            {/* Hero Logo — elemento de destaque principal */}
            <div className="mb-10">
              <PNSPLogo
                variant="full"
                size="2xl"
                theme="dark"
                className="drop-shadow-2xl"
              />
            </div>

            {/* Main headline */}
            <h1
              className="pnsp-hero-text mb-6"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", lineHeight: 1.05 }}
            >
              O ecossistema digital do{" "}
              <span style={{ color: "var(--o500)" }}>samba</span>
              <br />
              e do{" "}
              <span style={{ color: "var(--g500)" }}>pagode</span>{" "}
              brasileiro
            </h1>

            <p
              className="text-lg lg:text-xl font-body mb-10 max-w-2xl leading-relaxed"
              style={{ color: "var(--n200)" }}
            >
              Conecte-se com artistas, grupos, estúdios, produtores e parceiros em todo o Brasil.
              Descubra oportunidades, publique ofertas e faça parte da maior rede do samba nacional.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-16">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-body font-semibold rounded-xl"
                  style={{ background: "var(--o500)", color: "var(--n950)" }}
                  asChild
                >
                  <Link href="/dashboard">
                    Acessar Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-body font-semibold rounded-xl"
                  style={{ background: "var(--o500)", color: "var(--n950)" }}
                  asChild
                >
                  <a href={getLoginUrl()}>
                    Criar perfil gratuito
                    <ArrowRight className="ml-2 h-4 w-4" />
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
                  <Search className="mr-2 h-4 w-4" />
                  Explorar perfis
                </Link>
              </Button>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {platformStats.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="pnsp-glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" style={{ color }} />
                    <span className="text-2xl font-display font-semibold" style={{ color }}>
                      {value}
                    </span>
                  </div>
                  <p className="text-xs font-body" style={{ color: "var(--n400)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORY GRID ────────────────────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <div className="pnsp-divider mx-auto mb-4" />
            <h2 className="pnsp-section-title text-3xl text-foreground mb-3">
              Explore por categoria
            </h2>
            <p className="text-muted-foreground font-body max-w-xl mx-auto">
              Encontre o que você precisa no ecossistema completo do samba e pagode
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PROFILE_TYPES.map(({ label, icon: Icon, href, color }) => (
              <Link key={href} href={href}>
                <div className="pnsp-card p-5 text-center cursor-pointer group">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
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

      {/* ─── FEATURED PROFILES ────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "var(--n50)" }}>
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="pnsp-divider mb-4" />
              <h2 className="pnsp-section-title text-3xl text-foreground mb-2">
                Perfis em destaque
              </h2>
              <p className="text-muted-foreground font-body">
                Artistas e profissionais do ecossistema
              </p>
            </div>
            <Button variant="ghost" className="font-body hidden sm:flex" asChild>
              <Link href="/perfis">
                Ver todos
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingProfiles
              ? Array.from({ length: 6 }).map((_, i) => <ProfileCardSkeleton key={i} />)
              : featuredProfiles?.length
              ? featuredProfiles.map((profile) => (
                  <Link key={profile.id} href={`/perfis/${profile.id}`}>
                    <div className="pnsp-card p-5 cursor-pointer">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-display font-semibold text-lg flex-shrink-0"
                          style={{ background: "var(--o500)" }}
                        >
                          {(profile.displayName || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-body font-semibold text-foreground truncate">
                            {profile.displayName}
                          </h3>
                          <p className="text-xs text-muted-foreground font-body capitalize">
                            {profile.profileType?.replace(/_/g, " ")}
                          </p>
                          {profile.city && (
                            <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {profile.city}, {profile.state}
                            </p>
                          )}
                        </div>
                        {profile.isFeatured && (
                          <Star className="h-4 w-4 flex-shrink-0" style={{ color: "var(--o500)" }} />
                        )}
                      </div>
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground font-body line-clamp-2 leading-relaxed">
                          {profile.bio}
                        </p>
                      )}
                      {profile.genres && profile.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {profile.genres.slice(0, 3).map((g: string) => (
                            <span key={g} className="pnsp-badge-gold text-xs">{g}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              : (
                <div className="col-span-3 text-center py-12 text-muted-foreground font-body">
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

      {/* ─── FEATURES GRID ────────────────────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <div className="pnsp-divider mx-auto mb-4" />
            <h2 className="pnsp-section-title text-3xl text-foreground mb-3">
              Tudo que o ecossistema precisa
            </h2>
            <p className="text-muted-foreground font-body max-w-xl mx-auto">
              Uma infraestrutura digital completa para artistas, profissionais e parceiros do samba e pagode
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="pnsp-card p-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
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

      {/* ─── RECENT OFFERINGS ─────────────────────────────────────────────── */}
      {(loadingOfferings || (recentOfferings && recentOfferings.length > 0)) && (
        <section className="py-16" style={{ background: "var(--n50)" }}>
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="pnsp-divider mb-4" />
                <h2 className="pnsp-section-title text-3xl text-foreground mb-2">
                  Ofertas recentes
                </h2>
                <p className="text-muted-foreground font-body">
                  Serviços disponíveis no ecossistema
                </p>
              </div>
              <Button variant="ghost" className="font-body hidden sm:flex" asChild>
                <Link href="/ofertas">
                  Ver todas
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loadingOfferings
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="pnsp-card p-5 animate-pulse">
                      <div className="pnsp-skeleton h-4 w-3/4 mb-3" />
                      <div className="pnsp-skeleton h-3 w-full mb-2" />
                      <div className="pnsp-skeleton h-3 w-1/2 mb-4" />
                      <div className="pnsp-skeleton h-8 w-full rounded-lg" />
                    </div>
                  ))
                : recentOfferings?.map((offering) => (
                    <Link key={offering.id} href={`/ofertas/${offering.id}`}>
                      <div className="pnsp-card p-5 cursor-pointer h-full flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <span className="pnsp-badge-green text-xs capitalize">
                            {offering.category?.replace(/_/g, " ")}
                          </span>
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
                          <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
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

      {/* ─── CTA FINAL ────────────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{
          background: "linear-gradient(135deg, var(--n950) 0%, var(--n900) 100%)",
        }}
      >
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <TrendingUp className="h-10 w-10 mx-auto mb-6" style={{ color: "var(--o500)" }} />
            <h2
              className="pnsp-section-title text-3xl lg:text-4xl mb-4"
              style={{ color: "var(--n50)" }}
            >
              Faça parte do movimento
            </h2>
            <p className="font-body mb-8 text-lg" style={{ color: "var(--n400)" }}>
              Crie seu perfil gratuito, publique ofertas, candidate-se a oportunidades
              e conecte-se com o ecossistema nacional do samba e pagode.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="h-12 px-8 font-body font-semibold rounded-xl"
                style={{ background: "var(--o500)", color: "var(--n950)" }}
                asChild
              >
                <a href={getLoginUrl()}>
                  Começar agora — é grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 font-body font-semibold rounded-xl border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/mapa">
                  <MapPin className="mr-2 h-4 w-4" />
                  Ver mapa nacional
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
