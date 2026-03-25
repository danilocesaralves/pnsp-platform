import { useState } from "react";
import { useLocation } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const OPP_CATS = { vaga_grupo:"Vaga em Grupo", show:"Show", evento:"Evento", projeto:"Projeto", aula:"Aula", producao:"Producao", estudio:"Estudio", servico:"Servico", outro:"Outro" };
const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function CreateOpportunity() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ title: "", description: "", category: "", city: "", state: "", budgetMin: "", budgetMax: "", deadline: "" });
  const create = trpc.opportunities.create.useMutation({
    onSuccess: () => { toast.success("Oportunidade publicada!"); navigate("/dashboard"); },
    onError: (e) => toast.error(e.message),
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <PublicLayout>
      <div className="container py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Publicar Oportunidade</h1>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">Titulo *</label><Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Procuro Pandeirista para Grupo" /></div>
          <div><label className="text-sm font-medium mb-1 block">Categoria *</label><Select value={form.category} onValueChange={(v) => set("category", v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{Object.entries(OPP_CATS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-sm font-medium mb-1 block">Descricao</label><Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} placeholder="Descreva a oportunidade..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Orcamento Min. (R$)</label><Input type="number" value={form.budgetMin} onChange={e => set("budgetMin", e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Orcamento Max. (R$)</label><Input type="number" value={form.budgetMax} onChange={e => set("budgetMax", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Cidade</label><Input value={form.city} onChange={e => set("city", e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Estado</label><Select value={form.state} onValueChange={(v) => set("state", v)}><SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Prazo</label><Input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} /></div>
          <Button className="w-full" disabled={!form.title || !form.category || create.isPending} onClick={() => create.mutate({ title: form.title, description: form.description || undefined, category: form.category as any, city: form.city || undefined, state: form.state || undefined, budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined, budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined, deadline: form.deadline || undefined })}>
            {create.isPending ? "Publicando..." : "Publicar Oportunidade"}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
