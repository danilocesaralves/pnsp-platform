import { useParams } from "wouter";
import { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, DollarSign, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const OPP_CATS: Record<string,string> = { vaga_grupo:"Vaga em Grupo", show:"Show", evento:"Evento", projeto:"Projeto", aula:"Aula", producao:"Producao", estudio:"Estudio", servico:"Servico", outro:"Outro" };

export default function OpportunityDetail() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [coverLetter, setCoverLetter] = useState("");
  const { data: opp, isLoading } = trpc.opportunities.getById.useQuery({ id: Number(params.id) }, { enabled: !!params.id });
  const apply = trpc.opportunities.submitApplication.useMutation({
    onSuccess: () => { toast.success("Candidatura enviada!"); setCoverLetter(""); },
    onError: () => toast.error("Erro ao enviar candidatura"),
  });
  if (isLoading) return <PublicLayout><div className="container py-16 text-center animate-pulse text-muted-foreground">Carregando...</div></PublicLayout>;
  if (!opp) return <PublicLayout><div className="container py-16 text-center text-muted-foreground">Oportunidade nao encontrada</div></PublicLayout>;
  return (
    <PublicLayout>
      <div className="container py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">{OPP_CATS[opp.category] ?? opp.category}</Badge>
              <h1 className="text-2xl md:text-3xl font-bold mb-3">{opp.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {opp.city && <div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{opp.city}, {opp.state}</div>}
                {opp.deadline && <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />Prazo: {format(new Date(opp.deadline), "dd/MM/yyyy", { locale: ptBR })}</div>}
                <div className="flex items-center gap-1"><Users className="h-4 w-4" />{opp.applicationCount ?? 0} candidaturas</div>
              </div>
              {opp.description && <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{opp.description}</p>}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              {(opp.budgetMin || opp.budgetMax) && (
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">{opp.budgetMin && opp.budgetMax ? `R$ ${Number(opp.budgetMin).toLocaleString("pt-BR")} - R$ ${Number(opp.budgetMax).toLocaleString("pt-BR")}` : opp.budgetMin ? `A partir de R$ ${Number(opp.budgetMin).toLocaleString("pt-BR")}` : "A combinar"}</span>
                </div>
              )}
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Textarea placeholder="Carta de apresentacao (opcional)..." value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={4} />
                  <Button className="w-full" onClick={() => apply.mutate({ opportunityId: opp.id, coverLetter })} disabled={apply.isPending}>{apply.isPending ? "Enviando..." : "Candidatar-se"}</Button>
                </div>
              ) : (
                <Button className="w-full" asChild><a href={getLoginUrl()}>Entrar para candidatar</a></Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
