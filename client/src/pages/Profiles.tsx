import { useState } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Users, Award, Music } from "lucide-react";
import { PROFILE_TYPES, BRAZIL_STATES } from "@shared/pnsp";

export default function Profiles() {
  const [search, setSearch] = useState("");
  const [profileType, setProfileType] = useState("");
  const [state, setState] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data: profiles, isLoading } = trpc.profiles.list.useQuery({
    search: search || undefined,
    profileType: profileType || undefined,
    state: state || undefined,
    limit,
    offset,
  });

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Perfis da Plataforma</h1>
          <p className="text-muted-foreground">Artistas, grupos, estúdios e parceiros do ecossistema</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar perfis..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
              className="pl-9"
            />
          </div>
          <Select value={profileType} onValueChange={(v) => { setProfileType(v === "all" ? "" : v); setOffset(0); }}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Tipo de perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(PROFILE_TYPES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={state} onValueChange={(v) => { setState(v === "all" ? "" : v); setOffset(0); }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {BRAZIL_STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-52" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(profiles ?? []).map((profile) => (
                <Link key={profile.id} href={`/perfis/${profile.slug}`}>
                  <div className="group rounded-xl overflow-hidden border border-border bg-card hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="relative h-36 bg-muted overflow-hidden">
                      {profile.coverUrl ? (
                        <img src={profile.coverUrl} alt={profile.displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <Music className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                      {profile.isVerified && (
                        <div className="absolute top-2 right-2">
                          <Badge className="text-xs bg-green-500 text-white border-0 py-0">
                            <Award className="h-3 w-3 mr-1" />Verificado
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {profile.avatarUrl ? (
                          <img src={profile.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{profile.displayName.charAt(0)}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{profile.displayName}</p>
                          <p className="text-xs text-muted-foreground">{PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES]}</p>
                        </div>
                      </div>
                      {profile.city && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />{profile.city}, {profile.state}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {(profiles ?? []).length === 0 && (
              <div className="text-center py-16">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Nenhum perfil encontrado</p>
              </div>
            )}
            <div className="flex justify-center gap-3 mt-8">
              {offset > 0 && <Button variant="outline" onClick={() => setOffset(o => o - limit)}>Anterior</Button>}
              {(profiles ?? []).length === limit && <Button variant="outline" onClick={() => setOffset(o => o + limit)}>Próxima</Button>}
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
