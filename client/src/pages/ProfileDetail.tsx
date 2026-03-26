import { useParams } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Youtube, Music, Award, Phone, ExternalLink } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none">
      <defs>
        <linearGradient id="ig-grad-detail" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#F77737" />
          <stop offset="50%" stopColor="#E1306C" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad-detail)" />
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
import { PROFILE_TYPES } from "@shared/pnsp";

export default function ProfileDetail() {
  const params = useParams<{ id: string }>();
  const profileId = parseInt(params.id ?? "0");
  const { data: profile, isLoading } = trpc.profiles.getById.useQuery({ id: profileId }, { enabled: !!profileId, staleTime: 5 * 60 * 1000 });

  if (isLoading) return <PublicLayout><div className="container py-16 text-center"><div className="animate-pulse text-muted-foreground">Carregando...</div></div></PublicLayout>;
  if (!profile) return <PublicLayout><div className="container py-16 text-center text-muted-foreground">Perfil não encontrado</div></PublicLayout>;

  const specialties = Array.isArray(profile.specialties) ? profile.specialties : [];
  const instruments = Array.isArray(profile.instruments) ? profile.instruments : [];
  const genres = Array.isArray(profile.genres) ? profile.genres : [];
  const portfolio = (profile as any).portfolio ?? [];

  return (
    <PublicLayout>
      {/* Cover */}
      <div
        className="relative h-60 md:h-80 overflow-hidden"
        style={!profile.coverUrl ? { background: "linear-gradient(135deg, #0d1f15 0%, #1a3a26 100%)" } : undefined}
      >
        {profile.coverUrl && <img src={profile.coverUrl} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Hero content overlaid on cover */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container pb-5">
            <div className="flex items-end gap-4">
              <img
                src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.displayName)}`}
                alt={profile.displayName}
                className="h-24 w-24 rounded-xl object-cover border-4 border-white/30 shadow-xl bg-muted flex-shrink-0"
              />
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">{profile.displayName}</h1>
                  {profile.isVerified && (
                    <div className="bg-green-500 rounded-full p-1">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES]}
                  </Badge>
                </div>
                {profile.city && (
                  <div className="flex items-center gap-1 text-sm text-white/80 drop-shadow">
                    <MapPin className="h-4 w-4" />{profile.city}, {profile.state}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-12">
        {/* Action buttons */}
        {(profile.phone || profile.website || profile.instagramUrl || profile.youtubeUrl) && (
          <div className="flex gap-2 flex-wrap py-4 border-b border-border mb-6">
            {profile.phone && <Button variant="outline" size="sm" asChild><a href={phoneHref(profile.phone)}><Phone className="h-4 w-4 mr-1" />Contato</a></Button>}
            {profile.website && <Button variant="outline" size="sm" asChild><a href={profile.website} target="_blank" rel="noopener"><Globe className="h-4 w-4 mr-1" />Site</a></Button>}
            {profile.instagramUrl && <Button variant="outline" size="sm" asChild><a href={instagramHref(profile.instagramUrl)} target="_blank" rel="noopener noreferrer"><InstagramIcon className="h-4 w-4" /></a></Button>}
            {profile.youtubeUrl && <Button variant="outline" size="sm" asChild><a href={profile.youtubeUrl} target="_blank" rel="noopener"><Youtube className="h-4 w-4" /></a></Button>}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold text-lg mb-3">Sobre</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Portfolio */}
            {portfolio.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold text-lg mb-4">Portfólio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map((item: any) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noopener" className="group relative rounded-lg overflow-hidden bg-muted aspect-square">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.title ?? ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ExternalLink className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Specialties */}
            {specialties.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold mb-3">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
              </div>
            )}
            {/* Instruments */}
            {instruments.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold mb-3">Instrumentos</h3>
                <div className="flex flex-wrap gap-2">
                  {instruments.map((i: string) => <Badge key={i} variant="outline">{i}</Badge>)}
                </div>
              </div>
            )}
            {/* Genres */}
            {genres.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold mb-3">Gêneros</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g: string) => <Badge key={g} className="bg-accent/20 text-accent-foreground border-accent/30">{g}</Badge>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
