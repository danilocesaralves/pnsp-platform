import { useParams, useLocation } from "wouter";
import { useRef, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { PROFILE_TYPES } from "@shared/pnsp";
import ReviewSection from "@/components/ReviewSection";
import MemoryTimeline from "@/components/MemoryTimeline";
import SEO from "@/components/SEO";
import SchemaOrg from "@/components/SchemaOrg";
import ShareButton from "@/components/ShareButton";
import {
  MapPin, Globe, Youtube, Music, ExternalLink,
  Pencil, Camera, ImagePlus, Loader2, MessageSquare, FileText,
} from "lucide-react";
import { NewBookingForm } from "@/components/BookingFlow";

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const GOLD = "#C9A84C";
const GOLD_BORDER = "rgba(201,168,76,0.4)";
const GOLD_BG = "rgba(201,168,76,0.15)";

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "")}`;
}
function instagramHref(url: string) {
  const t = url.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://www.instagram.com/${t.replace(/^@/, "").replace(/^(?:www\.)?instagram\.com\//i, "")}`;
}
function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as AllowedType)) return "Formato inválido. Use JPG, PNG ou WebP.";
  if (file.size > MAX_SIZE) return "Arquivo muito grande. Máximo 5MB.";
  return null;
}
const coverGradient = (type?: string | null) => ({
  artista_solo:   "linear-gradient(135deg, #2d1800, #0a0a0a)",
  grupo_banda:    "linear-gradient(135deg, #2d1800, #0a0a0a)",
  produtor:       "linear-gradient(135deg, #0d0d2d, #0a0a0a)",
  professor:      "linear-gradient(135deg, #0d0d2d, #0a0a0a)",
  estudio:        "linear-gradient(135deg, #002d0d, #0a0a0a)",
  luthier:        "linear-gradient(135deg, #1a1400, #0a0a0a)",
  contratante:    "linear-gradient(135deg, #1a1400, #0a0a0a)",
  venue:          "linear-gradient(135deg, #1a001a, #0a0a0a)",
}[type ?? ""] ?? "linear-gradient(135deg, #1a1a0e, #0a0a0a)");

/* ─── Subcomponents ─────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
      color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
      marginBottom: 12, fontFamily: "var(--font-body)",
    }}>
      {children}
    </div>
  );
}

function TagChip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 20, padding: "6px 14px",
      fontSize: 13, color: "#fff",
      whiteSpace: "nowrap", fontFamily: "var(--font-body)",
      flexShrink: 0,
    }}>
      {children}
    </span>
  );
}

function PortfolioCard({ item }: { item: any }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        width: 120, height: 120, flexShrink: 0,
        borderRadius: 12,
        border: `1px solid rgba(201,168,76,0.3)`,
        background: "rgba(201,168,76,0.05)",
        overflow: "hidden", textDecoration: "none",
      }}
    >
      {item.mediaType === "image" ? (
        <img src={item.url} alt={item.title ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 10 }}>
          <Music style={{ width: 24, height: 24, color: GOLD }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.3, fontFamily: "var(--font-body)" }}>
            {item.title}
          </span>
        </div>
      )}
    </a>
  );
}

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

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
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
  const [bioExpanded, setBioExpanded] = useState(false);

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
    } catch (e: any) {
      toast.error(e.message ?? "Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <PublicLayout>
        <div style={{ background: "#000", minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>
          <div className="skeleton" style={{ height: 200 }} />
          <div style={{ padding: "0 20px", marginTop: -44 }}>
            <div className="skeleton" style={{ width: 88, height: 88, borderRadius: "50%", marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 28, width: 200, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 22, width: 100, borderRadius: 20 }} />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !profile) {
    return (
      <PublicLayout>
        <div style={{ background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "96px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 28, marginBottom: 12, color: "#fff" }}>Perfil não encontrado</div>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 28, fontFamily: "var(--font-body)" }}>O perfil que você procura não existe ou foi removido.</p>
          <a href="/perfis" style={{ padding: "10px 24px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, color: "rgba(255,255,255,0.8)", textDecoration: "none", fontFamily: "var(--font-body)" }}>
            ← Ver todos os perfis
          </a>
        </div>
      </PublicLayout>
    );
  }

  const specialties = Array.isArray(profile.specialties) ? profile.specialties as string[] : [];
  const instruments = Array.isArray(profile.instruments) ? profile.instruments as string[] : [];
  const genres = Array.isArray(profile.genres) ? profile.genres as string[] : [];
  const portfolio = Array.isArray(profile.portfolio) ? profile.portfolio : [];
  const memberYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : null;
  const allTags = [...genres, ...specialties, ...instruments];
  const bioText = profile.bio
    ? (bioExpanded || profile.bio.length <= 200 ? profile.bio : profile.bio.slice(0, 200) + "…")
    : null;
  const hasPriceInfo = (profile as any).priceMin != null || (profile as any).durationMin || (profile as any).cities;

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

      <div style={{ background: "#000", minHeight: "100vh", color: "#fff" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>

          {/* ── 1. HERO COVER ──────────────────────────────────────────────── */}
          <div style={{ position: "relative", height: 200, overflow: "hidden", background: coverGradient(profile.profileType) }}>
            {profile.coverUrl && (
              <img
                src={profile.coverUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            )}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)",
            }} />
            {isOwner && (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                style={{
                  position: "absolute", top: 12, right: 12,
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px",
                  background: "rgba(0,0,0,0.65)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 20,
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 12, fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                }}
              >
                {uploadingCover
                  ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
                  : <ImagePlus style={{ width: 12, height: 12 }} />
                }
                Capa
              </button>
            )}
          </div>

          {/* ── 2. IDENTITY BLOCK ──────────────────────────────────────────── */}
          <div style={{ marginTop: -44, padding: "0 20px", position: "relative", zIndex: 2 }}>
            {/* Avatar */}
            <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
              <img
                src={profile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.displayName)}&backgroundColor=C9A84C&textColor=0a0a0a&fontWeight=700&fontSize=40&radius=50`}
                alt={profile.displayName}
                style={{
                  width: 88, height: 88,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `3px solid ${GOLD}`,
                  boxShadow: "0 0 0 4px rgba(201,168,76,0.2)",
                  background: "#1a1a0e",
                  display: "block",
                }}
              />
              {isOwner && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  style={{
                    position: "absolute", bottom: -4, right: -4,
                    width: 26, height: 26, borderRadius: "50%",
                    background: GOLD, color: "#000",
                    border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                  }}
                >
                  {uploadingAvatar
                    ? <Loader2 style={{ width: 11, height: 11, animation: "spin 1s linear infinite" }} />
                    : <Camera style={{ width: 11, height: 11 }} />
                  }
                </button>
              )}
            </div>

            {/* Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <h1 style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 26,
                color: "#fff",
                lineHeight: 1.15,
                margin: 0,
              }}>
                {profile.displayName}
              </h1>
              {profile.isVerified && (
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 20, height: 20, borderRadius: "50%",
                  background: GOLD, color: "#000",
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  ✓
                </span>
              )}
            </div>

            {/* Role badge */}
            <div style={{ marginBottom: 8 }}>
              <span style={{
                display: "inline-block",
                background: GOLD_BG,
                border: `1px solid ${GOLD_BORDER}`,
                color: GOLD,
                fontSize: 12,
                borderRadius: 20,
                padding: "4px 12px",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
              }}>
                {PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES] || profile.profileType?.replace(/_/g, " ")}
              </span>
            </div>

            {/* Location */}
            {profile.city && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.55)", fontSize: 13, fontFamily: "var(--font-body)" }}>
                <MapPin style={{ width: 12, height: 12, flexShrink: 0 }} />
                {profile.city}, {profile.state}
              </div>
            )}
          </div>

          {/* ── 3. STATS ROW ───────────────────────────────────────────────── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
            margin: "20px 0",
            padding: "16px 0",
            background: "rgba(255,255,255,0.03)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "var(--font-body)" }}>
                {reviewStats?.avg ? reviewStats.avg.toFixed(1) : "—"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-body)", marginTop: 2 }}>
                ★ Avaliação
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "var(--font-body)" }}>
                {reviewStats?.total ?? "—"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-body)", marginTop: 2 }}>
                Avaliações
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "var(--font-body)" }}>
                {memberYear ?? "—"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-body)", marginTop: 2 }}>
                Desde
              </div>
            </div>
          </div>

          {/* ── 4. ACTION BUTTONS ──────────────────────────────────────────── */}
          <div style={{ padding: "0 20px 24px" }}>
            {isOwner && (
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                style={{
                  width: "100%", height: 52,
                  background: `linear-gradient(135deg, #E8C76A 0%, ${GOLD} 60%, #A8832A 100%)`,
                  color: "#000", fontWeight: 700, fontSize: 16,
                  borderRadius: 12, border: "none",
                  cursor: "pointer", fontFamily: "var(--font-body)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginBottom: 10,
                }}
              >
                <Pencil style={{ width: 15, height: 15 }} />
                Editar perfil
              </button>
            )}

            {!isOwner && user && myProfile && (
              <button
                type="button"
                onClick={() => setShowBookingForm(v => !v)}
                style={{
                  width: "100%", height: 52,
                  background: showBookingForm
                    ? "rgba(201,168,76,0.15)"
                    : `linear-gradient(135deg, #E8C76A 0%, ${GOLD} 60%, #A8832A 100%)`,
                  color: showBookingForm ? GOLD : "#000",
                  fontWeight: 700, fontSize: 16,
                  borderRadius: 12,
                  border: showBookingForm ? `1px solid ${GOLD_BORDER}` : "none",
                  cursor: "pointer", fontFamily: "var(--font-body)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginBottom: 10,
                  transition: "all 0.2s ease",
                }}
              >
                <FileText style={{ width: 15, height: 15 }} />
                {showBookingForm ? "Fechar proposta" : "Contratar agora"}
              </button>
            )}

            {!isOwner && !user && (
              <a
                href="/cadastrar"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", height: 52,
                  background: `linear-gradient(135deg, #E8C76A 0%, ${GOLD} 60%, #A8832A 100%)`,
                  color: "#000", fontWeight: 700, fontSize: 16,
                  borderRadius: 12, textDecoration: "none",
                  fontFamily: "var(--font-body)", marginBottom: 10,
                }}
              >
                Criar conta para contratar
              </a>
            )}

            {/* Secondary row */}
            <div style={{ display: "flex", gap: 10 }}>
              {!isOwner && user && myProfile && (
                <button
                  type="button"
                  onClick={handleStartChat}
                  disabled={startingChat}
                  style={{
                    flex: 1, height: 44,
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "#fff", borderRadius: 12,
                    fontWeight: 600, fontSize: 14,
                    cursor: startingChat ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-body)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    opacity: startingChat ? 0.6 : 1,
                  }}
                >
                  {startingChat
                    ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                    : <MessageSquare style={{ width: 14, height: 14 }} />
                  }
                  Mensagem
                </button>
              )}
              <div style={{ flex: !isOwner && user && myProfile ? 1 : "unset" as any }}>
                <ShareButton slug={profile.slug ?? ""} name={profile.displayName} />
              </div>
            </div>
          </div>

          {/* ── BOOKING FORM ───────────────────────────────────────────────── */}
          {showBookingForm && profile && myProfile && (
            <div style={{ padding: "0 20px 24px" }}>
              <NewBookingForm
                artistProfileId={profile.id}
                onSuccess={() => { setShowBookingForm(false); navigate("/negociacoes"); }}
                onCancel={() => setShowBookingForm(false)}
              />
            </div>
          )}

          {/* ── 5. BIO ─────────────────────────────────────────────────────── */}
          {profile.bio && (
            <div style={{ padding: "0 20px 28px" }}>
              <SectionLabel>Sobre</SectionLabel>
              <p style={{
                fontSize: 15, color: "rgba(255,255,255,0.75)",
                lineHeight: 1.7, margin: 0,
                fontFamily: "var(--font-body)",
              }}>
                {bioText}
              </p>
              {profile.bio.length > 200 && (
                <div
                  onClick={() => setBioExpanded(v => !v)}
                  style={{
                    color: GOLD, fontSize: 13, fontWeight: 600,
                    marginTop: 8, cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {bioExpanded ? "Ver menos" : "Ver mais"}
                </div>
              )}
            </div>
          )}

          {/* ── 6. TAGS — horizontal scroll ────────────────────────────────── */}
          {allTags.length > 0 && (
            <div style={{ paddingBottom: 28 }}>
              <div style={{ padding: "0 20px" }}>
                <SectionLabel>Gêneros & especialidades</SectionLabel>
              </div>
              <div style={{
                display: "flex", gap: 8,
                overflowX: "auto", padding: "0 20px",
                scrollbarWidth: "none",
              }}>
                {allTags.map((tag, i) => <TagChip key={i}>{tag}</TagChip>)}
              </div>
            </div>
          )}

          {/* ── PRICE / INFO ───────────────────────────────────────────────── */}
          {hasPriceInfo && (
            <div style={{ padding: "0 20px 28px" }}>
              <SectionLabel>Informações</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(profile as any).priceMin != null && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "12px 16px", borderRadius: 12,
                    background: GOLD_BG, border: `1px solid ${GOLD_BORDER}`,
                    fontSize: 15, fontWeight: 700, color: GOLD,
                    fontFamily: "var(--font-body)",
                  }}>
                    💰 Cachê: R$ {Number((profile as any).priceMin).toLocaleString("pt-BR")}
                    {(profile as any).priceMax != null && ` — R$ ${Number((profile as any).priceMax).toLocaleString("pt-BR")}`}
                  </div>
                )}
                {(profile as any).durationMin && (
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-body)" }}>
                    ⏱ Duração: {(profile as any).durationMin}
                    {(profile as any).durationMax && (profile as any).durationMax !== (profile as any).durationMin ? ` — ${(profile as any).durationMax}` : ""}
                  </div>
                )}
                {(profile as any).cities && (
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-body)" }}>
                    📍 Atua em: {(profile as any).cities}
                  </div>
                )}
                {instruments.length > 0 && (
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-body)" }}>
                    🎸 Instrumentos: {instruments.join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 7. PORTFOLIO — horizontal scroll ───────────────────────────── */}
          {portfolio.length > 0 && (
            <div style={{ paddingBottom: 28 }}>
              <div style={{ padding: "0 20px" }}>
                <SectionLabel>Portfólio</SectionLabel>
              </div>
              <div style={{
                display: "flex", gap: 12,
                overflowX: "auto", padding: "0 20px",
                scrollbarWidth: "none",
              }}>
                {portfolio.map((item) => <PortfolioCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {/* ── 8. REVIEWS ─────────────────────────────────────────────────── */}
          <div style={{ padding: "0 20px 28px" }}>
            <SectionLabel>Avaliações</SectionLabel>
            <ReviewSection profileId={profile.id} isOwner={isOwner} currentUserProfileId={myProfile?.id} />
          </div>

          {/* ── 9. MEMORIES ────────────────────────────────────────────────── */}
          <div style={{ padding: "0 20px 28px" }}>
            <SectionLabel>Memórias</SectionLabel>
            <MemoryTimeline profileId={profile.id} isOwner={isOwner} myProfileId={myProfile?.id} />
          </div>

          {/* ── 10. CONTACT CHIPS ──────────────────────────────────────────── */}
          {(profile.phone || profile.instagramUrl || profile.website || profile.youtubeUrl) && (
            <div style={{ padding: "0 20px 28px" }}>
              <SectionLabel>Contato</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {profile.phone && (
                  <a
                    href={`https://wa.me/55${profile.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 16px", borderRadius: 10,
                      background: "#25D366", color: "#fff",
                      fontWeight: 700, fontSize: 14,
                      textDecoration: "none", fontFamily: "var(--font-body)",
                    }}
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                )}
                {profile.instagramUrl && (
                  <a
                    href={instagramHref(profile.instagramUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 16px", borderRadius: 10,
                      background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                      color: "#fff", fontWeight: 700, fontSize: 14,
                      textDecoration: "none", fontFamily: "var(--font-body)",
                    }}
                  >
                    <InstagramIcon size={18} />
                    Instagram
                  </a>
                )}
                {profile.youtubeUrl && (
                  <a
                    href={profile.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 16px", borderRadius: 10,
                      background: "#FF0000", color: "#fff",
                      fontWeight: 700, fontSize: 14,
                      textDecoration: "none", fontFamily: "var(--font-body)",
                    }}
                  >
                    <Youtube style={{ width: 16, height: 16 }} />
                    YouTube
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 16px", borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "rgba(255,255,255,0.8)",
                      fontWeight: 600, fontSize: 14,
                      textDecoration: "none", fontFamily: "var(--font-body)",
                    }}
                  >
                    <Globe style={{ width: 16, height: 16 }} />
                    Website
                  </a>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f, "cover", setUploadingCover);
          e.target.value = "";
        }}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f, "avatar", setUploadingAvatar);
          e.target.value = "";
        }}
      />
    </PublicLayout>
  );
}
