import { useParams, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";

const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const AVATAR_STYLES = [
  { id: "avataaars", label: "Cartoon" },
  { id: "lorelei", label: "Minimalista" },
  { id: "personas", label: "Realista" },
  { id: "fun-emoji", label: "Emoji" },
  { id: "bottts", label: "Robô" },
  { id: "identicon", label: "Geométrico" },
];

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as AllowedType)) return "Formato inválido. Use JPG, PNG ou WebP.";
  if (file.size > MAX_SIZE) return "Arquivo muito grande. Máximo 5MB.";
  return null;
}

export default function EditProfile() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { data: profile } = trpc.profiles.getById.useQuery({ id: Number(params.id) }, { enabled: !!params.id });

  const [form, setForm] = useState({ displayName: "", bio: "", city: "", state: "", phone: "", website: "", instagramUrl: "", youtubeUrl: "" });
  const [avatarStyle, setAvatarStyle] = useState("avataaars");

  // Upload state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const getPresignedUrl = trpc.upload.getPresignedUrl.useMutation();

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName,
        bio: profile.bio ?? "",
        city: profile.city ?? "",
        state: profile.state ?? "",
        phone: profile.phone ?? "",
        website: profile.website ?? "",
        instagramUrl: profile.instagramUrl ?? "",
        youtubeUrl: profile.youtubeUrl ?? "",
      });
      const match = profile.avatarUrl?.match(/dicebear\.com\/7\.x\/([^/]+)\//);
      setAvatarStyle(match?.[1] ?? "avataaars");
      setAvatarUrl(profile.avatarUrl ?? null);
      setCoverUrl(profile.coverUrl ?? null);
    }
  }, [profile]);

  const update = trpc.profiles.update.useMutation({
    onSuccess: () => { toast.success("Perfil atualizado!"); navigate(`/perfil/${profile?.slug?.toLowerCase()}`); },
    onError: (e) => toast.error(e.message),
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const avatarSeed = encodeURIComponent(form.displayName || "pnsp");

  // Derived: if user has a real uploaded avatar, use it; otherwise use DiceBear
  const effectiveAvatarUrl = avatarUrl && !avatarUrl.includes("dicebear.com")
    ? avatarUrl
    : null;

  async function handleFileUpload(
    file: File,
    type: "avatar" | "cover",
    setUploading: (v: boolean) => void,
    setPreview: (v: string | null) => void,
    setUrl: (v: string | null) => void,
  ) {
    const err = validateImage(file);
    if (err) { toast.error(err); return; }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const { presignedUrl, publicUrl } = await getPresignedUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type as AllowedType,
        fileSize: file.size,
        type,
      });

      // PUT directly to R2 from the browser
      const res = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!res.ok) throw new Error(`Upload falhou: ${res.status}`);

      setUrl(publicUrl);
      toast.success(type === "avatar" ? "Foto atualizada!" : "Capa atualizada!");
    } catch (e: any) {
      toast.error(e.message ?? "Erro no upload");
      setPreview(null);
      setUrl(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  }

  function handleSave() {
    // Decide final avatarUrl: real upload > DiceBear selector
    const finalAvatarUrl = (avatarUrl && !avatarUrl.includes("dicebear.com"))
      ? avatarUrl
      : `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}`;

    update.mutate({
      id: Number(params.id),
      ...form,
      avatarUrl: finalAvatarUrl,
      coverUrl: coverUrl ?? undefined,
    });
  }

  return (
    <PublicLayout>
      <div className="container py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Editar Perfil</h1>
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">

          {/* Cover upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">Imagem de Capa</label>
            <div
              className="relative h-32 rounded-xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/60 transition-colors"
              style={
                (coverPreview || coverUrl)
                  ? { backgroundImage: `url(${coverPreview ?? coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: "linear-gradient(135deg, #0d1f15 0%, #1a3a26 100%)" }
              }
              onClick={() => coverInputRef.current?.click()}
            >
              {uploadingCover ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-white/70">
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs">Clique para trocar a capa</span>
                </div>
              )}
              {(coverPreview || coverUrl) && !uploadingCover && (
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70"
                  onClick={e => { e.stopPropagation(); setCoverPreview(null); setCoverUrl(null); }}
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "cover", setUploadingCover, setCoverPreview, setCoverUrl);
                e.target.value = "";
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou WebP · máx. 5MB</p>
          </div>

          {/* Avatar upload + DiceBear fallback */}
          <div>
            <label className="text-sm font-medium mb-3 block">Foto de Perfil</label>
            <div className="flex items-start gap-4">
              {/* Current avatar preview */}
              <div className="relative flex-shrink-0">
                <img
                  src={
                    avatarPreview ??
                    (effectiveAvatarUrl
                      ? effectiveAvatarUrl
                      : `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}`)
                  }
                  alt="Avatar"
                  className="h-20 w-20 rounded-xl object-cover border-2 border-border bg-muted"
                />
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {uploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                </button>
              </div>

              {/* DiceBear fallback selector (only when no real photo) */}
              {!effectiveAvatarUrl && !avatarPreview && (
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">Ou escolha um avatar gerado:</p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {AVATAR_STYLES.map(style => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setAvatarStyle(style.id)}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border-2 transition-all ${
                          avatarStyle === style.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${avatarSeed}`}
                          alt={style.label}
                          className="w-9 h-9 rounded-md"
                        />
                        <span className="text-[10px] text-muted-foreground leading-none">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Remove uploaded photo */}
              {(effectiveAvatarUrl || avatarPreview) && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline mt-1"
                  onClick={() => { setAvatarUrl(null); setAvatarPreview(null); }}
                >
                  Remover foto
                </button>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "avatar", setUploadingAvatar, setAvatarPreview, setAvatarUrl);
                e.target.value = "";
              }}
            />
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG ou WebP · máx. 5MB</p>
          </div>

          <div><label className="text-sm font-medium mb-1 block">Nome / Nome Artistico</label><Input value={form.displayName} onChange={e => set("displayName", e.target.value)} /></div>
          <div><label className="text-sm font-medium mb-1 block">Biografia</label><Textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={4} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Cidade</label><Input value={form.city} onChange={e => set("city", e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Estado</label><Select value={form.state} onValueChange={(v) => set("state", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Telefone</label><Input value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
          <div><label className="text-sm font-medium mb-1 block">Instagram</label><Input value={form.instagramUrl} onChange={e => set("instagramUrl", e.target.value)} /></div>
          <div><label className="text-sm font-medium mb-1 block">YouTube</label><Input value={form.youtubeUrl} onChange={e => set("youtubeUrl", e.target.value)} /></div>

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={update.isPending || uploadingAvatar || uploadingCover}
          >
            {update.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar Alterações"}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
