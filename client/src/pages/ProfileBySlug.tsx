import { useParams, useLocation } from "wouter";
import { useRef, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { PROFILE_TYPES } from "@shared/pnsp";
import {
  MapPin, Globe, Youtube, Award, Phone, Music, ExternalLink,
  Pencil, Camera, ImagePlus, Loader2, Calendar,
} from "lucide-react";

/* ─── Icons ─────────────────────────────────────────────────────────────────── */
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-pbs" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#F77737" />
          <stop offset="50%" stopColor="#E1306C" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-pbs)" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.7" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </svg>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "")}`;
}
function instagramHref(url: string) {
  const t = url.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://www.instagram.com/${t.replace(/^@/, "").replace(/^(?:www\.)?instagram\.com\//i, "")}`;
}

const coverGradient = (type?: string | null) => ({
  artista_solo:    "linear-gradient(135deg, #1a0a00 0%, #3d1f00 100%)",
  grupo_banda:     "linear-gradient(135deg, #1a1200 0%, #3d2d00 100%)",
  produtor:        "linear-gradient(135deg, #0a0a1a 0%, #1a0a3d 100%)",
  professor:       "linear-gradient(135deg, #001525 0%, #003050 100%)",
  estudio:         "linear-gradient(135deg, #001a0a 0%, #003d1a 100%)",
  luthier:         "linear-gradient(135deg, #1a0e00 0%, #3d2200 100%)",
  contratante:     "linear-gradient(135deg, #001a22 0%, #003344 100%)",
}[type ?? ""] ?? "linear-gradient(135deg, var(--terra-escura), var(--terra-clara))");

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as AllowedType)) return "Formato inválido. Use JPG, PNG ou WebP.";
  if (file.size > MAX_SIZE) return "Arquivo muito grande. Máximo 5MB.";
  return null;
}

/* ─── Btn link helper ────────────────────────────────────────────────────────── */
function ActionBtn({ href, children, primary }: { href?: string; children: React.ReactNode; primary?: boolean; onClick?: () => void }) {
  const [h, setH] = useState(false);
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 20px",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    transition: "var(--transition)",
    textDecoration: "none",
    ...(primary
      ? { background: h ? "var(--ouro-claro)" : "var(--ouro)", color: "var(--preto)", boxShadow: h ? "0 6px 24px rgba(212,146,10,0.40)" : "var(--shadow-ouro)", transform: h ? "translateY(-1px)" : "none" }
      : { background: "none", border: "1px solid var(--creme-20)", color: h ? "var(--ouro)" : "var(--creme-80)", borderColor: h ? "rgba(212,146,10,0.40)" : "var(--creme-20)" }),
  };
  if (href) return <a href={href} style={base} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>{children}</a>;
  return <button type="button" style={base} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>{children}</button>;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function ProfileBySlug() {
  const params = useParams<{ slug: string }>();
  const slug = (params.slug ?? "").toLowerCase();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: profile, isLoading, error, refetch } = trpc.profiles.getBySlug.useQuery(
    { slug },
    { enabled: !!slug, staleTime: 5 * 60 * 1000 },
  );

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const getPresignedUrl = trpc.upload.getPresignedUrl.useMutation();
  const updateProfile = trpc.profiles.update.useMutation({ onSuccess: () => refetch() });
  const isOwner = !!user && !!profile && user.id === profile.userId;

  async function handleFileUpload(file: File, type: "avatar" | "cover", setUploading: (v: boolean) => void) {
    const err = validateImage(file);
    if (err) { toast.error(err); return; }
    setUploading(true);
    try {
      const { presignedUrl, publicUrl } = await getPresignedUrl.mutateAsync({
        fileName: file.name, contentType: file.type as AllowedType, fileSize: file.size, type,
      });
      const res = await fetch(presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!res.ok) throw new Error(`Upload falhou: ${res.status}`);
      await updateProfile.mutateAsync({ id: profile!.id, ...(type === "avatar" ? { avatarUrl: publicUrl } : { coverUrl: publicUrl }) });
      toast.success(type === "avatar" ? "Foto atualizada!" : "Capa atualizada!");
    } catch (e: any) { toast.error(e.message ?? "Erro no upload"); }
    finally { setUploading(false); }
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <PublicLayout>
        <div className="skeleton" style={{ height: 280 }} />
        <div style={{ padding: "0 24px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: -56, marginBottom: 32 }}>
            <div className="skeleton" style={{ width: 112, height: 112, borderRadius: "var(--radius-lg)", flexShrink: 0 }} />
            <div style={{ flex: 1, paddingBottom: 8 }}>
              <div className="skeleton" style={{ height: 36, width: 280, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 22, width: 120, borderRadius: 9999 }} />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !profile) {
    return (
      <PublicLayout>
        <div style={{ textAlign: "center", padding: "96px 24px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", marginBottom: 12 }}>Perfil não encontrado</div>
          <p style={{ color: "var(--creme-50)", marginBottom: 28 }}>O perfil que você procura não existe ou foi removido.</p>
          <a href="/perfis" className="pnsp-btn-ghost" style={{ padding: "10px 24px" }}>← Ver todos os perfis</a>
        </div>
      </PublicLayout>
    );
  }

  const specialties = Array.isArray(profile.specialties) ? profile.specialties as string[] : [];
  const instruments = Array.isArray(profile.instruments) ? profile.instruments as string[] : [];
  const genres = Array.isArray(profile.genres) ? profile.genres as string[] : [];
  const portfolio = Array.isArray(profile.portfolio) ? profile.portfolio : [];
  const memberYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : null;

  return (
    <PublicLayout>

      {/* ─── COVER ──────────────────────────────────────────────────────────── */}
      <div style={{
        height: 280,
        position: "relative",
        overflow: "hidden",
        background: profile.coverUrl ? undefined : coverGradient(profile.profileType),
      }}>
        {profile.coverUrl && (
          <img src={profile.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(12,10,8,0.90) 100%)" }} />

        {/* Trocar capa */}
        {isOwner && (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            style={{
              position: "absolute", top: 16, right: 16,
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px",
              background: "rgba(12,10,8,0.70)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--creme-20)",
              borderRadius: "var(--radius-full)",
              color: "var(--creme-80)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              transition: "var(--transition)",
            }}
          >
            {uploadingCover ? <Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> : <ImagePlus style={{ width: 13, height: 13 }} />}
            Trocar capa
          </button>
        )}
        <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "cover", setUploadingCover); e.target.value = ""; }} />
      </div>

      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: "0 24px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 24, marginTop: -56, marginBottom: 0, position: "relative", zIndex: 2 }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.displayName)}`}
              alt={profile.displayName}
              style={{
                width: 112, height: 112,
                borderRadius: "var(--radius-lg)",
                objectFit: "cover",
                border: `3px solid ${profile.isVerified ? "var(--ouro)" : "rgba(245,237,216,0.20)"}`,
                boxShadow: profile.isVerified ? "0 0 0 4px rgba(212,146,10,0.20)" : "none",
                background: "var(--terra)",
              }}
            />
            {isOwner && (
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  position: "absolute", bottom: -6, right: -6,
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--ouro)", color: "var(--preto)",
                  border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "var(--shadow-md)", cursor: "pointer",
                }}
              >
                {uploadingAvatar ? <Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> : <Camera style={{ width: 13, height: 13 }} />}
              </button>
            )}
          </div>
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "avatar", setUploadingAvatar); e.target.value = ""; }} />

          {/* Name & meta */}
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, lineHeight: 1.1, color: "var(--creme)" }}>
                {profile.displayName}
              </h1>
              {profile.isVerified && (
                <div style={{ background: "var(--verde)", borderRadius: "50%", padding: 4, flexShrink: 0 }}>
                  <Award style={{ width: 14, height: 14, color: "white" }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              <span className="pnsp-badge">
                {PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES] || profile.profileType?.replace(/_/g, " ")}
              </span>
              {profile.city && (
                <span style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)", display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin style={{ width: 13, height: 13 }} />{profile.city}, {profile.state}
                </span>
              )}
            </div>
            {/* Badges de qualidade */}
            {(() => {
              const isAllStar = !!(profile.avatarUrl && profile.bio && profile.city && profile.phone && profile.coverUrl);
              if (!isAllStar && !profile.isVerified) return null;
              return (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {isAllStar && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 9999,
                      background: "rgba(27,107,58,0.20)", color: "var(--verde)",
                      border: "1px solid rgba(27,107,58,0.40)",
                    }}>
                      ⭐ Perfil All-Star
                    </span>
                  )}
                  {profile.isVerified && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 9999,
                      background: "rgba(37,99,235,0.20)", color: "#60A5FA",
                      border: "1px solid rgba(37,99,235,0.40)",
                    }}>
                      ✓ Verificado
                    </span>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 4 }}>
            {isOwner && (
              <ActionBtn primary onClick={() => navigate("/dashboard")}>
                <Pencil style={{ width: 13, height: 13 }} /> Editar perfil
              </ActionBtn>
            )}
            {profile.phone && (
              <ActionBtn href={phoneHref(profile.phone)}>
                <Phone style={{ width: 13, height: 13 }} /> Contato
              </ActionBtn>
            )}
            {profile.instagramUrl && (
              <ActionBtn href={instagramHref(profile.instagramUrl)}>
                <InstagramIcon size={14} />
              </ActionBtn>
            )}
            {profile.youtubeUrl && (
              <ActionBtn href={profile.youtubeUrl}>
                <Youtube style={{ width: 14, height: 14 }} />
              </ActionBtn>
            )}
            {profile.website && (
              <ActionBtn href={profile.website}>
                <Globe style={{ width: 13, height: 13 }} />
              </ActionBtn>
            )}
          </div>
        </div>
      </div>

      {/* ─── BODY ───────────────────────────────────────────────────────────── */}
      <div style={{ padding: "40px 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32 }}>

          {/* Main */}
          <div style={{ minWidth: 0 }}>
            {profile.bio && (
              <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: "28px 28px", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 14, color: "var(--ouro)" }}>
                  Sobre
                </h2>
                <p style={{ color: "var(--creme-80)", lineHeight: 1.7, whiteSpace: "pre-wrap", fontSize: "var(--text-base)" }}>
                  {profile.bio}
                </p>
              </div>
            )}

            {portfolio.length > 0 && (
              <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: "28px", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 16, color: "var(--ouro)" }}>
                  Portfólio
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {portfolio.map((item) => {
                    const [h, setH] = useState(false);
                    return (
                      <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: "block", aspectRatio: "1/1", borderRadius: "var(--radius-md)", overflow: "hidden", border: `1px solid ${h ? "rgba(212,146,10,0.40)" : "var(--creme-10)"}`, background: "var(--terra-escura)", position: "relative", transition: "var(--transition)" }}
                        onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
                      >
                        {item.mediaType === "image" ? (
                          <img src={item.url} alt={item.title ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", transform: h ? "scale(1.06)" : "scale(1)", transition: "transform 0.4s ease" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: 10 }}>
                            <Music style={{ width: 28, height: 28, color: "var(--ouro)" }} />
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", textAlign: "center", lineHeight: 1.3 }}>{item.title}</span>
                          </div>
                        )}
                        {h && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ExternalLink style={{ width: 18, height: 18, color: "white" }} />
                          </div>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Stats */}
            <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: 16, color: "var(--creme)" }}>Resumo</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {memberYear && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--creme-50)", fontSize: "var(--text-sm)" }}>
                    <Calendar style={{ width: 14, height: 14, flexShrink: 0, color: "var(--ouro)" }} />
                    Membro desde {memberYear}
                  </div>
                )}
                {profile.city && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--creme-50)", fontSize: "var(--text-sm)" }}>
                    <MapPin style={{ width: 14, height: 14, flexShrink: 0, color: "var(--ouro)" }} />
                    {profile.city}, {profile.state}
                  </div>
                )}
                {profile.spotifyUrl && (
                  <a href={profile.spotifyUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--creme-50)", fontSize: "var(--text-sm)", transition: "color 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#1DB954"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--creme-50)"; }}
                  >
                    <Music style={{ width: 14, height: 14, flexShrink: 0, color: "#1DB954" }} />
                    Ouvir no Spotify
                  </a>
                )}
                {profile.phone && (
                  <a href={phoneHref(profile.phone)}
                    style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--creme-50)", fontSize: "var(--text-sm)", transition: "color 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--ouro)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--creme-50)"; }}
                  >
                    <Phone style={{ width: 14, height: 14, flexShrink: 0, color: "var(--ouro)" }} />
                    {profile.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Tags */}
            {(specialties.length > 0 || instruments.length > 0 || genres.length > 0) && (
              <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
                {genres.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ouro)", marginBottom: 10 }}>Gêneros</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {genres.map(g => <span key={g} className="pnsp-badge" style={{ fontSize: "var(--text-xs)" }}>{g}</span>)}
                    </div>
                  </div>
                )}
                {instruments.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--creme-50)", marginBottom: 10 }}>Instrumentos</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {instruments.map(i => (
                        <span key={i} style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: "var(--text-xs)", border: "1px solid var(--creme-20)", color: "var(--creme-80)", fontFamily: "var(--font-body)" }}>{i}</span>
                      ))}
                    </div>
                  </div>
                )}
                {specialties.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--creme-50)", marginBottom: 10 }}>Especialidades</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {specialties.map(s => (
                        <span key={s} style={{ padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: "var(--text-xs)", border: "1px solid var(--creme-20)", color: "var(--creme-80)", fontFamily: "var(--font-body)" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
