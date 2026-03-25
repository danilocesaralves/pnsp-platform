import { useState } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Mic2, Star } from "lucide-react";

const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function Studios() {
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [studioType, setStudioType] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const { data: studios, isLoading } = trpc.studios.list.useQuery({ search: search || undefined, state: state || undefined, studioType: studioType || undefined, limit, offset });
  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="mb-8"><h1 className="text-3xl font-bold mb-2">Hub de Estúdios</h1><p className="text-muted-foreground">Estúdios de gravação e ensaio em todo o Brasil</p></div>
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar estúdios..." value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }} className="pl-9" /></div>
          <Select value={studioType} onValueChange={(v) => { setStudioType(v === "all" ? "" : v); setOffset(0); }}><SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="gravacao">Gravacao</SelectItem><SelectItem value="ensaio">Ensaio</SelectItem><SelectItem value="ambos">Gravacao + Ensaio</SelectItem></SelectContent></Select>
          <Select value={state} onValueChange={(v) => { setState(v === "all" ? "" : v); setOffset(0); }}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        </div>
        {isLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i) => <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-64" />)}</div> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(studios ?? []).map((studio) => (
                <Link key={studio.id} href={`/estudios/${studio.slug}`}>
                  <div className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="relative h-44 bg-muted overflow-hidden">
                      {studio.imageUrl ? <img src={studio.imageUrl} alt={studio.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50"><Mic2 className="h-10 w-10 text-muted-foreground/30" /></div>}
                      {studio.isVerified && <div className="absolute top-2 right-2"><Badge className="bg-green-500 text-white border-0 text-xs">Verificado</Badge></div>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 group-hover:text-accent-foreground transition-colors">{studio.name}</h3>
                      {studio.city && <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><MapPin className="h-3 w-3" />{studio.city}, {studio.state}</div>}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs capitalize">{studio.studioType ?? "Estudio"}</Badge>
                        <div className="flex items-center gap-1">{Number(studio.rating) > 0 && <><Star className="h-3 w-3 text-amber-500 fill-amber-500" /><span className="text-xs font-medium">{Number(studio.rating).toFixed(1)}</span></>}{studio.pricePerHour && <span className="text-xs text-muted-foreground ml-2">R$ {Number(studio.pricePerHour).toLocaleString("pt-BR")}/h</span>}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {(studios ?? []).length === 0 && <div className="text-center py-16"><Mic2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground">Nenhum estudio encontrado</p></div>}
            <div className="flex justify-center gap-3 mt-8">{offset > 0 && <Button variant="outline" onClick={() => setOffset(o => o - limit)}>Anterior</Button>}{(studios ?? []).length === limit && <Button variant="outline" onClick={() => setOffset(o => o + limit)}>Próxima</Button>}</div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
