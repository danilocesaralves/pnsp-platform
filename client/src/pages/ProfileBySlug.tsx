import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
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
import { Camera, ImagePlus, Loader2, Pencil, MessageSquare, FileText, Globe, Youtube, Music } from "lucide-react";
import { NewBookingForm } from "@/components/BookingFlow";

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const GOLD = "#C9A84C";
const GOLD_ALPHA = "rgba(201,168,76,";

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as AllowedType)) return "Formato inválido. Use JPG, PNG ou WebP.";
  if (file.size > MAX_SIZE) return "Arquivo muito grande. Máximo 5MB.";
  return null;
}
function instagramHref(url: string) {
  const t = url.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://www.instagram.com/${t.replace(/^@/, "").replace(/^(?:www\.)?instagram\.com\//i, "")}`;
}

/* ─── Subcomponents — defined outside export default ────────────────────────── */
function Sep() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "28px 0" }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "3px",
      color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
      marginBottom: 16, fontFamily: "var(--font-body)",
    }}>
      {children}
    </div>
  );
}

function StatCell({ value, label, last }: { value: string; label: string; last?: boolean }) {
  return (
    <div style={{
      textAlign: "center", position: "relative", padding: "20px 0",
      borderRight: last ? "none" : "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1, fontFamily: "var(--font-body)" }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 6, fontFamily: "var(--font-body)" }}>
        {label}
      </div>
    </div>
  );
}

function TagChip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 20, padding: "6px 16px",
      fontSize: 13, color: "rgba(255,255,255,0.65)",
      whiteSpace: "nowrap", flexShrink: 0,
      fontFamily: "var(--font-body)",
    }}>
      {children}
    </span>
  );
}

function ContactBtn({ href, bg, border, color, children }: {
  href: string; bg: string; border: string; color: string; children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: bg, border: `1px solid ${border}`, color,
        height: 48, borderRadius: 10, fontSize: 14, fontWeight: 600,
        textDecoration: "none", fontFamily: "var(--font-body)",
      }}
    >
      {children}
    </a>
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
        width: 128, height: 128, flexShrink: 0,
        borderRadius: 12,
        border: `1px solid ${GOLD_ALPHA}0.25)`,
        background: `${GOLD_ALPHA}0.04)`,
        overflow: "hidden", textDecoration: "none",
      }}
    >
      {item.mediaType === "image" ? (
        <img src={item.url} alt={item.title ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 12 }}>
          <Music style={{ width: 28, height: 28, color: GOLD }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 1.4, fontFamily: "var(--font-body)" }}>
            {item.title}
          </span>
        </div>
      )}
    </a>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-slug" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#F77737" />
          <stop offset="50%" stopColor="#E1306C" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-slug)" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.7" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function ProfileBySlug() {
  const params = useParams<{ slug: string }>();
  const slug = (params.slug ?? "").toLowerCase();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  /* tRPC queries */
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

  /* State */
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  /* Refs */
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  /* Mutations */
  const getPresignedUrl = trpc.upload.getPresignedUrl.useMutation();
  const updateProfile = trpc.profiles.update.useMutation({ onSuccess: () => refetch() });
  const getOrCreateConversation = trpc.chat.getOrCreateConversation.useMutation();

  /* Animation CSS injection */
  useEffect(() => {
    if (document.getElementById("profile-animations")) return;
    const style = document.createElement("style");
    style.id = "profile-animations";
    style.textContent = `
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes goldPulse {
        0%,100% { box-shadow: 0 0 0 4px rgba(201,168,76,0.15); }
        50%      { box-shadow: 0 0 0 8px rgba(201,168,76,0.25), 0 0 32px rgba(201,168,76,0.1); }
      }
      .fade-up   { animation: fadeUp 0.6s ease-out forwards; }
      .fade-up-2 { animation: fadeUp 0.6s 0.15s ease-out both; }
      .fade-up-3 { animation: fadeUp 0.6s 0.3s ease-out both; }
      .gold-pulse { animation: goldPulse 3s ease-in-out infinite; }
      .hide-scrollbar { scrollbar-width: none; }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(style);
  }, []);

  /* Derived */
  const isOwner = !!user && !!profile && user.id === profile.userId;

  /* Handlers */
  async function handleStartChat() {
    if (!profile || !myProfile) return;
    setStartingChat(true);
    try {
      await getOrCreateConversation.mutateAsync({ otherProfileId: profile.id });
      navigate(`/mensagens?profileId=${profile.id}`);
    } catch { /* ignore */ }
    finally { setStartingChat(false); }
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
        <div style={{ background: "#000", minHeight: "100vh" }}>
          <div className="skeleton" style={{ height: 280 }} />
          <div style={{ padding: "0 20px", marginTop: -48 }}>
            <div className="skeleton" style={{ width: 96, height: 96, borderRadius: "50%", marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 32, width: 220, marginBottom: 10, borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 24, width: 110, borderRadius: 20 }} />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !profile) {
    return (
      <PublicLayout>
        <div style={{ background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 30, color: "#fff", marginBottom: 12 }}>Perfil não encontrado</div>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 28, fontFamily: "var(--font-body)", lineHeight: 1.6 }}>
            O perfil que você procura não existe ou foi removido.
          </p>
          <a href="/perfis" style={{ padding: "10px 24px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "rgba(255,255,255,0.7)", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 14 }}>
            ← Ver todos os perfis
          </a>
        </div>
      </PublicLayout>
    );
  }

  /* ── Data extraction ── */
  const specialties = Array.isArray(profile.specialties) ? profile.specialties as string[] : [];
  const instruments = Array.isArray(profile.instruments) ? profile.instruments as string[] : [];
  const genres = Array.isArray(profile.genres) ? profile.genres as string[] : [];
  const portfolio = Array.isArray(profile.portfolio) ? profile.portfolio : [];
  const memberYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : null;
  const allTags = [...genres, ...specialties, ...instruments];
  const initials = profile.displayName.split(" ").map(n => n[0] ?? "").join("").slice(0, 2).toUpperCase();
  const bioFull = profile.bio ?? "";
  const bioShort = bioFull.length > 150 ? bioFull.slice(0, 150) + "…" : bioFull;
  const contactItems = [profile.phone, profile.instagramUrl, profile.youtubeUrl, profile.website].filter(Boolean);
  const contactCols = contactItems.length <= 1 ? "1fr" : "1fr 1fr";
  const roleName = PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES] || profile.profileType?.replace(/_/g, " ") || "";

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

      <div style={{ background: "#000", minHeight: "100vh", paddingBottom: 100 }}>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
          {profile.coverUrl ? (
            <img
              src={profile.coverUrl}
              alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #1a1200 0%, #0d0900 50%, #000 100%)" }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200, background: "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(201,168,76,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
            </>
          )}
          {/* gradient overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 80%, #000 100%)" }} />

          {/* cover upload */}
          {isOwner && (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              style={{
                position: "absolute", top: 16, right: 16,
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", borderRadius: 8, padding: "8px 14px",
                fontSize: 12, fontWeight: 600, fontFamily: "var(--font-body)",
                backdropFilter: "blur(8px)", cursor: "pointer",
              }}
            >
              {uploadingCover ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : <ImagePlus style={{ width: 12, height: 12 }} />}
              Trocar capa
            </button>
          )}
        </div>

        {/* ── IDENTITY ────────────────────────────────────────────────────── */}
        <div className="fade-up" style={{ marginTop: -48, padding: "0 20px", position: "relative", zIndex: 2 }}>
          {/* Avatar */}
          <div style={{ display: "inline-block", position: "relative" }}>
            <div
              className="gold-pulse"
              style={{
                width: 96, height: 96, borderRadius: "50%",
                border: `3px solid ${GOLD}`,
                overflow: "hidden",
                background: "linear-gradient(135deg, #2a1f00, #1a1200)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 800, color: GOLD }}>
                  {initials}
                </span>
              )}
            </div>
            {isOwner && (
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: "50%",
                  background: GOLD, border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                {uploadingAvatar
                  ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />
                  : <Camera style={{ width: 12, height: 12, color: "#000" }} />
                }
              </button>
            )}
          </div>

          {/* Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 16, marginBottom: 8 }}>
            <h1 style={{
              fontFamily: "Georgia, serif", fontStyle: "italic",
              fontWeight: 700, fontSize: 28, color: "#fff",
              lineHeight: 1.2, letterSpacing: "-0.5px", margin: 0,
            }}>
              {profile.displayName}
            </h1>
            {profile.isVerified && (
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 20, height: 20, borderRadius: "50%",
                background: GOLD, flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </div>

          {/* Role badge */}
          <div style={{ marginBottom: 10 }}>
            <span style={{
              display: "inline-block",
              background: `${GOLD_ALPHA}0.1)`,
              border: `1px solid ${GOLD_ALPHA}0.3)`,
              color: GOLD,
              fontSize: 11, letterSpacing: "1.5px",
              textTransform: "uppercase",
              borderRadius: 20, padding: "5px 16px",
              fontFamily: "var(--font-body)", fontWeight: 600,
            }}>
              {roleName}
            </span>
          </div>

          {/* Location */}
          {profile.city && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-body)" }}>
                {profile.city}, {profile.state}
              </span>
            </div>
          )}
        </div>

        {/* ── STATS ROW ───────────────────────────────────────────────────── */}
        <div
          className="fade-up-2"
          style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            margin: "24px 0 0",
          }}
        >
          <StatCell value={reviewStats?.avg ? reviewStats.avg.toFixed(1) : "—"} label="Avaliação" />
          <StatCell value={reviewStats?.total != null ? String(reviewStats.total) : "—"} label="Reviews" />
          <StatCell value={memberYear ? String(memberYear) : "—"} label="Desde" last />
        </div>

        {/* ── ACTION BUTTONS ──────────────────────────────────────────────── */}
        <div className="fade-up-3" style={{ padding: "24px 20px 0" }}>
          {isOwner && (
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={{
                width: "100%", height: 48,
                background: "transparent",
                border: `1px solid ${GOLD_ALPHA}0.35)`,
                color: GOLD, borderRadius: 12,
                fontWeight: 600, fontSize: 15,
                fontFamily: "var(--font-body)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: "pointer",
              }}
            >
              <Pencil style={{ width: 15, height: 15 }} />
              Editar perfil
            </button>
          )}

          {!isOwner && user && myProfile && (
            <>
              <button
                type="button"
                onClick={() => setShowBookingForm(v => !v)}
                style={{
                  width: "100%", height: 52,
                  background: showBookingForm
                    ? `${GOLD_ALPHA}0.12)`
                    : "linear-gradient(135deg, #E8C76A 0%, #C9A84C 60%, #A8832A 100%)",
                  color: showBookingForm ? GOLD : "#000",
                  border: showBookingForm ? `1px solid ${GOLD_ALPHA}0.35)` : "none",
                  borderRadius: 12, fontWeight: 800, fontSize: 16,
                  letterSpacing: "0.3px",
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: showBookingForm ? "none" : "0 4px 24px rgba(201,168,76,0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <FileText style={{ width: 16, height: 16 }} />
                {showBookingForm ? "Fechar proposta" : "Contratar agora"}
              </button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={handleStartChat}
                  disabled={startingChat}
                  style={{
                    height: 44, background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.8)", borderRadius: 10,
                    fontSize: 14, fontWeight: 500,
                    fontFamily: "var(--font-body)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    cursor: startingChat ? "not-allowed" : "pointer",
                    opacity: startingChat ? 0.6 : 1,
                  }}
                >
                  {startingChat ? <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> : <MessageSquare style={{ width: 14, height: 14 }} />}
                  Mensagem
                </button>
                <div style={{
                  height: 44, background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10, overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ShareButton slug={profile.slug ?? ""} name={profile.displayName} />
                </div>
              </div>
            </>
          )}

          {!isOwner && !user && (
            <a
              href="/cadastrar"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", height: 52,
                background: "linear-gradient(135deg, #E8C76A 0%, #C9A84C 60%, #A8832A 100%)",
                color: "#000", fontWeight: 800, fontSize: 16,
                borderRadius: 12, textDecoration: "none",
                fontFamily: "var(--font-body)",
                boxShadow: "0 4px 24px rgba(201,168,76,0.25)",
              }}
            >
              Criar conta para contratar
            </a>
          )}
        </div>

        {/* ── BOOKING FORM ────────────────────────────────────────────────── */}
        {showBookingForm && profile && myProfile && (
          <div style={{ padding: "20px 20px 0" }}>
            <NewBookingForm
              artistProfileId={profile.id}
              onSuccess={() => { setShowBookingForm(false); navigate("/negociacoes"); }}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        )}

        <Sep />

        {/* ── ABOUT ───────────────────────────────────────────────────────── */}
        {bioFull && (
          <div style={{ padding: "0 20px" }}>
            <SectionLabel>Sobre</SectionLabel>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.65)", margin: 0, fontFamily: "var(--font-body)" }}>
              {bioExpanded ? bioFull : bioShort}
            </p>
            {bioFull.length > 150 && (
              <div
                onClick={() => setBioExpanded(v => !v)}
                style={{ color: GOLD, fontSize: 13, fontWeight: 600, marginTop: 10, cursor: "pointer", fontFamily: "var(--font-body)" }}
              >
                {bioExpanded ? "ver menos ↑" : "ver mais ↓"}
              </div>
            )}
          </div>
        )}

        {bioFull && allTags.length > 0 && <Sep />}

        {/* ── TAGS ────────────────────────────────────────────────────────── */}
        {allTags.length > 0 && (
          <div style={{ padding: "0 20px" }}>
            <SectionLabel>Especialidades</SectionLabel>
            <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {allTags.map((tag, i) => <TagChip key={i}>{tag}</TagChip>)}
            </div>
          </div>
        )}

        {/* ── PRICE INFO ──────────────────────────────────────────────────── */}
        {((profile as any).priceMin != null || (profile as any).durationMin || (profile as any).cities) && (
          <>
            <Sep />
            <div style={{ padding: "0 20px" }}>
              <SectionLabel>Cachê & disponibilidade</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(profile as any).priceMin != null && (
                  <div style={{
                    padding: "14px 18px", borderRadius: 12,
                    background: `${GOLD_ALPHA}0.08)`,
                    border: `1px solid ${GOLD_ALPHA}0.25)`,
                    fontSize: 16, fontWeight: 700, color: GOLD,
                    fontFamily: "var(--font-body)",
                  }}>
                    💰 R$ {Number((profile as any).priceMin).toLocaleString("pt-BR")}
                    {(profile as any).priceMax != null && ` — R$ ${Number((profile as any).priceMax).toLocaleString("pt-BR")}`}
                  </div>
                )}
                {(profile as any).durationMin && (
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)" }}>
                    ⏱ Duração: {(profile as any).durationMin}
                    {(profile as any).durationMax && (profile as any).durationMax !== (profile as any).durationMin ? ` — ${(profile as any).durationMax}` : ""}
                  </div>
                )}
                {(profile as any).cities && (
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)" }}>
                    📍 Atua em: {(profile as any).cities}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── PORTFOLIO ───────────────────────────────────────────────────── */}
        {portfolio.length > 0 && (
          <>
            <Sep />
            <div>
              <div style={{ padding: "0 20px" }}>
                <SectionLabel>Portfólio</SectionLabel>
              </div>
              <div className="hide-scrollbar" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 20px" }}>
                {portfolio.map((item) => <PortfolioCard key={item.id} item={item} />)}
              </div>
            </div>
          </>
        )}

        <Sep />

        {/* ── REVIEWS ─────────────────────────────────────────────────────── */}
        <div style={{ padding: "0 20px" }}>
          <SectionLabel>Avaliações</SectionLabel>
          <ReviewSection profileId={profile.id} isOwner={isOwner} currentUserProfileId={myProfile?.id} />
        </div>

        <Sep />

        {/* ── MEMORIES ────────────────────────────────────────────────────── */}
        <div style={{ padding: "0 20px" }}>
          <SectionLabel>Memórias</SectionLabel>
          <MemoryTimeline profileId={profile.id} isOwner={isOwner} myProfileId={myProfile?.id} />
        </div>

        {/* ── CONTACT ─────────────────────────────────────────────────────── */}
        {contactItems.length > 0 && (
          <>
            <Sep />
            <div style={{ padding: "0 20px" }}>
              <SectionLabel>Contato</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: contactCols, gap: 10 }}>
                {profile.phone && (
                  <ContactBtn
                    href={`https://wa.me/55${profile.phone.replace(/\D/g, "")}`}
                    bg="rgba(37,211,102,0.08)"
                    border="rgba(37,211,102,0.2)"
                    color="#4ade80"
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </ContactBtn>
                )}
                {profile.instagramUrl && (
                  <ContactBtn
                    href={instagramHref(profile.instagramUrl)}
                    bg="rgba(225,48,108,0.08)"
                    border="rgba(225,48,108,0.2)"
                    color="#f472b6"
                  >
                    <InstagramIcon size={18} />
                    Instagram
                  </ContactBtn>
                )}
                {profile.youtubeUrl && (
                  <ContactBtn
                    href={profile.youtubeUrl}
                    bg="rgba(255,0,0,0.08)"
                    border="rgba(255,0,0,0.15)"
                    color="#f87171"
                  >
                    <Youtube style={{ width: 18, height: 18 }} />
                    YouTube
                  </ContactBtn>
                )}
                {profile.website && (
                  <ContactBtn
                    href={profile.website}
                    bg="rgba(255,255,255,0.04)"
                    border="rgba(255,255,255,0.1)"
                    color="rgba(255,255,255,0.6)"
                  >
                    <Globe style={{ width: 18, height: 18 }} />
                    Website
                  </ContactBtn>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "cover", setUploadingCover); e.target.value = ""; }}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "avatar", setUploadingAvatar); e.target.value = ""; }}
      />
    </PublicLayout>
  );
}
