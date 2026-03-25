import { useParams } from "wouter";
import { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Globe, Star, Clock, Users, Mic2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function StudioDetail() {
  const params = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [notes, setNotes] = useState("");
  const { data: studio, isLoading } = trpc.studios.getBySlug.useQuery({ slug: params.slug ?? "" }, { enabled: !!params.slug });
  const book = trpc.studios.book.useMutation({
    onSuccess: () => { toast.success("Reserva solicitada!"); setStartAt(""); setEndAt(""); setNotes(""); },
    onError: () => toast.error("Erro ao solicitar reserva"),
  });
  if (isLoading) return <PublicLayout><div className="container py-16 text-center animate-pulse text-muted-foreground">Carregando...</div></PublicLayout>;
  if (!studio) return <PublicLayout><div className="container py-16 text-center text-muted-foreground">Estudio nao encontrado</div></PublicLayout>;
  const equipment = Array.isArray(studio.equipment) ? studio.equipment : [];
  const amenities = Array.isArray(studio.amenities) ? studio.amenities : [];
  return (
    <PublicLayout>
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-indigo-900 to-purple-900 overflow-hidden">{studio.coverUrl && <img src={studio.coverUrl} alt="" className="w-full h-full object-cover opacity-60" />}</div>
      <div className="container pb-12">
        <div className="relative -mt-12 mb-6 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="h-24 w-24 rounded-xl bg-card border-4 border-background shadow-lg flex items-center justify-center overflow-hidden">{studio.imageUrl ? <img src={studio.imageUrl} alt={studio.name} className="w-full h-full object-cover" /> : <Mic2 className="h-10 w-10 text-muted-foreground/40" />}</div>
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1"><h1 className="text-2xl font-bold">{studio.name}</h1>{studio.isVerified && <Badge className="bg-green-500 text-white border-0">Verificado</Badge>}</div>
            {studio.city && <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{studio.address ?? `${studio.city}, ${studio.state}`}</div>}
          </div>
          <div className="flex gap-2">{studio.phone && <Button variant="outline" size="sm" asChild><a href={`tel:${studio.phone}`}><Phone className="h-4 w-4 mr-1" />Ligar</a></Button>}{studio.website && <Button variant="outline" size="sm" asChild><a href={studio.website} target="_blank" rel="noopener"><Globe className="h-4 w-4" /></a></Button>}</div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {studio.description && <div className="rounded-xl border border-border bg-card p-6"><h2 className="font-semibold text-lg mb-3">Sobre o Estudio</h2><p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{studio.description}</p></div>}
            {equipment.length > 0 && <div className="rounded-xl border border-border bg-card p-6"><h2 className="font-semibold text-lg mb-3">Equipamentos</h2><div className="flex flex-wrap gap-2">{equipment.map((e: string) => <Badge key={e} variant="secondary">{e}</Badge>)}</div></div>}
            {amenities.length > 0 && <div className="rounded-xl border border-border bg-card p-6"><h2 className="font-semibold text-lg mb-3">Comodidades</h2><div className="flex flex-wrap gap-2">{amenities.map((a: string) => <Badge key={a} variant="outline">{a}</Badge>)}</div></div>}
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-2 mb-4">
                {studio.pricePerHour && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="font-semibold">R$ {Number(studio.pricePerHour).toLocaleString("pt-BR")}/hora</span></div>}
                {studio.capacity && <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Capacidade: {studio.capacity} pessoas</span></div>}
                {Number(studio.rating) > 0 && <div className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-500 fill-amber-500" /><span className="text-sm font-medium">{Number(studio.rating).toFixed(1)}</span></div>}
              </div>
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block">Inicio</label><Input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Fim</label><Input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} /></div>
                  <Textarea placeholder="Observacoes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
                  <Button className="w-full" onClick={() => book.mutate({ studioId: studio.id, startAt, endAt, notes })} disabled={!startAt || !endAt || book.isPending}>{book.isPending ? "Solicitando..." : "Solicitar Reserva"}</Button>
                </div>
              ) : (
                <Button className="w-full" asChild><a href={getLoginUrl()}>Entrar para reservar</a></Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
