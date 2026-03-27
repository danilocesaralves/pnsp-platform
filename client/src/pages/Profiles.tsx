import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, profileTypeBadgeVariant } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, MapPin, Star, Users, X, Award, AlertCircle, ArrowRight,
} from "lucide-react";
import { PROFILE_TYPES, BRAZIL_STATES } from "@shared/pnsp";

const TYPE_PILLS = [
  { value: "all",              label: "Todos" },
  { value: "artista_solo",     label: "Artista" },
  { value: "grupo_banda",      label: "Grupo" },
  { value: "produtor",         label: "Produtor" },
  { value: "estudio",          label: "Estúdio" },
  { value: "professor",        label: "Professor" },
  { value: "contratante",      label: "Contratante" },
  { value: "luthier",          label: "Luthier" },
  { value: "comunidade_roda",  label: "Comunidade" },
];

/* ─── Profile Card ──────────────────────────────────────────────────────────── */
function ProfileCard({ profile }: { profile: any }) {
  return (
    <Link href={`/perfil/${profile.slug?.toLowerCase()}`}>
      <div className="pnsp-profile-card cursor-pointer group overflow-hidden h-full flex flex-col">
        {/* Avatar — aspect-ratio 1:1 */}
        <div className="relative aspect-square overflow-hidden bg-muted flex-shrink-0">
          <img
            src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.displayName)}`}
            alt={profile.displayName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <span className="text-white text-xs font-semibold font-body flex items-center gap-1">
              Ver perfil <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
          {/* Badges overlay */}
          {(profile.isFeatured || profile.isVerified) && (
            <div className="absolute top-2 right-2 flex gap-1">
              {profile.isVerified && (
                <div className="rounded-full p-1 bg-black/50 backdrop-blur-sm" title="Verificado">
                  <Award className="h-3 w-3 text-white" />
                </div>
              )}
              {profile.isFeatured && (
                <div className="rounded-full p-1 bg-black/50 backdrop-blur-sm">
                  <Star className="h-3 w-3" style={{ color: "var(--o500)" }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-body font-bold text-foreground truncate mb-1 text-sm">
            {profile.displayName}
          </h3>
          <Badge
            variant={profileTypeBadgeVariant(profile.profileType)}
            className="text-xs mb-2 w-fit"
          >
            {PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES] || profile.profileType?.replace(/_/g, " ")}
          </Badge>
          {profile.city && (
            <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mb-2">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{profile.city}, {profile.state}</span>
            </p>
          )}
          {profile.bio && (
            <p className="text-xs text-muted-foreground font-body line-clamp-2 leading-relaxed flex-1">
              {profile.bio}
            </p>
          )}
          {profile.genres && profile.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {profile.genres.slice(0, 3).map((g: string) => (
                <span key={g} className="pnsp-badge-gold text-xs">{g}</span>
              ))}
              {profile.genres.length > 3 && (
                <span className="text-xs text-muted-foreground font-body">+{profile.genres.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Profile Card Skeleton ─────────────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="pnsp-profile-card overflow-hidden animate-pulse">
      <div className="aspect-square pnsp-skeleton" />
      <div className="p-4 space-y-2">
        <div className="pnsp-skeleton h-4 w-3/4" />
        <div className="pnsp-skeleton h-5 w-24 rounded-full" />
        <div className="pnsp-skeleton h-3 w-1/2" />
        <div className="pnsp-skeleton h-3 w-full" />
        <div className="pnsp-skeleton h-3 w-4/5" />
      </div>
    </div>
  );
}

/* ─── Profiles Page ──────────────────────────────────────────────────────────── */
export default function Profiles() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [profileType, setProfileType] = useState("all");
  const [state, setState] = useState("all");
  const [offset, setOffset] = useState(0);
  const limit = 24;

  const { data: profiles, isLoading, isError } = trpc.profiles.list.useQuery({
    search: search || undefined,
    profileType: profileType !== "all" ? profileType : undefined,
    state: state !== "all" ? state : undefined,
    limit,
    offset,
  });

  const hasFilters = search || profileType !== "all" || state !== "all";

  function clearFilters() {
    setSearch(""); setSearchInput("");
    setProfileType("all"); setState("all");
    setOffset(0);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setOffset(0);
  }

  return (
    <PublicLayout>
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div
        className="py-14 border-b border-border"
        style={{ background: "linear-gradient(135deg, #0A0A0A 0%, #0d1a00 50%, #0A0A0A 100%)" }}
      >
        <div className="container">
          <div className="max-w-2xl">
            <div className="pnsp-divider mb-4" />
            <h1 className="pnsp-section-title text-3xl lg:text-4xl mb-3 animate-slide-up" style={{ color: "var(--n50)" }}>
              Perfis &amp; Vitrines
            </h1>
            <p className="font-body text-lg mb-8 animate-slide-up animate-delay-100" style={{ color: "var(--n400)" }}>
              Descubra artistas, grupos, produtores, professores e parceiros do ecossistema nacional
            </p>
            <form onSubmit={handleSearch} className="flex gap-2 animate-slide-up animate-delay-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--n400)" }} />
                <Input
                  placeholder="Buscar por nome, cidade, estilo..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="pl-10 h-11 font-body bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 transition-colors"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-11 px-6 font-body font-semibold"
                style={{ background: "var(--o500)", color: "var(--n950)" }}
              >
                Buscar
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* ─── Filter Pills ────────────────────────────────────────────── */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {TYPE_PILLS.map(pill => (
              <button
                key={pill.value}
                type="button"
                onClick={() => { setProfileType(pill.value); setOffset(0); }}
                className="px-4 py-1.5 rounded-full text-sm font-medium font-body transition-all"
                style={
                  profileType === pill.value
                    ? { background: "var(--o500)", color: "var(--n950)", boxShadow: "0 2px 8px oklch(0.78 0.14 85 / 0.30)" }
                    : { background: "var(--muted)", color: "var(--muted-foreground)" }
                }
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Select value={state} onValueChange={v => { setState(v); setOffset(0); }}>
              <SelectTrigger className="w-44 h-9 font-body text-sm">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-body">Todos os estados</SelectItem>
                {BRAZIL_STATES.map(s => (
                  <SelectItem key={s.value} value={s.value} className="font-body">{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 font-body text-muted-foreground gap-1">
                <X className="h-3.5 w-3.5" /> Limpar filtros
              </Button>
            )}

            <span className="ml-auto text-sm text-muted-foreground font-body">
              {isLoading ? "Carregando..." : `${profiles?.length ?? 0} perfis`}
            </span>
          </div>
        </div>

        {/* ─── Grid ────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => <ProfileSkeleton key={i} />)}
          </div>
        ) : profiles && profiles.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {profiles.map(profile => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>

            <div className="flex justify-center gap-3 mt-10">
              {offset > 0 && (
                <Button variant="outline" className="font-body" onClick={() => setOffset(o => Math.max(0, o - limit))}>
                  ← Anterior
                </Button>
              )}
              {profiles.length === limit && (
                <Button variant="outline" className="font-body" onClick={() => setOffset(o => o + limit)}>
                  Próxima →
                </Button>
              )}
            </div>
          </>
        ) : isError ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--o100)" }}>
              <AlertCircle className="h-8 w-8" style={{ color: "var(--o500)" }} />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">Erro ao carregar perfis</h3>
            <p className="text-muted-foreground font-body mb-6 max-w-sm mx-auto">
              Não foi possível carregar os perfis. Verifique sua conexão e tente novamente.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="font-body">
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "var(--o100)" }}>
              <Users className="h-10 w-10" style={{ color: "var(--o500)" }} />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              {hasFilters ? "Nenhum perfil encontrado" : "Seja o primeiro!"}
            </h3>
            <p className="text-muted-foreground font-body mb-6 max-w-sm mx-auto">
              {hasFilters
                ? "Ajuste os filtros ou limpe a busca para ver mais resultados."
                : "Crie seu perfil e apareça para artistas e contratantes de todo o Brasil."}
            </p>
            {hasFilters ? (
              <Button onClick={clearFilters} variant="outline" className="font-body">
                <X className="h-4 w-4 mr-2" /> Limpar filtros
              </Button>
            ) : (
              <Link href="/criar-perfil">
                <Button className="font-body" style={{ background: "var(--o500)", color: "var(--n950)" }}>
                  Criar meu perfil
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
