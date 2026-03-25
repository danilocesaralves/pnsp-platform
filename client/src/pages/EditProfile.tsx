import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function EditProfile() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { data: profile } = trpc.profiles.getById.useQuery({ id: Number(params.id) }, { enabled: !!params.id });
  const [form, setForm] = useState({ displayName: "", bio: "", city: "", state: "", phone: "", website: "", instagramUrl: "", youtubeUrl: "" });
  useEffect(() => { if (profile) setForm({ displayName: profile.displayName, bio: profile.bio ?? "", city: profile.city ?? "", state: profile.state ?? "", phone: profile.phone ?? "", website: profile.website ?? "", instagramUrl: profile.instagramUrl ?? "", youtubeUrl: profile.youtubeUrl ?? "" }); }, [profile]);
  const update = trpc.profiles.update.useMutation({
    onSuccess: () => { toast.success("Perfil atualizado!"); navigate(`/perfis/${profile?.slug}`); },
    onError: (e) => toast.error(e.message),
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  return (
    <PublicLayout>
      <div className="container py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Editar Perfil</h1>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">Nome / Nome Artistico</label><Input value={form.displayName} onChange={e => set("displayName", e.target.value)} /></div>
          <div><label className="text-sm font-medium mb-1 block">Biografia</label><Textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={4} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Cidade</label><Input value={form.city} onChange={e => set("city", e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Estado</label><Select value={form.state} onValueChange={(v) => set("state", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Telefone</label><Input value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
          <div><label className="text-sm font-medium mb-1 block">Instagram</label><Input value={form.instagramUrl} onChange={e => set("instagramUrl", e.target.value)} /></div>
          <div><label className="text-sm font-medium mb-1 block">YouTube</label><Input value={form.youtubeUrl} onChange={e => set("youtubeUrl", e.target.value)} /></div>
          <Button className="w-full" onClick={() => update.mutate({ id: Number(params.id), ...form })} disabled={update.isPending}>
            {update.isPending ? "Salvando..." : "Salvar Alteracoes"}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
