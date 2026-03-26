import { useState } from "react";
import { useLocation } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const PROFILE_TYPES = { artista_solo:"Artista Solo", grupo_banda:"Grupo/Banda", comunidade_roda:"Comunidade/Roda", produtor:"Produtor", estudio:"Estudio", professor:"Professor/Oficineiro", loja:"Loja de Instrumentos", luthier:"Luthier", contratante:"Contratante", parceiro:"Parceiro" };
const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const AVATAR_STYLES = [
  { id: "avataaars", label: "Cartoon" },
  { id: "lorelei", label: "Minimalista" },
  { id: "personas", label: "Realista" },
  { id: "fun-emoji", label: "Emoji" },
  { id: "bottts", label: "Robô" },
  { id: "identicon", label: "Geométrico" },
];

export default function CreateProfile() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ profileType: "", displayName: "", bio: "", city: "", state: "", phone: "", website: "", instagramUrl: "", youtubeUrl: "" });
  const [avatarStyle, setAvatarStyle] = useState("avataaars");
  const create = trpc.profiles.create.useMutation({
    onSuccess: (data) => { toast.success("Perfil criado!"); navigate(`/perfil/${data.slug}`); },
    onError: (e) => toast.error(e.message),
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const avatarSeed = encodeURIComponent(form.displayName || "pnsp");
  return (
    <PublicLayout>
      <div className="container py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Criar Perfil</h1>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Tipo de Perfil *</label>
            <Select value={form.profileType} onValueChange={(v) => set("profileType", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>{Object.entries(PROFILE_TYPES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Nome / Nome Artistico *</label><Input value={form.displayName} onChange={e => set("displayName", e.target.value)} placeholder="Seu nome ou nome do grupo" /></div>

          {/* Avatar selector */}
          <div>
            <label className="text-sm font-medium mb-3 block">Escolher Avatar</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATAR_STYLES.map(style => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setAvatarStyle(style.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                    avatarStyle === style.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${avatarSeed}`}
                    alt={style.label}
                    className="w-12 h-12 rounded-lg"
                  />
                  <span className="text-xs text-muted-foreground">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div><label className="text-sm font-medium mb-1 block">Biografia</label><Textarea value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Conte sua historia..." rows={4} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Cidade</label><Input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Sua cidade" /></div>
            <div><label className="text-sm font-medium mb-1 block">Estado</label><Select value={form.state} onValueChange={(v) => set("state", v)}><SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger><SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Telefone</label><Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(11) 99999-9999" /></div>
          <div><label className="text-sm font-medium mb-1 block">Instagram</label><Input value={form.instagramUrl} onChange={e => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/..." /></div>
          <div><label className="text-sm font-medium mb-1 block">YouTube</label><Input value={form.youtubeUrl} onChange={e => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/..." /></div>
          <Button
            className="w-full"
            onClick={() => create.mutate({
              ...form,
              avatarUrl: `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}`,
            } as any)}
            disabled={!form.profileType || !form.displayName || create.isPending}
          >
            {create.isPending ? "Criando..." : "Criar Perfil"}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
