import { useState } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Briefcase, Star } from "lucide-react";
import { OFFERING_CATEGORIES, BRAZIL_STATES } from "@shared/pnsp";

export default function Offerings() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data: offerings, isLoading } = trpc.offerings.list.useQuery({
    search: search || undefined,
    category: category || undefined,
    state: state || undefined,
    limit,
    offset,
  });

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Motor de Ofertas</h1>
          <p className="text-muted-foreground">Shows, aulas, instrumentos, produções e serviços do ecossistema</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar ofertas..." value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }} className="pl-9" />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setOffset(0); }}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {Object.entries(OFFERING_CATEGORIES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={state} onValueChange={(v) => { setState(v === "all" ? "" : v); setOffset(0); }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {BRAZIL_STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-48" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(offerings ?? []).map((offering) => (
                <Link key={offering.id} href={`/ofertas/${offering.id}`}>
                  <div className="group rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
                    {offering.imageUrl && (
                      <div className="h-40 rounded-lg overflow-hidden mb-3 bg-muted">
                        <img src={offering.imageUrl} alt={offering.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {OFFERING_CATEGORIES[offering.category as keyof typeof OFFERING_CATEGORIES] ?? offering.category}
                      </Badge>
                      {offering.isPremium && <Star className="h-4 w-4 text-amber-500 shrink-0" />}
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">{offering.title}</h3>
                    <div className="flex items-center justify-between">
                      {offering.price ? (
                        <span className="text-sm font-bold text-accent-foreground">
                          R$ {Number(offering.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground capitalize">{offering.priceType?.replace(/_/g, " ") ?? "A combinar"}</span>
                      )}
                      {offering.city && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{offering.city}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {(offerings ?? []).length === 0 && (
              <div className="text-center py-16">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Nenhuma oferta encontrada</p>
              </div>
            )}
            <div className="flex justify-center gap-3 mt-8">
              {offset > 0 && <Button variant="outline" onClick={() => setOffset(o => o - limit)}>Anterior</Button>}
              {(offerings ?? []).length === limit && <Button variant="outline" onClick={() => setOffset(o => o + limit)}>Próxima</Button>}
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
