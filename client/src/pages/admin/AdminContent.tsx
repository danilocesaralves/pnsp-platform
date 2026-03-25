import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const ACAD_CATS = { historia:"Historia", tecnica:"Tecnica", instrumentos:"Instrumentos", composicao:"Composicao", producao:"Producao", carreira:"Carreira", negocios:"Negocios", cultura:"Cultura" };
const CONTENT_TYPES = { artigo:"Artigo", video:"Video", tutorial:"Tutorial", curso:"Curso", podcast:"Podcast" };

export default function AdminContent() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", excerpt: "", contentType: "artigo", category: "historia", level: "iniciante" });
  const { data: content, refetch } = trpc.academy.list.useQuery({ limit: 50 });
  const create = trpc.academy.adminCreate.useMutation({ onSuccess: () => { toast.success("Conteúdo criado!"); refetch(); setShowForm(false); }, onError: (e) => toast.error(e.message) });

  useEffect(() => { if (!loading && user?.role !== "admin" && user?.role !== "owner") navigate("/"); }, [loading, user]);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestão de Conteúdo</h1>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" />Novo Conteúdo</Button>
        </div>
        {showForm && (
          <div className="rounded-xl border border-border bg-card p-6 mb-6 space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Titulo</label><Input value={form.title} onChange={e => set("title", e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Resumo</label><Textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)} rows={2} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-sm font-medium mb-1 block">Tipo</label><Select value={form.contentType} onValueChange={(v) => set("contentType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(CONTENT_TYPES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium mb-1 block">Categoria</label><Select value={form.category} onValueChange={(v) => set("category", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(ACAD_CATS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium mb-1 block">Nivel</label><Select value={form.level} onValueChange={(v) => set("level", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="iniciante">Iniciante</SelectItem><SelectItem value="intermediario">Intermediario</SelectItem><SelectItem value="avancado">Avancado</SelectItem></SelectContent></Select></div>
            </div>
            <Button onClick={() => create.mutate(form as any)} disabled={!form.title || create.isPending}>{create.isPending ? "Criando..." : "Criar Conteúdo"}</Button>
          </div>
        )}
        <div className="space-y-3">
          {(content ?? []).map((item: any) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.contentType} · {item.category} · {item.level}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={item.isPublished ? "default" : "secondary"}>{item.isPublished ? "Publicado" : "Rascunho"}</Badge>
                {item.isPremium && <Badge className="bg-amber-500 text-white border-0 text-xs">Premium</Badge>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
