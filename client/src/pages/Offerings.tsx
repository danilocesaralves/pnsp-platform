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
  Search, MapPin, Star, Briefcase, X, Tag, Clock,
} from "lucide-react";
import { OFFERING_CATEGORIES, BRAZIL_STATES } from "@shared/pnsp";

function OfferingSkeleton() {
  return (
    <div className="pnsp-card p-5 animate-pulse">
      <div className="pnsp-skeleton h-4 w-20 rounded-full mb-3" />
      <div className="pnsp-skeleton h-5 w-full mb-2" />
      <div className="pnsp-skeleton h-4 w-4/5 mb-4" />
      <div className="pnsp-skeleton h-3 w-full mb-2" />
      <div className="pnsp-skeleton h-3 w-3/4 mb-4" />
      <div className="flex items-center justify-between">
        <div className="pnsp-skeleton h-6 w-24" />
        <div className="pnsp-skeleton h-4 w-20" />
      </div>
    </div>
  );
}

const PRICE_TYPE_LABELS: Record<string, string> = {
  fixo: "Preço fixo",
  sob_consulta: "Sob consulta",
  gratuito: "Gratuito",
  a_combinar: "A combinar",
};

export default function Offerings() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [state, setState] = useState("all");
  const [offset, setOffset] = useState(0);
  const limit = 21;

  const { data: offerings, isLoading } = trpc.offerings.list.useQuery({
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
              Motor de Ofertas
            </h1>
            <p className="font-body text-lg mb-6" style={{ color: "var(--n400)" }}>
              Shows, aulas, instrumentos, produção, gravação e serviços do ecossistema
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--n400)" }} />
                <Input
                  placeholder="Buscar ofertas..."
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
              {Object.entries(OFFERING_CATEGORIES).map(([k, v]) => (
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
            {isLoading ? "Carregando..." : `${offerings?.length ?? 0} ofertas`}
          </span>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <OfferingSkeleton key={i} />)}
          </div>
        ) : offerings && offerings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {offerings.map(offering => (
                <Link key={offering.id} href={`/ofertas/${offering.id}`}>
                  <div className="pnsp-card p-5 cursor-pointer h-full flex flex-col">
                    {/* Category + Premium badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="pnsp-badge-green text-xs">
                        {OFFERING_CATEGORIES[offering.category as keyof typeof OFFERING_CATEGORIES] ?? offering.category}
                      </span>
                      {offering.isPremium && (
                        <Star className="h-4 w-4" style={{ color: "var(--o500)" }} />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-body font-semibold text-foreground text-sm leading-snug line-clamp-2 mb-2">
                      {offering.title}
                    </h3>

                    {/* Description */}
                    {offering.description && (
                      <p className="text-xs text-muted-foreground font-body line-clamp-2 leading-relaxed flex-1 mb-4">
                        {offering.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="mt-auto space-y-2">
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        {offering.price ? (
                          <span className="font-display font-bold text-base" style={{ color: "var(--g600)" }}>
                            R$ {Number(offering.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-sm font-body text-muted-foreground">
                            {PRICE_TYPE_LABELS[offering.priceType ?? ""] ?? "A combinar"}
                          </span>
                        )}
                        {offering.priceType && offering.priceType !== "fixo" && (
                          <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {PRICE_TYPE_LABELS[offering.priceType] ?? offering.priceType}
                          </span>
                        )}
                      </div>

                      {/* Location */}
                      {offering.city && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{offering.city}, {offering.state}</span>
                        </div>
                      )}
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
              {offerings.length === limit && (
                <Button variant="outline" className="font-body" onClick={() => setOffset(o => o + limit)}>
                  Próxima →
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--g100)" }}>
              <Briefcase className="h-8 w-8" style={{ color: "var(--g600)" }} />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">Nenhuma oferta encontrada</h3>
            <p className="text-muted-foreground font-body mb-6 max-w-sm mx-auto">
              {hasFilters ? "Ajuste os filtros ou limpe a busca para ver mais resultados." : "Ainda não há ofertas cadastradas."}
            </p>
            {hasFilters && (
              <Button onClick={clearFilters} variant="outline" className="font-body">
                <X className="h-4 w-4 mr-2" />Limpar filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
