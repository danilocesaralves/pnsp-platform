import { useState } from "react";
import { useLocation } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const OFFERING_CATS = { show:"Show", aula:"Aula", producao:"Producao", instrumento_novo:"Instrumento Novo", instrumento_usado:"Instrumento Usado", artesanato:"Artesanato", acessorio:"Acessorio", audiovisual:"Audiovisual", luthieria:"Luthieria", estudio:"Estudio", servico:"Servico", outro:"Outro" };
const PRICE_TYPES = { fixo:"Preco Fixo", sob_consulta:"Sob Consulta", gratuito:"Gratuito", a_combinar:"A Combinar" };
const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function CreateOffering() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ title: "", description: "", category: "", priceType: "a_combinar", price: "", city: "", state: "" });
  const { data: myProfile } = trpc.profiles.getMyProfile.useQuery();
  const create = trpc.offerings.create.useMutation({
    onSuccess: () => { toast.success("Oferta criada!"); navigate("/dashboard"); },
    onError: (e) => toast.error(e.message),
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <PublicLayout>
      <div className="container py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Criar Oferta</h1>
        {!myProfile && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">Voce precisa criar um perfil antes de publicar ofertas.</div>}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">Titulo *</label><Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Aula de Cavaquinho para Iniciantes" /></div>
          <div><label className="text-sm font-medium mb-1 block">Categoria *</label><Select value={form.category} onValueChange={(v) => set("category", v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{Object.entries(OFFERING_CATS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-sm font-medium mb-1 block">Descricao</label><Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} placeholder="Descreva sua oferta..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Tipo de Preco</label><Select value={form.priceType} onValueChange={(v) => set("priceType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PRICE_TYPES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
            {form.priceType === "fixo" && <div><label className="text-sm font-medium mb-1 block">Valor (R$)</label><Input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0,00" /></div>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Cidade</label><Input value={form.city} onChange={e => set("city", e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Estado</label><Select value={form.state} onValueChange={(v) => set("state", v)}><SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <Button className="w-full" disabled={!form.title || !form.category || !myProfile || create.isPending} onClick={() => create.mutate({ profileId: myProfile!.id, title: form.title, description: form.description || undefined, category: form.category as any, priceType: form.priceType as any, price: form.price ? Number(form.price) : undefined, city: form.city || undefined, state: form.state || undefined })}>
            {create.isPending ? "Publicando..." : "Publicar Oferta"}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
