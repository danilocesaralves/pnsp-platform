import { useParams } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Instagram, Youtube, Music, Award, Phone, ExternalLink } from "lucide-react";
import { PROFILE_TYPES } from "@shared/pnsp";

export default function ProfileDetail() {
  const params = useParams<{ id: string }>();
  const profileId = parseInt(params.id ?? "0");
  const { data: profile, isLoading } = trpc.profiles.getById.useQuery({ id: profileId }, { enabled: !!profileId });

  if (isLoading) return <PublicLayout><div className="container py-16 text-center"><div className="animate-pulse text-muted-foreground">Carregando...</div></div></PublicLayout>;
  if (!profile) return <PublicLayout><div className="container py-16 text-center text-muted-foreground">Perfil não encontrado</div></PublicLayout>;

  const specialties = Array.isArray(profile.specialties) ? profile.specialties : [];
  const instruments = Array.isArray(profile.instruments) ? profile.instruments : [];
  const genres = Array.isArray(profile.genres) ? profile.genres : [];
  const portfolio = (profile as any).portfolio ?? [];

  return (
    <PublicLayout>
      {/* Cover */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary to-primary/80 overflow-hidden">
        {profile.coverUrl && <img src={profile.coverUrl} alt="" className="w-full h-full object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="container pb-12">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="relative">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} className="h-28 w-28 rounded-xl object-cover border-4 border-background shadow-lg" />
            ) : (
              <div className="h-28 w-28 rounded-xl bg-primary flex items-center justify-center border-4 border-background shadow-lg">
                <span className="text-3xl font-bold text-primary-foreground">{profile.displayName.charAt(0)}</span>
              </div>
            )}
            {profile.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                <Award className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow sm:text-foreground">{profile.displayName}</h1>
              <Badge variant="secondary">{PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES]}</Badge>
            </div>
            {profile.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />{profile.city}, {profile.state}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {profile.phone && <Button variant="outline" size="sm" asChild><a href={`tel:${profile.phone}`}><Phone className="h-4 w-4 mr-1" />Contato</a></Button>}
            {profile.website && <Button variant="outline" size="sm" asChild><a href={profile.website} target="_blank" rel="noopener"><Globe className="h-4 w-4 mr-1" />Site</a></Button>}
            {profile.instagramUrl && <Button variant="outline" size="sm" asChild><a href={profile.instagramUrl} target="_blank" rel="noopener"><Instagram className="h-4 w-4" /></a></Button>}
            {profile.youtubeUrl && <Button variant="outline" size="sm" asChild><a href={profile.youtubeUrl} target="_blank" rel="noopener"><Youtube className="h-4 w-4" /></a></Button>}
          </div>
        </div>

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
