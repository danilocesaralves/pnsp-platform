import { useParams } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Instagram, Youtube, Award, Phone, Music, ExternalLink } from "lucide-react";
import { PROFILE_TYPES } from "@shared/pnsp";

export default function ProfileBySlug() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data: profile, isLoading, error } = trpc.profiles.getBySlug.useQuery(
    { slug },
    { enabled: !!slug },
  );

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-16 text-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !profile) {
    return (
      <PublicLayout>
        <div className="container py-16 text-center text-muted-foreground">
          Perfil não encontrado
        </div>
      </PublicLayout>
    );
  }

  const specialties = Array.isArray(profile.specialties) ? profile.specialties : [];
  const instruments = Array.isArray(profile.instruments) ? profile.instruments : [];
  const genres = Array.isArray(profile.genres) ? profile.genres : [];
  const portfolio = Array.isArray(profile.portfolio) ? profile.portfolio : [];

  return (
    <PublicLayout>
      {/* Cover */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary to-primary/80 overflow-hidden">
        {profile.coverUrl && (
          <img src={profile.coverUrl} alt="" className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="container pb-12">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="relative">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="h-28 w-28 rounded-xl object-cover border-4 border-background shadow-lg"
              />
            ) : (
              <div className="h-28 w-28 rounded-xl bg-primary flex items-center justify-center border-4 border-background shadow-lg">
                <span className="text-3xl font-bold text-primary-foreground">
                  {profile.displayName.charAt(0)}
                </span>
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
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow sm:text-foreground">
                {profile.displayName}
              </h1>
              <Badge variant="secondary">
                {PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES]}
              </Badge>
            </div>
            {profile.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {profile.city}, {profile.state}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {profile.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${profile.phone}`}>
                  <Phone className="h-4 w-4 mr-1" />Contato
                </a>
              </Button>
            )}
            {profile.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-1" />Site
                </a>
              </Button>
            )}
            {profile.instagramUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
            )}
            {profile.youtubeUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold text-lg mb-3">Sobre</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Portfolio */}
            {portfolio.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold text-lg mb-4">Portfólio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted hover:border-primary transition-colors"
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
            {(specialties.length > 0 || instruments.length > 0 || genres.length > 0) && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                {specialties.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Especialidades</h3>
                    <div className="flex flex-wrap gap-2">
                      {(specialties as string[]).map((s) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {instruments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Instrumentos</h3>
                    <div className="flex flex-wrap gap-2">
                      {(instruments as string[]).map((i) => (
                        <Badge key={i} variant="outline">{i}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {genres.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Gêneros</h3>
                    <div className="flex flex-wrap gap-2">
                      {(genres as string[]).map((g) => (
                        <Badge key={g} variant="outline">{g}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {profile.spotifyUrl && (
              <Button variant="outline" className="w-full" asChild>
                <a href={profile.spotifyUrl} target="_blank" rel="noopener noreferrer">
                  <Music className="h-4 w-4 mr-2" />Spotify
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
