import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import {
  Music, Users, MapPin, BookOpen, Mic2, Guitar, Star,
  ArrowRight, Play, Search, Briefcase, Target, Building2
} from "lucide-react";

const PROFILE_TYPES = [
  { label: "Artistas Solo", icon: Mic2, href: "/perfis?tipo=artista_solo", color: "bg-amber-500" },
  { label: "Grupos & Bandas", icon: Users, href: "/perfis?tipo=grupo", color: "bg-red-500" },
  { label: "Produtores", icon: Music, href: "/perfis?tipo=produtor", color: "bg-purple-500" },
  { label: "Professores", icon: BookOpen, href: "/perfis?tipo=professor", color: "bg-blue-500" },
  { label: "Estúdios", icon: Building2, href: "/estudios", color: "bg-green-500" },
  { label: "Luthiers", icon: Guitar, href: "/perfis?tipo=luthier", color: "bg-orange-500" },
  { label: "Contratantes", icon: Briefcase, href: "/perfis?tipo=contratante", color: "bg-teal-500" },
  { label: "Eventos", icon: Star, href: "/oportunidades", color: "bg-pink-500" },
];

const FEATURES = [
  {
    icon: Users,
    title: "Vitrines Profissionais",
    desc: "Perfis completos com bio, portfólio, vídeos, áudio e redes sociais para artistas, grupos e profissionais.",
  },
  {
    icon: Briefcase,
    title: "Motor de Ofertas",
    desc: "Publique e encontre serviços: shows, aulas, instrumentos, produção musical e muito mais.",
  },
  {
    icon: Target,
    title: "Motor de Oportunidades",
    desc: "Vagas em grupos, projetos culturais, eventos e colaborações com sistema de candidatura.",
  },
  {
    icon: MapPin,
    title: "Mapa Vivo Nacional",
    desc: "Visualize artistas, grupos, estúdios e eventos em todo o Brasil em tempo real.",
  },
  {
    icon: BookOpen,
    title: "Academia Digital",
    desc: "Biblioteca de conteúdo educacional: artigos, vídeos e tutoriais sobre samba e pagode.",
  },
  {
    icon: Building2,
    title: "Hub de Estúdios",
    desc: "Encontre estúdios de gravação e ensaio com equipamentos, preços e reservas online.",
  },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: stats } = trpc.admin.stats.useQuery();
  const { data: featuredProfiles } = trpc.profiles.listFeatured.useQuery({ limit: 6 });
  const { data: recentOfferings } = trpc.offerings.listRecent.useQuery({ limit: 4 });

  return (
    <PublicLayout>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pnsp-black via-pnsp-dark to-pnsp-black text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-pnsp-gold blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-pnsp-red blur-3xl" />
        </div>
        <div className="container relative py-24 lg:py-32">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-pnsp-gold/20 text-pnsp-gold border-pnsp-gold/30 text-sm font-medium px-4 py-1.5">
              Plataforma Nacional do Samba e do Pagode
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              O ecossistema digital do{" "}
              <span className="text-pnsp-gold">samba</span> e do{" "}
              <span className="text-pnsp-red">pagode</span> brasileiro
            </h1>
            <p className="text-lg lg:text-xl text-white/70 mb-10 max-w-2xl leading-relaxed">
              Conectamos artistas, grupos, produtores, professores, estúdios e parceiros em uma infraestrutura digital nacional para descoberta, visibilidade e oportunidades reais.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-pnsp-gold hover:bg-pnsp-gold/90 text-black font-semibold px-8">
                    Meu Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-pnsp-gold hover:bg-pnsp-gold/90 text-black font-semibold px-8">
                    Criar Perfil Gratuito <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              )}
              <Link href="/perfis">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                  <Search className="mr-2 h-4 w-4" /> Explorar Plataforma
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="container py-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Profissionais", value: stats.profileCount },
                  { label: "Ofertas Ativas", value: stats.offeringCount },
                  { label: "Oportunidades", value: stats.opportunityCount },
                  { label: "Estúdios", value: stats.studioCount },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-pnsp-gold">{value ?? 0}+</p>
                    <p className="text-sm text-white/60 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Explore por Categoria</h2>
            <p className="text-muted-foreground">Encontre profissionais e serviços em todo o ecossistema</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {PROFILE_TYPES.map(({ label, icon: Icon, href, color }) => (
              <Link key={href} href={href}>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-pnsp-gold/50 transition-all cursor-pointer group text-center">
                  <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium leading-tight">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROFILES ────────────────────────────────────────────── */}
      {featuredProfiles && featuredProfiles.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-1">Perfis em Destaque</h2>
                <p className="text-muted-foreground">Profissionais verificados na plataforma</p>
              </div>
              <Link href="/perfis">
                <Button variant="outline" size="sm">
                  Ver todos <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredProfiles.slice(0, 6).map((profile) => (
                <Link key={profile.id} href={`/perfis/${profile.id}`}>
                  <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-pnsp-gold/40 transition-all cursor-pointer group">
                    <div className="h-32 bg-gradient-to-br from-pnsp-black to-pnsp-dark relative">
                      {profile.coverUrl && (
                        <img src={profile.coverUrl} alt="" className="w-full h-full object-cover opacity-60" />
                      )}
                      <div className="absolute bottom-3 left-4 flex items-end gap-3">
                        <div className="h-14 w-14 rounded-full border-2 border-pnsp-gold bg-pnsp-black flex items-center justify-center overflow-hidden">
                          {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <Music className="h-6 w-6 text-pnsp-gold" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 pt-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sm group-hover:text-pnsp-gold transition-colors">{profile.displayName}</h3>
                          <p className="text-xs text-muted-foreground">{profile.city}{profile.state ? `, ${profile.state}` : ""}</p>
                        </div>
                        {profile.isVerified && (
                          <Badge className="text-[10px] bg-pnsp-gold/10 text-pnsp-gold border-pnsp-gold/30">Verificado</Badge>
                        )}
                      </div>
                      {profile.bio && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{profile.bio}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Infraestrutura completa para o ecossistema</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Tudo que artistas, profissionais e parceiros precisam em uma única plataforma</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-xl border border-border bg-card hover:shadow-md hover:border-pnsp-gold/30 transition-all">
                <div className="h-12 w-12 rounded-xl bg-pnsp-gold/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-pnsp-gold" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RECENT OFFERINGS ─────────────────────────────────────────────── */}
      {recentOfferings && recentOfferings.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-1">Ofertas Recentes</h2>
                <p className="text-muted-foreground">Serviços disponíveis na plataforma</p>
              </div>
              <Link href="/ofertas">
                <Button variant="outline" size="sm">
                  Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentOfferings.slice(0, 4).map((offering) => (
                <Link key={offering.id} href={`/ofertas/${offering.id}`}>
                  <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-pnsp-gold/40 transition-all cursor-pointer group">
                    <Badge className="text-xs mb-3 bg-blue-50 text-blue-700 border-blue-200">{offering.category}</Badge>
                    <h3 className="font-semibold text-sm mb-2 group-hover:text-pnsp-gold transition-colors line-clamp-2">{offering.title}</h3>
                    {offering.price && (
                      <p className="text-pnsp-gold font-bold text-sm">
                        R$ {Number(offering.price).toLocaleString("pt-BR")}
                        {false && "/h"}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{offering.city}{offering.state ? `, ${offering.state}` : ""}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-pnsp-black to-pnsp-dark text-white">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Faça parte da maior plataforma do samba e pagode
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Crie seu perfil gratuito, publique ofertas e conecte-se com todo o ecossistema nacional.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/criar-perfil">
                <Button size="lg" className="bg-pnsp-gold hover:bg-pnsp-gold/90 text-black font-semibold px-10">
                  Criar Minha Vitrine <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-pnsp-gold hover:bg-pnsp-gold/90 text-black font-semibold px-10">
                  Começar Agora — É Gratuito <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}
            <Link href="/mapa">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                <MapPin className="mr-2 h-4 w-4" /> Ver Mapa Nacional
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
