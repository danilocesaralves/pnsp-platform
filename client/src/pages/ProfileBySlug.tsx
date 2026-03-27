import { useParams, useLocation } from "wouter";
import { useRef, useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Badge, profileTypeBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Globe, Youtube, Award, Phone, Music, ExternalLink,
  Pencil, Camera, ImagePlus, Loader2, Calendar, Briefcase, Target,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { PROFILE_TYPES } from "@shared/pnsp";
import { ProfileHeroSkeleton } from "@/components/ui/SkeletonLoader";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none">
      <defs>
        <linearGradient id="ig-grad-slug" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#F77737" />
          <stop offset="50%" stopColor="#E1306C" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad-slug)" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.7" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </svg>
  );
}

function phoneHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  return `tel:${cleaned}`;
}

function instagramHref(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "").replace(/^(?:www\.)?instagram\.com\//i, "");
  return `https://www.instagram.com/${handle}`;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as AllowedType)) return "Formato inválido. Use JPG, PNG ou WebP.";
  if (file.size > MAX_SIZE) return "Arquivo muito grande. Máximo 5MB.";
  return null;
}

/* ─── Cover gradient per profile type ──────────────────────────────────────── */
function coverGradient(profileType?: string | null): string {
  const gradients: Record<string, string> = {
    artista_solo:    "linear-gradient(135deg, #0d1f15 0%, #1a4025 50%, #0d1f15 100%)",
    grupo_banda:     "linear-gradient(135deg, #1a1200 0%, #3d2a00 50%, #1a1200 100%)",
    produtor:        "linear-gradient(135deg, #1a0d2e 0%, #2d1a52 50%, #1a0d2e 100%)",
    professor:       "linear-gradient(135deg, #0d1a2e 0%, #1a2e52 50%, #0d1a2e 100%)",
    estudio:         "linear-gradient(135deg, #0a1a12 0%, #1a3a26 50%, #0a1a12 100%)",
    contratante:     "linear-gradient(135deg, #0a1a22 0%, #1a3344 50%, #0a1a22 100%)",
    luthier:         "linear-gradient(135deg, #1a0e00 0%, #3d2200 50%, #1a0e00 100%)",
  };
  return gradients[profileType ?? ""] ?? "linear-gradient(135deg, #0A0A0A 0%, #1a1200 50%, #0A0A0A 100%)";
}

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

  async function handleFileUpload(
    file: File,
    type: "avatar" | "cover",
    setUploading: (v: boolean) => void,
  ) {
    const err = validateImage(file);
    if (err) { toast.error(err); return; }
    setUploading(true);
    try {
      const { presignedUrl, publicUrl } = await getPresignedUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type as AllowedType,
        fileSize: file.size,
        type,
      });
      const res = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error(`Upload falhou: ${res.status}`);
      await updateProfile.mutateAsync({
        id: profile!.id,
        ...(type === "avatar" ? { avatarUrl: publicUrl } : { coverUrl: publicUrl }),
      });
      toast.success(type === "avatar" ? "Foto atualizada!" : "Capa atualizada!");
    } catch (e: any) {
      toast.error(e.message ?? "Erro no upload");
    } finally {
      setUploading(false);
    }
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <ProfileHeroSkeleton />
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse space-y-3">
                  <div className="pnsp-skeleton h-5 w-32" />
                  <div className="pnsp-skeleton h-3 w-full" />
                  <div className="pnsp-skeleton h-3 w-5/6" />
                  <div className="pnsp-skeleton h-3 w-4/6" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6 animate-pulse space-y-3">
                <div className="pnsp-skeleton h-5 w-28" />
                <div className="pnsp-skeleton h-3 w-full" />
                <div className="pnsp-skeleton h-3 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !profile) {
    return (
      <PublicLayout>
        <div className="container py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--o100)" }}>
            <MapPin className="h-8 w-8" style={{ color: "var(--o500)" }} />
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-2">Perfil não encontrado</h2>
          <p className="text-muted-foreground font-body mb-6">
            O perfil que você procura não existe ou foi removido.
          </p>
          <Button variant="outline" asChild>
            <a href="/perfis">Ver todos os perfis</a>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const specialties = Array.isArray(profile.specialties) ? profile.specialties : [];
  const instruments = Array.isArray(profile.instruments) ? profile.instruments : [];
  const genres = Array.isArray(profile.genres) ? profile.genres : [];
  const portfolio = Array.isArray(profile.portfolio) ? profile.portfolio : [];
  const memberSince = profile.createdAt ? new Date(profile.createdAt).getFullYear() : null;

  return (
    <PublicLayout>

      {/* ─── COVER ──────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          height: "320px",
          ...(profile.coverUrl ? {} : { background: coverGradient(profile.profileType) }),
        }}
      >
        {profile.coverUrl && (
          <img src={profile.coverUrl} alt="" className="w-full h-full object-cover" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Trocar capa (owner) */}
        {isOwner && (
          <button
            type="button"
            className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
          >
            {uploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            Trocar capa
          </button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, "cover", setUploadingCover);
            e.target.value = "";
          }}
        />
      </div>

      {/* ─── PROFILE HEADER ─────────────────────────────────────────────────── */}
      <div className="container">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-16 pb-0 relative z-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.displayName)}`}
              alt={profile.displayName}
              className="w-32 h-32 rounded-2xl object-cover shadow-2xl bg-muted"
              style={{
                border: profile.isVerified
                  ? "3px solid var(--o500)"
                  : "3px solid white",
              }}
            />
            {isOwner && (
              <button
                type="button"
                className="absolute -bottom-2 -right-2 rounded-full p-2 shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: "var(--o500)", color: "var(--n950)" }}
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
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
              if (file) handleFileUpload(file, "avatar", setUploadingAvatar);
              e.target.value = "";
            }}
          />

          {/* Name + type */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground leading-tight">
                {profile.displayName}
              </h1>
              {profile.isVerified && (
                <div className="rounded-full p-1" style={{ background: "var(--g500)" }}>
                  <Award className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={profileTypeBadgeVariant(profile.profileType)}>
                {PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES]}
              </Badge>
              {profile.isVerified && (
                <Badge variant="green" className="text-xs">Verificado</Badge>
              )}
            </div>
            {profile.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground font-body">
                <MapPin className="h-4 w-4" />
                {profile.city}, {profile.state}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap pb-1">
            {isOwner && (
              <Button
                size="sm"
                variant="gold"
                style={{ background: "var(--o500)", color: "var(--n950)" }}
                onClick={() => navigate("/dashboard")}
              >
                <Pencil className="h-3.5 w-3.5" /> Editar perfil
              </Button>
            )}
            {profile.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={phoneHref(profile.phone)}>
                  <Phone className="h-4 w-4" /> Contato
                </a>
              </Button>
            )}
            {profile.instagramUrl && (
              <Button variant="outline" size="icon-sm" asChild>
                <a href={instagramHref(profile.instagramUrl)} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <InstagramIcon className="h-4 w-4" />
                </a>
              </Button>
            )}
            {profile.youtubeUrl && (
              <Button variant="outline" size="icon-sm" asChild>
                <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
              </Button>
            )}
            {profile.website && (
              <Button variant="outline" size="icon-sm" asChild>
                <a href={profile.website} target="_blank" rel="noopener noreferrer" aria-label="Site">
                  <Globe className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ─── BODY ───────────────────────────────────────────────────────────── */}
      <div className="container pb-16 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Bio */}
            {profile.bio && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full inline-block" style={{ background: "var(--o500)" }} />
                  Sobre
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-body">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Portfolio */}
            {portfolio.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full inline-block" style={{ background: "var(--g500)" }} />
                  Portfólio
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted hover:border-primary/50 transition-all hover-lift"
                    >
                      {item.mediaType === "image" ? (
                        <img
                          src={item.url}
                          alt={item.title ?? ""}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 text-center">
                          <Music className="h-8 w-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground line-clamp-2">{item.title}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ExternalLink className="h-5 w-5 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Quick contact card */}
            {(profile.phone || profile.website || profile.spotifyUrl) && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="font-display font-semibold text-sm text-foreground">Contato rápido</h3>
                {profile.phone && (
                  <a href={phoneHref(profile.phone)} className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="h-4 w-4 flex-shrink-0" style={{ color: "var(--o500)" }} />
                    {profile.phone}
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors truncate">
                    <Globe className="h-4 w-4 flex-shrink-0" style={{ color: "var(--g500)" }} />
                    <span className="truncate">{profile.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
                {profile.spotifyUrl && (
                  <a href={profile.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
                    <Music className="h-4 w-4 flex-shrink-0" style={{ color: "#1DB954" }} />
                    Ouvir no Spotify
                  </a>
                )}
              </div>
            )}

            {/* Stats card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-display font-semibold text-sm text-foreground">Resumo</h3>
              <div className="space-y-2.5">
                {memberSince && (
                  <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: "var(--o500)" }} />
                    Membro desde {memberSince}
                  </div>
                )}
                {profile.city && (
                  <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: "var(--g500)" }} />
                    {profile.city}, {profile.state}
                  </div>
                )}
                {genres.length > 0 && (
                  <div className="flex items-start gap-2 text-sm font-body text-muted-foreground">
                    <Music className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#8b5cf6" }} />
                    <span>{(genres as string[]).slice(0, 3).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills / Specialties */}
            {(specialties.length > 0 || instruments.length > 0 || genres.length > 0) && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                {specialties.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold font-display mb-2">Especialidades</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(specialties as string[]).map(s => (
                        <Badge key={s} variant="outline" className="font-body">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {instruments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold font-display mb-2">Instrumentos</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(instruments as string[]).map(i => (
                        <Badge key={i} variant="outline" className="font-body">{i}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {genres.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold font-display mb-2">Gêneros</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(genres as string[]).map(g => (
                        <Badge key={g} variant="gold" className="font-body">{g}</Badge>
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
