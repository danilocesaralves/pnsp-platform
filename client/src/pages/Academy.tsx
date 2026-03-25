import { useState } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Play, Clock, Lock } from "lucide-react";


import { ACADEMY_CATEGORIES } from "@shared/pnsp";
const CONTENT_TYPES: Record<string,string> = { artigo:"Artigo", video:"Vídeo", tutorial:"Tutorial", curso:"Curso", podcast:"Podcast", partitura:"Partitura" };

export default function Academy() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [contentType, setContentType] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const { data: content, isLoading } = trpc.academy.list.useQuery({ search: search || undefined, category: category || undefined, contentType: contentType || undefined, limit, offset });
  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="mb-8"><h1 className="text-3xl font-bold mb-2">Academia Digital</h1><p className="text-muted-foreground">Conteúdo educacional sobre samba, pagode e o ecossistema musical</p></div>
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar conteúdo..." value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }} className="pl-9" /></div>
          <Select value={category} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setOffset(0); }}><SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{Object.entries(ACADEMY_CATEGORIES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
          <Select value={contentType} onValueChange={(v) => { setContentType(v === "all" ? "" : v); setOffset(0); }}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{Object.entries(CONTENT_TYPES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
        </div>
        {isLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i) => <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-64" />)}</div> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(content ?? []).map((item) => (
                <Link key={item.id} href={`/academia/${item.id}`}>
                  <div className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="relative h-44 bg-muted overflow-hidden">
                      {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">{item.contentType === "video" ? <Play className="h-10 w-10 text-muted-foreground/40" /> : <BookOpen className="h-10 w-10 text-muted-foreground/40" />}</div>}
                      {item.isPremium && <div className="absolute top-2 right-2"><Badge className="bg-amber-500 text-white border-0 text-xs"><Lock className="h-3 w-3 mr-1" />Premium</Badge></div>}
                      <div className="absolute top-2 left-2"><Badge variant="secondary" className="text-xs">{CONTENT_TYPES[item.contentType] ?? item.contentType}</Badge></div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2"><Badge variant="outline" className="text-xs">{(ACADEMY_CATEGORIES as Record<string,string>)[item.category] ?? item.category}</Badge></div>
                      <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-accent-foreground transition-colors">{item.title}</h3>
                      {item.excerpt && <p className="text-xs text-muted-foreground line-clamp-2">{item.excerpt}</p>}
                      <div className="flex items-center justify-between mt-3">
                        {item.duration && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{item.duration} min</div>}
                        {!item.isPremium ? <span className="text-sm font-bold text-accent-foreground">R$ {Number(!item.isPremium).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span> : <span className="text-xs text-green-600 font-medium">Gratuito</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {(content ?? []).length === 0 && <div className="text-center py-16"><BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground">Nenhum conteudo encontrado</p></div>}
            <div className="flex justify-center gap-3 mt-8">{offset > 0 && <Button variant="outline" onClick={() => setOffset(o => o - limit)}>Anterior</Button>}{(content ?? []).length === limit && <Button variant="outline" onClick={() => setOffset(o => o + limit)}>Próxima</Button>}</div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
