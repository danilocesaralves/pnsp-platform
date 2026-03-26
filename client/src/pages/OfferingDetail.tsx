import { useParams } from "wouter";
import { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";


const OFFERING_CATEGORIES: Record<string, string> = {
  show: "Show", aula: "Aula", producao: "Produção", instrumento_novo: "Instrumento Novo",
  instrumento_usado: "Instrumento Usado", artesanato: "Artesanato", acessorio: "Acessório",
  audiovisual: "Audiovisual", luthieria: "Luthieria", estudio: "Estúdio", servico: "Serviço", outro: "Outro",
};

export default function OfferingDetail() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const { data: offering, isLoading } = trpc.offerings.getById.useQuery(
    { id: Number(params.id) }, { enabled: !!params.id }
  );
  const interest = trpc.offerings.expressInterest.useMutation({
    onSuccess: () => { toast.success("Interesse registrado com sucesso!"); setMessage(""); },
    onError: () => toast.error("Erro ao registrar interesse"),
  });

  if (isLoading) return (
    <PublicLayout>
      <div className="container py-16 text-center">
        <div className="animate-pulse text-muted-foreground">Carregando oferta...</div>
      </div>
    </PublicLayout>
  );
  if (!offering) return (
    <PublicLayout>
      <div className="container py-16 text-center text-muted-foreground">Oferta não encontrada</div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <div className="container py-8 max-w-4xl">
        {offering.imageUrl && (
          <div className="h-64 rounded-xl overflow-hidden mb-6 bg-muted">
            <img src={offering.imageUrl} alt={offering.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary">
                  {OFFERING_CATEGORIES[offering.category] ?? offering.category}
                </Badge>
                {offering.isPremium && (
                  <Badge className="bg-amber-500 text-white border-0">
                    <Star className="h-3 w-3 mr-1" />Premium
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3">{offering.title}</h1>
              {offering.city && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />{offering.city}, {offering.state}
                </div>
              )}
              {offering.description && (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{offering.description}</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-2xl font-bold mb-1">
                {offering.price
                  ? `R$ ${Number(offering.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : <span className="text-lg capitalize">{offering.priceType?.replace(/_/g, " ") ?? "A combinar"}</span>
                }
              </div>
              <p className="text-sm text-muted-foreground mb-4">{offering.interestCount ?? 0} interessados</p>
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Mensagem (opcional)..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                  />
                  <Button
                    className="w-full"
                    onClick={() => interest.mutate({ offeringId: offering.id, message })}
                    disabled={interest.isPending}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {interest.isPending ? "Enviando..." : "Demonstrar Interesse"}
                  </Button>
                </div>
              ) : (
                <Button className="w-full" asChild>
                  <a href={"/entrar"}>Entrar para contatar</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
