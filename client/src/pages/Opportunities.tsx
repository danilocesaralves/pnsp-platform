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
  Search, MapPin, Calendar, Music, X, Users, Clock, ChevronRight, AlertCircle,
} from "lucide-react";
import { OPPORTUNITY_CATEGORIES, BRAZIL_STATES } from "@shared/pnsp";

function OppSkeleton() {
  return (
    <div className="pnsp-card p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex gap-2 mb-3">
            <div className="pnsp-skeleton h-5 w-24 rounded-full" />
            <div className="pnsp-skeleton h-5 w-16 rounded-full" />
          </div>
          <div className="pnsp-skeleton h-5 w-3/4 mb-2" />
          <div className="pnsp-skeleton h-4 w-full mb-1" />
          <div className="pnsp-skeleton h-4 w-2/3" />
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="pnsp-skeleton h-4 w-24" />
          <div className="pnsp-skeleton h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function Opportunities() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [state, setState] = useState("all");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data: opportunities, isLoading, isError } = trpc.opportunities.list.useQuery({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    state: state !== "all" ? state : undefined,
    limit,
    offset,
  });

  const hasFilters = search || category !== "all" || state !== "all";

  function clearFilters() {
    setSearch(""); setSearchInput("");
    setCategory("all"); setState("all");
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
              Motor de Oportunidades
            </h1>
            <p className="font-body text-lg mb-6" style={{ color: "var(--n400)" }}>
              Vagas em grupos, shows, projetos culturais e colaborações musicais
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--n400)" }} />
                <Input
                  placeholder="Buscar oportunidades..."
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
          <Select value={category} onValueChange={v => { setCategory(v); setOffset(0); }}>
            <SelectTrigger className="w-52 h-9 font-body text-sm">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-body">Todas as categorias</SelectItem>
              {Object.entries(OPPORTUNITY_CATEGORIES).map(([k, v]) => (
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
            {isLoading ? "Carregando..." : isError ? "Erro ao carregar" : `${opportunities?.length ?? 0} oportunidades`}
          </span>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <OppSkeleton key={i} />)}
          </div>
        ) : opportunities && opportunities.length > 0 ? (
          <>
            <div className="space-y-4">
              {opportunities.map(opp => (
                <Link key={opp.id} href={`/oportunidades/${opp.id}`}>
                  <div className="pnsp-card p-5 cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="pnsp-badge-gold text-xs">
                            {OPPORTUNITY_CATEGORIES[opp.category as keyof typeof OPPORTUNITY_CATEGORIES] ?? opp.category}
                          </span>
                          {opp.budgetMin && (
                            <span className="text-xs font-body font-semibold" style={{ color: "var(--g600)" }}>
                              R$ {Number(opp.budgetMin).toLocaleString("pt-BR")}+
                            </span>
                          )}

                        </div>

                        {/* Title */}
                        <h3 className="font-body font-semibold text-foreground text-base mb-1 line-clamp-2">
                          {opp.title}
                        </h3>

                        {/* Description */}
                        {opp.description && (
                          <p className="text-sm text-muted-foreground font-body line-clamp-2 leading-relaxed">
                            {opp.description}
                          </p>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 shrink-0">
                        {opp.city && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                            <MapPin className="h-3 w-3" />
                            <span>{opp.city}, {opp.state}</span>
                          </div>
                        )}
                        {opp.deadline && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                            <Calendar className="h-3 w-3" />
                            <span>Até {new Date(opp.deadline).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                          <Users className="h-3 w-3" />
                          <span>{opp.applicationCount ?? 0} candidaturas</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
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
              {opportunities.length === limit && (
                <Button variant="outline" className="font-body" onClick={() => setOffset(o => o + limit)}>
                  Próxima →
                </Button>
              )}
            </div>
          </>
        ) : isError ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">Erro ao carregar oportunidades</h3>
            <p className="text-muted-foreground font-body mb-6 max-w-sm mx-auto">Não foi possível carregar as oportunidades. Verifique sua conexão e tente novamente.</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="font-body">Tentar novamente</Button>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--o100)" }}>
              <Music className="h-8 w-8" style={{ color: "var(--o500)" }} />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">Nenhuma oportunidade encontrada</h3>
            <p className="text-muted-foreground font-body mb-6 max-w-sm mx-auto">
              {hasFilters ? "Ajuste os filtros ou limpe a busca para ver mais resultados." : "Seja o primeiro a publicar uma oportunidade!"}
            </p>
            {hasFilters ? (
              <Button onClick={clearFilters} variant="outline" className="font-body">
                <X className="h-4 w-4 mr-2" />Limpar filtros
              </Button>
            ) : (
              <a href="/criar-oportunidade">
                <Button className="font-body" style={{ background: "var(--o500)", color: "var(--n950)" }}>Publicar oportunidade</Button>
              </a>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
