import { useState } from "react";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, BookOpen, Play, Clock, Lock, X, GraduationCap, AlertCircle,
} from "lucide-react";
import { ACADEMY_CATEGORIES } from "@shared/pnsp";
import AcademyView from "@/components/AcademyView";
import { useAuth } from "@/_core/hooks/useAuth";

const CONTENT_TYPES: Record<string, string> = {
  artigo: "Artigo",
  video: "Vídeo",
  tutorial: "Tutorial",
  curso: "Curso",
  podcast: "Podcast",
  partitura: "Partitura",
};

const CONTENT_TYPE_COLORS: Record<string, string> = {
  artigo: "var(--g500)",
  video: "#ef4444",
  tutorial: "#8b5cf6",
  curso: "var(--o500)",
  podcast: "#3b82f6",
  partitura: "#0891b2",
};

function AcademySkeleton() {
  return (
    <div className="pnsp-card overflow-hidden animate-pulse">
      <div className="pnsp-skeleton h-44 w-full" />
      <div className="p-4">
        <div className="pnsp-skeleton h-4 w-20 rounded-full mb-3" />
        <div className="pnsp-skeleton h-5 w-full mb-2" />
        <div className="pnsp-skeleton h-4 w-4/5 mb-1" />
        <div className="pnsp-skeleton h-4 w-3/5 mb-3" />
        <div className="flex justify-between">
          <div className="pnsp-skeleton h-4 w-16" />
          <div className="pnsp-skeleton h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function Academy() {
  const { user } = useAuth();
  const profileQ = trpc.profiles.getMyProfile.useQuery(undefined, { enabled: !!user });
  const myProfileId = profileQ.data?.id;

  const [mainTab, setMainTab] = useState<"conteudo" | "cursos">("cursos");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [contentType, setContentType] = useState("all");
  const [offset, setOffset] = useState(0);
  const limit = 18;

  const { data: content, isLoading, isError } = trpc.academy.list.useQuery({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    contentType: contentType !== "all" ? contentType : undefined,
    limit,
    offset,
  });

  const hasFilters = search || category !== "all" || contentType !== "all";

  function clearFilters() {
    setSearch(""); setSearchInput("");
    setCategory("all"); setContentType("all");
    setOffset(0);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setOffset(0);
  }

  return (
    <PublicLayout>
      <SEO title="Academia Digital" description="Cursos, artigos e vídeos sobre samba, pagode, instrumentos e o ecossistema musical brasileiro." />
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div
        className="py-12 border-b border-border"
        style={{ background: "linear-gradient(135deg, var(--n950) 0%, var(--n900) 100%)" }}
      >
        <div className="container">
          <div className="max-w-2xl">
            <div className="pnsp-divider mb-4" />
            <h1 className="pnsp-section-title text-3xl lg:text-4xl mb-3" style={{ color: "var(--n50)" }}>
              Academia Digital
            </h1>
            <p className="font-body text-lg mb-6" style={{ color: "var(--n400)" }}>
              Conteúdo educacional sobre samba, pagode, instrumentos e o ecossistema musical
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--n400)" }} />
                <Input
                  placeholder="Buscar conteúdo..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="pl-10 h-11 font-body bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-11 px-6 font-body font-semibold"
                style={{ background: "var(--o500)", color: "var(--n950)" }}
              >
                Buscar
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* ─── Main Tabs ─────────────────────────────────────────────────── */}
      <div className="container pt-6 pb-2">
        <div className="flex gap-4 border-b" style={{ borderColor: "var(--n800)" }}>
          {([
            { key: "cursos", label: "Cursos" },
            { key: "conteudo", label: "Artigos & Vídeos" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMainTab(key)}
              className="pb-3 text-sm font-semibold transition-colors"
              style={{
                color: mainTab === key ? "var(--ouro, var(--o500))" : "var(--n400)",
                borderBottom: mainTab === key ? "2px solid var(--ouro, var(--o500))" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mainTab === "cursos" && (
        <div className="container py-8">
          <AcademyView myProfileId={myProfileId} />
        </div>
      )}

      {mainTab === "conteudo" && (
      <div className="container py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Select value={category} onValueChange={v => { setCategory(v); setOffset(0); }}>
            <SelectTrigger className="w-52 h-9 font-body text-sm">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-body">Todas as categorias</SelectItem>
              {Object.entries(ACADEMY_CATEGORIES).map(([k, v]) => (
                <SelectItem key={k} value={k} className="font-body">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={contentType} onValueChange={v => { setContentType(v); setOffset(0); }}>
            <SelectTrigger className="w-40 h-9 font-body text-sm">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-body">Todos os tipos</SelectItem>
              {Object.entries(CONTENT_TYPES).map(([k, v]) => (
                <SelectItem key={k} value={k} className="font-body">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 font-body text-muted-foreground gap-1">
              <X className="h-3.5 w-3.5" />
              Limpar
            </Button>
          )}

          <span className="ml-auto text-sm text-muted-foreground font-body">
            {isLoading ? "Carregando..." : isError ? "Erro ao carregar" : `${content?.length ?? 0} conteúdos`}
          </span>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <AcademySkeleton key={i} />)}
          </div>
        ) : content && content.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {content.map(item => (
                <Link key={item.id} href={`/academia/${item.id}`}>
                  <div className="pnsp-card overflow-hidden cursor-pointer h-full flex flex-col">
                    {/* Thumbnail */}
                    <div className="relative h-44 bg-muted overflow-hidden flex-shrink-0">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, var(--n900) 0%, var(--n800) 100%)` }}
                        >
                          {item.contentType === "video" || item.contentType === "podcast" ? (
                            <Play className="h-12 w-12 text-white/20" />
                          ) : (
                            <BookOpen className="h-12 w-12 text-white/20" />
                          )}
                        </div>
                      )}

                      {/* Content type badge */}
                      <div className="absolute top-2 left-2">
                        <span
                          className="text-xs font-body font-semibold px-2 py-0.5 rounded-full text-white"
                          style={{ background: CONTENT_TYPE_COLORS[item.contentType] ?? "var(--n700)" }}
                        >
                          {CONTENT_TYPES[item.contentType] ?? item.contentType}
                        </span>
                      </div>

                      {/* Premium badge */}
                      {item.isPremium && (
                        <div className="absolute top-2 right-2">
                          <span
                            className="text-xs font-body font-semibold px-2 py-0.5 rounded-full text-white flex items-center gap-1"
                            style={{ background: "var(--o500)" }}
                          >
                            <Lock className="h-3 w-3" />Premium
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="mb-2">
                        <span className="text-xs text-muted-foreground font-body">
                          {(ACADEMY_CATEGORIES as Record<string, string>)[item.category] ?? item.category}
                        </span>
                      </div>

                      <h3 className="font-body font-semibold text-foreground text-sm leading-snug line-clamp-2 mb-2">
                        {item.title}
                      </h3>

                      {item.excerpt && (
                        <p className="text-xs text-muted-foreground font-body line-clamp-2 leading-relaxed flex-1 mb-3">
                          {item.excerpt}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-auto">
                        {item.duration ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                            <Clock className="h-3 w-3" />
                            {item.duration} min
                          </div>
                        ) : <span />}

                        {item.isPremium ? (
                          item.price ? (
                            <span className="text-sm font-display font-bold" style={{ color: "var(--o500)" }}>
                              R$ {Number(item.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-xs font-body font-semibold" style={{ color: "var(--o500)" }}>
                              Premium
                            </span>
                          )
                        ) : (
                          <span className="text-xs font-body font-semibold" style={{ color: "var(--g600)" }}>
                            Gratuito
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-3 mt-8">
              {offset > 0 && (
                <Button variant="outline" className="font-body" onClick={() => setOffset(o => Math.max(0, o - limit))}>
                  ← Anterior
                </Button>
              )}
              {content.length === limit && (
                <Button variant="outline" className="font-body" onClick={() => setOffset(o => o + limit)}>
                  Próxima →
                </Button>
              )}
            </div>
          </>
        ) : isError ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--o100)" }}>
              <AlertCircle className="h-8 w-8" style={{ color: "var(--o500)" }} />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">Erro ao carregar conteúdo</h3>
            <p className="text-muted-foreground font-body mb-6 max-w-sm mx-auto">Não foi possível carregar o conteúdo. Verifique sua conexão e tente novamente.</p>
            <Button onClick={() => window.location.reload()} className="font-body" style={{ background: "var(--g600)" }}>Tentar novamente</Button>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--g100)" }}>
              <GraduationCap className="h-8 w-8" style={{ color: "var(--g600)" }} />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">Nenhum conteúdo encontrado</h3>
            <p className="text-muted-foreground font-body mb-6 max-w-sm mx-auto">
              {hasFilters ? "Ajuste os filtros ou limpe a busca para ver mais resultados." : "Ainda não há conteúdo publicado na Academia."}
            </p>
            {hasFilters ? (
              <Button onClick={clearFilters} variant="outline" className="font-body">
                <X className="h-4 w-4 mr-2" />Limpar filtros
              </Button>
            ) : (
              <Link href="/criar-perfil">
                <Button className="font-body" style={{ background: "var(--g600)" }}>Publicar conteúdo</Button>
              </Link>
            )}
          </div>
        )}
      </div>
      )}
    </PublicLayout>
  );
}
