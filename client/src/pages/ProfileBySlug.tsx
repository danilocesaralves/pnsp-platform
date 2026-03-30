import { useParams, useLocation } from "wouter";
import { useRef, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { PROFILE_TYPES } from "@shared/pnsp";
import ReviewSection, { StarDisplay } from "@/components/ReviewSection";
import MemoryTimeline from "@/components/MemoryTimeline";
import SEO from "@/components/SEO";
import SchemaOrg from "@/components/SchemaOrg";
import ShareButton from "@/components/ShareButton";
import {
  MapPin, Globe, Youtube, Award, Phone, Music, ExternalLink,
  Pencil, Camera, ImagePlus, Loader2, Calendar, MessageSquare, FileText,
} from "lucide-react";
import { NewBookingForm } from "@/components/BookingFlow";

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
  artista_solo:    "linear-gradient(135deg, #2d1800, #1a0d00)",
  grupo_banda:     "linear-gradient(135deg, #2d1800, #1a0d00)",
  produtor:        "linear-gradient(135deg, #0d0d2d, #060617)",
  professor:       "linear-gradient(135deg, #0d0d2d, #060617)",
  estudio:         "linear-gradient(135deg, #002d0d, #001a06)",
  luthier:         "linear-gradient(135deg, #1a1400, #2d2000)",
  contratante:     "linear-gradient(135deg, #1a1400, #2d2000)",
  venue:           "linear-gradient(135deg, #1a001a, #2d002d)",
}[type ?? ""] ?? "linear-gradient(135deg, #1a1400, #2d2000)");

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as AllowedType)) return "Formato inválido. Use JPG, PNG ou WebP.";
  if (file.size > MAX_SIZE) return "Arquivo muito grande. Máximo 5MB.";
  return null;
}

/* ─── PortfolioItem ──────────────────────────────────────────────────────────── */
function PortfolioItem({ item }: { item: any }) {
  const [h, setH] = useState(false);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block", aspectRatio: "1/1", borderRadius: "var(--radius-md)",
        overflow: "hidden",
        border: `1px solid ${h ? "rgba(212,146,10,0.40)" : "var(--creme-10)"}`,
        background: "var(--terra-escura)", position: "relative",
        transition: "var(--transition)",
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      {item.mediaType === "image" ? (
        <img
          src={item.url}
          alt={item.title ?? ""}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: h ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.4s ease",
          }}
        />
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
}

/* ─── Btn link helper ────────────────────────────────────────────────────────── */
function ActionBtn({ href, children, primary }: { href?: string; children: React.ReactNode; primary?: boolean; onClick?: () => void }) {
  const [h, setH] = useState(false);
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    transition: "var(--transition)",
    textDecoration: "none",
    ...(primary
      ? { background: h ? "#c4910f" : "#D4A017", color: "var(--preto)", padding: "12px 28px", borderRadius: 10, boxShadow: h ? "0 6px 24px rgba(212,146,10,0.40)" : "var(--shadow-ouro)", transform: h ? "translateY(-1px)" : "none" }
      : { background: "none", border: "1px solid var(--creme-20)", color: h ? "var(--ouro)" : "var(--creme-80)", borderColor: h ? "rgba(212,146,10,0.40)" : "var(--creme-20)", padding: "9px 20px", borderRadius: "var(--radius-md)" }),
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

  const { data: reviewStats } = trpc.reviews.getStats.useQuery(
    { profileId: profile?.id ?? 0 },
    { enabled: !!profile?.id },
  );
  const { data: myProfile } = trpc.profiles.getMyProfile.useQuery(
    undefined,
    { enabled: !!user },
  );

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const getPresignedUrl = trpc.upload.getPresignedUrl.useMutation();
  const updateProfile = trpc.profiles.update.useMutation({ onSuccess: () => refetch() });
  const getOrCreateConversation = trpc.chat.getOrCreateConversation.useMutation();
  const isOwner = !!user && !!profile && user.id === profile.userId;

  async function handleStartChat() {
    if (!profile || !myProfile) return;
    setStartingChat(true);
    try {
      await getOrCreateConversation.mutateAsync({ otherProfileId: profile.id });
      navigate(`/mensagens?profileId=${profile.id}`);
    } catch {
      // ignore
    } finally {
      setStartingChat(false);
    }
  }

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
      <SEO
        title={profile.displayName}
        description={profile.bio ?? undefined}
        image={profile.avatarUrl ?? undefined}
      />
      <SchemaOrg
        type={profile.profileType === "grupo_banda" ? "musicgroup" : "person"}
        name={profile.displayName}
        description={profile.bio ?? undefined}
        image={profile.avatarUrl ?? undefined}
        url={`https://pnsp-platform.vercel.app/perfil/${profile.slug}`}
        genres={genres}
        city={profile.city ?? undefined}
      />

      {/* ─── CAPA + AVATAR ──────────────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "visible" }}>
        <div style={{
          height: 240,
          width: "100%",
          position: "relative",
          overflow: "hidden",
          background: coverGradient(profile.profileType),
        }}>
          {profile.coverUrl && (
            <img src={profile.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(10,8,0,0.85) 100%)" }} />
          {isOwner && (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              style={{
                position: "absolute", top: 16, right: 16,
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px",
                background: "rgba(10,8,0,0.70)",
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

        {/* Avatar — bottom:-52px sobe sobre a capa */}
        <div style={{ position: "absolute", bottom: -52, left: 32, zIndex: 3 }}>
          <div style={{ position: "relative" }}>
            <img
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.displayName)}&backgroundColor=D4A017&textColor=0a0a0a&fontWeight=700&fontSize=40&radius=50`}
              alt={profile.displayName}
              style={{
                width: 104, height: 104,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #D4A017",
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
        </div>
      </div>
      <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "avatar", setUploadingAvatar); e.target.value = ""; }} />

      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: "0 24px", maxWidth: 1280, margin: "0 auto" }}>

        {/* Name, meta & action buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, paddingTop: 80, paddingBottom: 16 }}>
          {/* Name & meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, lineHeight: 1.1, color: "var(--creme)" }}>
                {profile.displayName}
              </h1>
              {profile.isVerified && (
                <div style={{ background: "var(--verde)", borderRadius: "50%", padding: 4, flexShrink: 0 }}>
                  <Award style={{ width: 14, height: 14, color: "white" }} />
                </div>
              )}
            </div>
            {reviewStats && reviewStats.total > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <StarDisplay rating={reviewStats.avg} size={18} />
                <span style={{ color: "#D4A017", fontWeight: 700, fontSize: 15 }}>{reviewStats.avg.toFixed(1)}</span>
                <span style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)" }}>({reviewStats.total} {reviewStats.total === 1 ? "avaliação" : "avaliações"})</span>
              </div>
            )}
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
            {(() => {
              const isAllStar = !!(profile.avatarUrl && profile.bio && profile.city && profile.phone && profile.coverUrl);
              if (!isAllStar && !profile.isVerified) return null;
              return (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {isAllStar && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, background: "rgba(27,107,58,0.20)", color: "var(--verde)", border: "1px solid rgba(27,107,58,0.40)" }}>
                      ⭐ Perfil All-Star
                    </span>
                  )}
                  {profile.isVerified && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, background: "rgba(37,99,235,0.20)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.40)" }}>
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
            {!isOwner && user && myProfile && (
              <button
                type="button"
                onClick={() => setShowBookingForm(v => !v)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "10px 20px",
                  background: "var(--ouro-sutil)",
                  border: "1px solid rgba(212,146,10,0.40)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--ouro)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 700,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  transition: "var(--transition)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(212,146,10,0.20)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--ouro-sutil)"; }}
              >
                <FileText style={{ width: 14, height: 14 }} />
                Propor contratação
              </button>
            )}
            {!isOwner && user && myProfile && (
              <button
                type="button"
                onClick={handleStartChat}
                disabled={startingChat}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "10px 20px",
                  background: "var(--terra)",
                  border: "1px solid var(--creme-20)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--creme-80)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  cursor: startingChat ? "not-allowed" : "pointer",
                  transition: "var(--transition)",
                  opacity: startingChat ? 0.7 : 1,
                }}
                onMouseEnter={e => { if (!startingChat) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.40)"; (e.currentTarget as HTMLElement).style.color = "var(--ouro)"; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--creme-20)"; (e.currentTarget as HTMLElement).style.color = "var(--creme-80)"; }}
              >
                {startingChat
                  ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                  : <MessageSquare style={{ width: 14, height: 14 }} />
                }
                Enviar mensagem
              </button>
            )}
            {profile.phone && (
              <a
                href={`https://wa.me/55${profile.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, background: "#25D366", color: "white", fontWeight: 700, fontSize: "var(--text-sm)", fontFamily: "var(--font-body)", textDecoration: "none", transition: "opacity 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            )}
            {profile.instagramUrl && (
              <a
                href={instagramHref(profile.instagramUrl)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", color: "white", fontWeight: 700, fontSize: "var(--text-sm)", fontFamily: "var(--font-body)", textDecoration: "none", transition: "opacity 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </a>
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
            <ShareButton slug={profile.slug} name={profile.displayName} />
          </div>
        </div>
      </div>

      {/* ─── BOOKING FORM INLINE ────────────────────────────────────────────── */}
      {showBookingForm && profile && myProfile && (
        <div style={{ padding: "0 24px 24px", maxWidth: 1280, margin: "0 auto" }}>
          <NewBookingForm
            artistProfileId={profile.id}
            onSuccess={() => { setShowBookingForm(false); navigate("/negociacoes"); }}
            onCancel={() => setShowBookingForm(false)}
          />
        </div>
      )}

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

            <ReviewSection profileId={profile.id} isOwner={isOwner} currentUserProfileId={myProfile?.id} />

            <MemoryTimeline profileId={profile.id} isOwner={isOwner} myProfileId={myProfile?.id} />

            {portfolio.length > 0 && (
              <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: "28px", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 16, color: "var(--ouro)" }}>
                  Portfólio
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                  {portfolio.map((item) => (
                    <PortfolioItem key={item.id} item={item} />
                  ))}
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
                {(profile as any).priceMin != null && (
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#D4A017" }}>
                    💰 Cachê: R$ {Number((profile as any).priceMin).toLocaleString("pt-BR")}
                    {(profile as any).priceMax != null && ` — R$ ${Number((profile as any).priceMax).toLocaleString("pt-BR")}`}
                  </div>
                )}
                {(profile as any).durationMin && (
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#D4A017" }}>
                    ⏱ Duração: {(profile as any).durationMin}
                    {(profile as any).durationMax && (profile as any).durationMax !== (profile as any).durationMin
                      ? ` — ${(profile as any).durationMax}` : ""}
                  </div>
                )}
                {(profile as any).cities && (
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#D4A017" }}>
                    📍 Atua em: {(profile as any).cities}
                  </div>
                )}
                {instruments.length > 0 && (
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "#D4A017" }}>
                    🎸 Instrumentos: {instruments.join(", ")}
                  </div>
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
