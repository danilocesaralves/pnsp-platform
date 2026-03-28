import { useParams, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, ImagePlus, Loader2, X, Save } from "lucide-react";

const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const DURATIONS = ["30min","1h","1h30","2h","2h30","3h","A combinar"];
const SHOW_TYPES = ["Pagode de mesa","Samba de roda","Show em palco","Serestas","Eventos corporativos","Festas e casamentos"];

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as AllowedType)) return "Formato inválido. Use JPG, PNG ou WebP.";
  if (file.size > MAX_SIZE) return "Arquivo muito grande. Máximo 5MB.";
  return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#1a1200', border: '1px solid rgba(212,160,23,0.15)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#D4A017', marginBottom: 20, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div style={{ flex: half ? '1 1 calc(50% - 8px)' : '1 1 100%', minWidth: 0 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(237,236,234,0.6)', marginBottom: 6, letterSpacing: '0.03em' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(212,160,23,0.15)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
  color: 'var(--creme)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...inputStyle, ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,160,23,0.5)'; props.onFocus?.(e); }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(212,160,23,0.15)'; props.onBlur?.(e); }}
    />
  );
}

function StyledTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...inputStyle, resize: 'vertical', minHeight: 100, ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,160,23,0.5)'; props.onFocus?.(e); }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(212,160,23,0.15)'; props.onBlur?.(e); }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EditProfile() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { data: profile } = trpc.profiles.getById.useQuery({ id: Number(params.id) }, { enabled: !!params.id });

  const [form, setForm] = useState({
    displayName: "", bio: "", city: "", state: "", phone: "",
    website: "", instagramUrl: "", youtubeUrl: "",
    priceMin: "", priceMax: "", durationMin: "", durationMax: "",
    cities: "", instrumentsText: "",
  });
  const [showTypes, setShowTypes] = useState<string[]>([]);

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
      const p = profile as any;
      setForm({
        displayName: profile.displayName,
        bio: profile.bio ?? "",
        city: profile.city ?? "",
        state: profile.state ?? "",
        phone: profile.phone ?? "",
        website: profile.website ?? "",
        instagramUrl: profile.instagramUrl ?? "",
        youtubeUrl: profile.youtubeUrl ?? "",
        priceMin: p.priceMin != null ? String(p.priceMin) : "",
        priceMax: p.priceMax != null ? String(p.priceMax) : "",
        durationMin: p.durationMin ?? "",
        durationMax: p.durationMax ?? "",
        cities: p.cities ?? "",
        instrumentsText: Array.isArray(p.instruments) ? (p.instruments as string[]).join(", ") : "",
      });
      setShowTypes(Array.isArray(p.showTypes) ? p.showTypes as string[] : []);
      setAvatarUrl(profile.avatarUrl ?? null);
      setCoverUrl(profile.coverUrl ?? null);
    }
  }, [profile]);

  const update = trpc.profiles.update.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado!");
      navigate(`/perfil/${profile?.slug?.toLowerCase()}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const hasRealAvatar = avatarUrl && !avatarUrl.includes("dicebear.com");
  const avatarSeed = encodeURIComponent(form.displayName || "pnsp");
  const displayAvatar = avatarPreview
    ?? (hasRealAvatar ? avatarUrl : `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}&backgroundColor=D4A017&textColor=0a0a0a&fontWeight=700&fontSize=40&radius=50`);

  async function handleFileUpload(
    file: File,
    type: "avatar" | "cover",
    setUploading: (v: boolean) => void,
    setPreview: (v: string | null) => void,
    setUrl: (v: string | null) => void,
  ) {
    const err = validateImage(file);
    if (err) { toast.error(err); return; }
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
      const res = await fetch(presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
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
    const finalAvatarUrl = hasRealAvatar
      ? avatarUrl!
      : `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}&backgroundColor=D4A017&textColor=0a0a0a&fontWeight=700&fontSize=40&radius=50`;

    const { priceMin, priceMax, durationMin, durationMax, cities, instrumentsText, ...baseForm } = form;
    update.mutate({
      id: Number(params.id),
      ...baseForm,
      avatarUrl: finalAvatarUrl,
      coverUrl: coverUrl ?? undefined,
      priceMin: priceMin ? parseInt(priceMin) : undefined,
      priceMax: priceMax ? parseInt(priceMax) : undefined,
      durationMin: durationMin || undefined,
      durationMax: durationMax || undefined,
      showTypes: showTypes.length > 0 ? showTypes : undefined,
      cities: cities || undefined,
      instruments: instrumentsText ? instrumentsText.split(",").map(s => s.trim()).filter(Boolean) : undefined,
    });
  }

  const isSaving = update.isPending || uploadingAvatar || uploadingCover;

  return (
    <PublicLayout>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 16px 80px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--creme)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
            Editar Perfil
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(237,236,234,0.5)' }}>
            Quanto mais completo, mais você aparece nas buscas
          </p>
        </div>

        {/* ── Imagens ─────────────────────────────────────────────────────── */}
        <SectionCard title="Imagens">
          {/* Cover */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(237,236,234,0.6)', marginBottom: 8, letterSpacing: '0.03em' }}>FOTO DE CAPA</label>
            <div
              onClick={() => coverInputRef.current?.click()}
              style={{
                position: 'relative', height: 140, borderRadius: 12, overflow: 'hidden',
                border: '2px dashed rgba(212,160,23,0.25)', cursor: 'pointer',
                backgroundImage: (coverPreview || coverUrl) ? `url(${coverPreview ?? coverUrl})` : 'linear-gradient(135deg, #0d1a0a, #1a3015)',
                backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,160,23,0.5)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,160,23,0.25)'; }}
            >
              {uploadingCover ? (
                <Loader2 style={{ width: 24, height: 24, color: 'white', animation: 'spin 1s linear infinite' }} />
              ) : !(coverPreview || coverUrl) && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)' }}>
                  <ImagePlus style={{ width: 24, height: 24 }} />
                  <span style={{ fontSize: 12 }}>Clique para enviar capa</span>
                </div>
              )}
              {(coverPreview || coverUrl) && !uploadingCover && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setCoverPreview(null); setCoverUrl(null); }}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X style={{ width: 14, height: 14, color: 'white' }} />
                </button>
              )}
            </div>
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "cover", setUploadingCover, setCoverPreview, setCoverUrl); e.target.value = ""; }} />
            <p style={{ fontSize: 11, color: 'rgba(237,236,234,0.3)', marginTop: 6 }}>JPG, PNG ou WebP · máx. 5MB · proporção 16:9 recomendada</p>
          </div>

          {/* Avatar */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(237,236,234,0.6)', marginBottom: 8, letterSpacing: '0.03em' }}>FOTO DE PERFIL</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={displayAvatar!}
                  alt="Avatar"
                  style={{ width: 80, height: 80, borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(212,160,23,0.4)', background: '#1a1200' }}
                />
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  style={{ position: 'absolute', bottom: -6, right: -6, background: '#D4A017', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {uploadingAvatar ? <Loader2 style={{ width: 12, height: 12, color: '#0A0800', animation: 'spin 1s linear infinite' }} /> : <Camera style={{ width: 12, height: 12, color: '#0A0800' }} />}
                </button>
              </div>
              <div>
                <p style={{ fontSize: 13, color: 'var(--creme)', fontWeight: 500, marginBottom: 4 }}>
                  {hasRealAvatar || avatarPreview ? 'Foto enviada' : 'Avatar gerado automaticamente'}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(237,236,234,0.4)', marginBottom: 8 }}>
                  {hasRealAvatar || avatarPreview ? 'Clique no ícone para trocar' : 'Envie uma foto para substituir o avatar'}
                </p>
                {(hasRealAvatar || avatarPreview) && (
                  <button
                    type="button"
                    onClick={() => { setAvatarUrl(null); setAvatarPreview(null); }}
                    style={{ fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Remover foto
                  </button>
                )}
              </div>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "avatar", setUploadingAvatar, setAvatarPreview, setAvatarUrl); e.target.value = ""; }} />
          </div>
        </SectionCard>

        {/* ── Informações Básicas ──────────────────────────────────────────── */}
        <SectionCard title="Informações Básicas">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Field label="Nome / Nome Artístico">
              <StyledInput value={form.displayName} onChange={e => set("displayName", e.target.value)} placeholder="Seu nome artístico" />
            </Field>
            <Field label="Biografia">
              <StyledTextarea value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Conte sobre você, sua trajetória, estilo musical..." rows={4} />
            </Field>
            <Field label="Cidade" half>
              <StyledInput value={form.city} onChange={e => set("city", e.target.value)} placeholder="Ex: São Paulo" />
            </Field>
            <Field label="Estado" half>
              <Select value={form.state} onValueChange={v => set("state", v)}>
                <SelectTrigger style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Telefone / WhatsApp" half>
              <StyledInput value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(11) 99999-9999" />
            </Field>
            <Field label="Site / Link" half>
              <StyledInput value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://..." />
            </Field>
          </div>
        </SectionCard>

        {/* ── Redes Sociais ────────────────────────────────────────────────── */}
        <SectionCard title="Redes Sociais">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Field label="Instagram" half>
              <StyledInput value={form.instagramUrl} onChange={e => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/..." />
            </Field>
            <Field label="YouTube" half>
              <StyledInput value={form.youtubeUrl} onChange={e => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/..." />
            </Field>
          </div>
        </SectionCard>

        {/* ── Apresentação ─────────────────────────────────────────────────── */}
        <SectionCard title="Apresentação">
          {/* Cachê */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(237,236,234,0.4)', marginBottom: 12, letterSpacing: '0.03em' }}>CACHÊ (R$)</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <Field label="Mínimo" half>
                <StyledInput type="number" value={form.priceMin} onChange={e => set("priceMin", e.target.value)} placeholder="Ex: 500" min={0} />
              </Field>
              <Field label="Máximo" half>
                <StyledInput type="number" value={form.priceMax} onChange={e => set("priceMax", e.target.value)} placeholder="Ex: 3000" min={0} />
              </Field>
            </div>
          </div>

          {/* Duração */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(237,236,234,0.4)', marginBottom: 12, letterSpacing: '0.03em' }}>DURAÇÃO DO SHOW</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <Field label="Mínima" half>
                <Select value={form.durationMin} onValueChange={v => set("durationMin", v)}>
                  <SelectTrigger style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Máxima" half>
                <Select value={form.durationMax} onValueChange={v => set("durationMax", v)}>
                  <SelectTrigger style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* Tipo de show */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(237,236,234,0.4)', marginBottom: 12, letterSpacing: '0.03em' }}>TIPO DE APRESENTAÇÃO</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {SHOW_TYPES.map(tipo => (
                <label key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', borderRadius: 8, border: `1px solid ${showTypes.includes(tipo) ? 'rgba(212,160,23,0.4)' : 'rgba(255,255,255,0.06)'}`, background: showTypes.includes(tipo) ? 'rgba(212,160,23,0.08)' : 'transparent', transition: 'all 0.2s' }}>
                  <input
                    type="checkbox"
                    checked={showTypes.includes(tipo)}
                    onChange={e => setShowTypes(prev => e.target.checked ? [...prev, tipo] : prev.filter(t => t !== tipo))}
                    style={{ accentColor: '#D4A017', width: 14, height: 14, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, color: showTypes.includes(tipo) ? 'var(--creme)' : 'rgba(237,236,234,0.6)' }}>{tipo}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cidades + Instrumentos */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Field label="Cidades onde atua">
              <StyledInput value={form.cities} onChange={e => set("cities", e.target.value)} placeholder="Ex: São Paulo, Rio de Janeiro, Campinas" />
              <p style={{ fontSize: 11, color: 'rgba(237,236,234,0.3)', marginTop: 4 }}>Separe por vírgulas</p>
            </Field>
            <Field label="Instrumentos">
              <StyledInput value={form.instrumentsText} onChange={e => set("instrumentsText", e.target.value)} placeholder="Ex: Cavaquinho, Pandeiro, Violão 7 cordas" />
              <p style={{ fontSize: 11, color: 'rgba(237,236,234,0.3)', marginTop: 4 }}>Separe por vírgulas</p>
            </Field>
          </div>
        </SectionCard>

        {/* ── Salvar ───────────────────────────────────────────────────────── */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            width: '100%', padding: '14px 24px',
            background: isSaving ? 'rgba(212,160,23,0.4)' : '#D4A017',
            color: '#0A0800', fontWeight: 700, fontSize: 15,
            border: 'none', borderRadius: 12, cursor: isSaving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'var(--font-body)', transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (!isSaving) (e.currentTarget as HTMLElement).style.background = '#e8b520'; }}
          onMouseLeave={e => { if (!isSaving) (e.currentTarget as HTMLElement).style.background = '#D4A017'; }}
        >
          {isSaving
            ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />Salvando...</>
            : <><Save style={{ width: 16, height: 16 }} />Salvar Alterações</>
          }
        </button>

      </div>
    </PublicLayout>
  );
}
