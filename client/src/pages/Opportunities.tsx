import { useState } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Music, Calendar } from "lucide-react";
import { OPPORTUNITY_CATEGORIES, BRAZIL_STATES } from "@shared/pnsp";

export default function Opportunities() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const { data: opportunities, isLoading } = trpc.opportunities.list.useQuery({ search: search || undefined, category: category || undefined, state: state || undefined, limit, offset });
  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="mb-8"><h1 className="text-3xl font-bold mb-2">Motor de Oportunidades</h1><p className="text-muted-foreground">Vagas, shows, projetos e colaborações musicais</p></div>
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar oportunidades..." value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }} className="pl-9" /></div>
          <Select value={category} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setOffset(0); }}><SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{Object.entries(OPPORTUNITY_CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
          <Select value={state} onValueChange={(v) => { setState(v === "all" ? "" : v); setOffset(0); }}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{BRAZIL_STATES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
        </div>
        {isLoading ? <div className="space-y-3">{Array.from({length:5}).map((_,i) => <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-24" />)}</div> : (
          <>
            <div className="space-y-3">
              {(opportunities ?? []).map((opp) => (
                <Link key={opp.id} href={`/oportunidades/${opp.id}`}>
                  <div className="group rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2"><Badge variant="secondary" className="text-xs">{OPPORTUNITY_CATEGORIES[opp.category as keyof typeof OPPORTUNITY_CATEGORIES] ?? opp.category}</Badge>{opp.budgetMin && <span className="text-xs text-green-600 font-medium">R$ {Number(opp.budgetMin).toLocaleString("pt-BR")}+</span>}</div>
                        <h3 className="font-semibold line-clamp-2 group-hover:text-accent-foreground transition-colors">{opp.title}</h3>
                        {opp.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{opp.description}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {opp.city && <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{opp.city}, {opp.state}</div>}
                        {opp.deadline && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />Até {new Date(opp.deadline).toLocaleDateString("pt-BR")}</div>}
                        <span className="text-xs text-muted-foreground">{opp.applicationCount ?? 0} candidaturas</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {(opportunities ?? []).length === 0 && <div className="text-center py-16"><Music className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground">Nenhuma oportunidade encontrada</p></div>}
            <div className="flex justify-center gap-3 mt-8">{offset > 0 && <Button variant="outline" onClick={() => setOffset(o => o - limit)}>Anterior</Button>}{(opportunities ?? []).length === limit && <Button variant="outline" onClick={() => setOffset(o => o + limit)}>Próxima</Button>}</div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
