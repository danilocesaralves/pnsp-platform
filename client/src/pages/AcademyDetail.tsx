import { useParams } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Lock } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";


const ACAD_CATS: Record<string,string> = { historia:"Historia", tecnica:"Tecnica", instrumentos:"Instrumentos", composicao:"Composicao", producao:"Producao", carreira:"Carreira", negocios:"Negocios", cultura:"Cultura" };

export default function AcademyDetail() {
  const params = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const { data: content, isLoading } = trpc.academy.getBySlug.useQuery({ slug: params.slug ?? "" }, { enabled: !!params.slug });
  if (isLoading) return <PublicLayout><div className="container py-16 text-center animate-pulse text-muted-foreground">Carregando...</div></PublicLayout>;
  if (!content) return <PublicLayout><div className="container py-16 text-center text-muted-foreground">Conteúdo nao encontrado</div></PublicLayout>;
  return (
    <PublicLayout>
      <div className="container py-8 max-w-4xl">
        {content.thumbnailUrl && <div className="h-64 rounded-xl overflow-hidden mb-6 bg-muted"><img src={content.thumbnailUrl} alt={content.title} className="w-full h-full object-cover" /></div>}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{content.contentType}</Badge>
          <Badge variant="outline">{ACAD_CATS[content.category] ?? content.category}</Badge>
          <Badge variant="outline">{content.level}</Badge>
          {content.duration && <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{content.duration} min</Badge>}
        </div>
        <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
        {content.excerpt && <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{content.excerpt}</p>}
        {content.videoUrl && <div className="rounded-xl overflow-hidden mb-6 bg-black aspect-video"><iframe src={content.videoUrl} className="w-full h-full" allowFullScreen title={content.title} /></div>}
        {content.isPremium && !isAuthenticated ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center"><Lock className="h-12 w-12 mx-auto text-amber-500 mb-4" /><h3 className="font-semibold text-lg mb-2">Conteúdo Premium</h3><p className="text-muted-foreground mb-4">Faca login para acessar este conteudo</p><Button asChild><a href={"/entrar"}>Acessar</a></Button></div>
        ) : (
          content.content && <div className="prose max-w-none text-foreground leading-relaxed whitespace-pre-wrap">{content.content}</div>
        )}
      </div>
    </PublicLayout>
  );
}
