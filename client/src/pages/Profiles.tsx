import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, MapPin, Star, Users, X, Award, Music, AlertCircle,
} from "lucide-react";
import { PROFILE_TYPES, BRAZIL_STATES } from "@shared/pnsp";

const PROFILE_TYPE_OPTIONS = [
  { value: "all", label: "Todos os tipos" },
  { value: "artista_solo", label: "Artista Solo" },
  { value: "grupo_banda", label: "Grupo / Banda" },
  { value: "comunidade_roda", label: "Comunidade / Roda" },
  { value: "produtor", label: "Produtor" },
  { value: "professor", label: "Professor / Oficineiro" },
  { value: "estudio", label: "Estúdio" },
  { value: "loja", label: "Loja de Instrumentos" },
  { value: "luthier", label: "Luthier" },
  { value: "contratante", label: "Contratante" },
  { value: "parceiro", label: "Parceiro" },
];

const AVATAR_COLORS = [
  "var(--o500)", "var(--g500)", "#8b5cf6", "#3b82f6",
  "#ef4444", "#f97316", "#ec4899", "#0891b2",
];
function getAvatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function ProfileSkeleton() {
  return (
    <div className="pnsp-card p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="pnsp-skeleton w-14 h-14 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="pnsp-skeleton h-4 w-32 mb-2" />
          <div className="pnsp-skeleton h-3 w-20 mb-1" />
          <div className="pnsp-skeleton h-3 w-24" />
        </div>
      </div>
      <div className="pnsp-skeleton h-3 w-full mb-2" />
      <div className="pnsp-skeleton h-3 w-3/4 mb-4" />
      <div className="flex gap-2">
        <div className="pnsp-skeleton h-5 w-16 rounded-full" />
        <div className="pnsp-skeleton h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

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
        className="py-12 border-b border-border"
        style={{ background: "linear-gradient(135deg, var(--n950) 0%, var(--n900) 100%)" }}
      >
        <div className="container">
          <div className="max-w-2xl">
            <div className="pnsp-divider mb-4" />
            <h1 className="pnsp-section-title text-3xl lg:text-4xl mb-3" style={{ color: "var(--n50)" }}>
              Perfis & Vitrines
            </h1>
            <p className="font-body text-lg mb-6" style={{ color: "var(--n400)" }}>
              Descubra artistas, grupos, produtores, professores e parceiros do ecossistema nacional
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--n400)" }} />
                <Input
                  placeholder="Buscar por nome, cidade, estilo..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="pl-10 h-11 font-body bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Select value={profileType} onValueChange={v => { setProfileType(v); setOffset(0); }}>
            <SelectTrigger className="w-52 h-9 font-body text-sm">
              <SelectValue placeholder="Tipo de perfil" />
            </SelectTrigger>
            <SelectContent>
              {PROFILE_TYPE_OPTIONS.map(t => (
                <SelectItem key={t.value} value={t.value} className="font-body">{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              <X className="h-3.5 w-3.5" />
              Limpar
            </Button>
          )}

          <span className="ml-auto text-sm text-muted-foreground font-body">
            {isLoading ? "Carregando..." : `${profiles?.length ?? 0} perfis`}
          </span>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <ProfileSkeleton key={i} />)}
          </div>
        ) : profiles && profiles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {profiles.map(profile => (
                <Link key={profile.id} href={`/perfis/${profile.id}`}>
                  <div className="pnsp-card p-5 cursor-pointer h-full flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.displayName}
                          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-display font-bold text-xl flex-shrink-0"
                          style={{ background: getAvatarColor(profile.id) }}
                        >
                          {profile.displayName?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-body font-semibold text-foreground text-sm leading-tight line-clamp-2">
                            {profile.displayName}
                          </h3>
                          {profile.isFeatured && (
                            <Star className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--o500)" }} />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-body capitalize mt-0.5">
                          {PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES] || profile.profileType?.replace(/_/g, " ")}
                        </p>
                        {profile.city && (
                          <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{profile.city}, {profile.state}</span>
                          </p>
                        )}
                        {profile.isVerified && (
                          <Badge className="mt-1 text-xs bg-green-100 text-green-800 border-0 py-0 px-1.5">
                            <Award className="h-3 w-3 mr-1" />Verificado
                          </Badge>
                        )}
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-xs text-muted-foreground font-body line-clamp-2 leading-relaxed flex-1 mb-3">
                        {profile.bio}
                      </p>
                    )}

                    {profile.genres && profile.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {profile.genres.slice(0, 3).map((g: string) => (
                          <span key={g} className="pnsp-badge-gold text-xs">{g}</span>
                        ))}
                        {profile.genres.length > 3 && (
                          <span className="text-xs text-muted-foreground font-body">+{profile.genres.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-3 mt-8">
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
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--o100)" }}>
              <AlertCircle className="h-8 w-8" style={{ color: "var(--o500)" }} />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">Erro ao carregar perfis</h3>
            <p className="text-muted-foreground font-body mb-6 max-w-sm mx-auto">Não foi possível carregar os perfis. Verifique sua conexão e tente novamente.</p>
            <Button onClick={() => window.location.reload()} className="font-body" style={{ background: "var(--g600)" }}>Tentar novamente</Button>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--o100)" }}>
              <Users className="h-8 w-8" style={{ color: "var(--o500)" }} />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">Nenhum perfil encontrado</h3>
            <p className="text-muted-foreground font-body mb-6 max-w-sm mx-auto">
              {hasFilters ? "Ajuste os filtros ou limpe a busca para ver mais resultados." : "Seja o primeiro a criar seu perfil na PNSP."}
            </p>
            {hasFilters ? (
              <Button onClick={clearFilters} variant="outline" className="font-body">
                <X className="h-4 w-4 mr-2" />Limpar filtros
              </Button>
            ) : (
              <Link href="/criar-perfil">
                <Button className="font-body" style={{ background: "var(--g600)" }}>Criar meu perfil</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
