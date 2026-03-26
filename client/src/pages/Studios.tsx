import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, MapPin, Mic2, Star, X, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import { BRAZIL_STATES } from "@shared/pnsp";

const STUDIO_TYPES: Record<string, string> = {
  gravacao: "Gravação",
  ensaio: "Ensaio",
  ambos: "Gravação + Ensaio",
};

function StudioSkeleton() {
  return (
    <div className="pnsp-card overflow-hidden animate-pulse">
      <div className="pnsp-skeleton h-44 w-full" />
      <div className="p-4">
        <div className="pnsp-skeleton h-5 w-3/4 mb-2" />
        <div className="pnsp-skeleton h-4 w-1/2 mb-3" />
        <div className="flex justify-between">
          <div className="pnsp-skeleton h-4 w-24" />
          <div className="pnsp-skeleton h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function Studios() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [state, setState] = useState("all");
  const [studioType, setStudioType] = useState("all");
  const [offset, setOffset] = useState(0);
  const limit = 18;

  const { data: studios, isLoading, isError } = trpc.studios.list.useQuery({
    search: search || undefined,
    state: state !== "all" ? state : undefined,
    studioType: studioType !== "all" ? studioType : undefined,
    limit,
    offset,
  });

  const hasFilters = search || state !== "all" || studioType !== "all";

  function clearFilters() {
    setSearch(""); setSearchInput("");
    setState("all"); setStudioType("all");
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
              Hub de Estúdios
            </h1>
            <p className="font-body text-lg mb-6" style={{ color: "var(--n400)" }}>
              Estúdios de gravação e ensaio verificados em todo o Brasil
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--n400)" }} />
                <Input
                  placeholder="Buscar estúdios..."
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
          <Select value={studioType} onValueChange={v => { setStudioType(v); setOffset(0); }}>
            <SelectTrigger className="w-52 h-9 font-body text-sm">
              <SelectValue placeholder="Tipo de estúdio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-body">Todos os tipos</SelectItem>
              {Object.entries(STUDIO_TYPES).map(([k, v]) => (
                <SelectItem key={k} value={k} className="font-body">{v}</SelectItem>
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
            {isLoading ? "Carregando..." : isError ? "Erro ao carregar" : `${studios?.length ?? 0} estúdios`}
          </span>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <StudioSkeleton key={i} />)}
          </div>
        ) : studios && studios.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {studios.map(studio => (
                <Link key={studio.id} href={`/estudios/${studio.slug}`}>
                  <div className="pnsp-card overflow-hidden cursor-pointer h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-44 bg-muted overflow-hidden flex-shrink-0">
                      {studio.imageUrl ? (
                        <img
                          src={studio.imageUrl}
                          alt={studio.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, var(--n900) 0%, var(--n800) 100%)" }}
                        >
                          <Mic2 className="h-12 w-12 text-white/20" />
                        </div>
                      )}

                      {/* Verified badge */}
                      {studio.isVerified && (
                        <div className="absolute top-2 right-2">
                          <span className="text-xs font-body font-semibold px-2 py-0.5 rounded-full text-white flex items-center gap-1"
                            style={{ background: "var(--g600)" }}>
                            <CheckCircle2 className="h-3 w-3" />Verificado
                          </span>
                        </div>
                      )}

                      {/* Type badge */}
                      {studio.studioType && (
                        <div className="absolute top-2 left-2">
                          <span className="text-xs font-body font-semibold px-2 py-0.5 rounded-full text-white"
                            style={{ background: "rgba(0,0,0,0.6)" }}>
                            {STUDIO_TYPES[studio.studioType] ?? studio.studioType}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-body font-semibold text-foreground text-base mb-1 line-clamp-1">
                        {studio.name}
                      </h3>

                      {studio.city && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-body mb-3">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span>{studio.city}, {studio.state}</span>
                        </div>
                      )}

                      {studio.description && (
                        <p className="text-xs text-muted-foreground font-body line-clamp-2 leading-relaxed mb-3 flex-1">
                          {studio.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                        <div className="flex items-center gap-1">
                          {Number(studio.rating) > 0 && (
                            <>
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-body font-semibold text-foreground">
                                {Number(studio.rating).toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>

                        {studio.pricePerHour ? (
                          <div className="flex items-center gap-1 text-xs font-body">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold" style={{ color: "var(--g600)" }}>
                              R$ {Number(studio.pricePerHour).toLocaleString("pt-BR")}/h
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground font-body">A combinar</span>
                        )}
                      </div>
                    </div>
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
              {studios.length === limit && (
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
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">Erro ao carregar estúdios</h3>
            <p className="text-muted-foreground font-body mb-6 max-w-sm mx-auto">Não foi possível carregar os estúdios. Verifique sua conexão e tente novamente.</p>
            <Button onClick={() => window.location.reload()} className="font-body" style={{ background: "var(--g600)" }}>Tentar novamente</Button>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--n100)" }}>
              <Mic2 className="h-8 w-8" style={{ color: "var(--n500)" }} />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">Nenhum estúdio encontrado</h3>
            <p className="text-muted-foreground font-body mb-6 max-w-sm mx-auto">
              {hasFilters ? "Ajuste os filtros ou limpe a busca para ver mais resultados." : "Ainda não há estúdios cadastrados na sua região."}
            </p>
            {hasFilters ? (
              <Button onClick={clearFilters} variant="outline" className="font-body">
                <X className="h-4 w-4 mr-2" />Limpar filtros
              </Button>
            ) : (
              <Link href="/criar-perfil">
                <Button className="font-body" style={{ background: "var(--g600)" }}>Cadastrar meu estúdio</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
