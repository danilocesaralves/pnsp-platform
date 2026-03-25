import { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Download, Image } from "lucide-react";
import { toast } from "sonner";

const PURPOSES = { perfil:"Foto de Perfil", oferta:"Imagem de Oferta", evento:"Divulgacao de Evento", banner:"Banner/Capa", outro:"Outro" };
const EXAMPLES = [
  "Roda de samba ao ar livre no Rio de Janeiro, iluminacao dourada, clima festivo",
  "Grupo de pagode em estudio profissional, instrumentos em destaque",
  "Pandeiro artesanal com detalhes em couro, fundo escuro elegante",
  "Cantor de samba no palco com microfone, luzes coloridas ao fundo",
];

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [purpose, setPurpose] = useState("outro");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const generate = trpc.imageGen.generate.useMutation({
    onSuccess: (data) => { setGeneratedUrl(data.url ?? null); toast.success("Imagem gerada!"); },
    onError: (e) => toast.error(e.message),
  });
  const { data: myImages } = trpc.imageGen.myImages.useQuery();
  return (
    <PublicLayout>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2"><Sparkles className="h-6 w-6 text-amber-500" />Gerador de Imagens</h1>
          <p className="text-muted-foreground">Crie material visual profissional para seu perfil, ofertas e eventos usando IA</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Finalidade</label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PURPOSES).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Descricao da Imagem *</label>
              <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Descreva a imagem que deseja criar..." rows={5} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Exemplos:</p>
              <div className="space-y-1">
                {EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => setPrompt(ex)} className="text-xs text-left w-full text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1.5 transition-colors">
                    "{ex}"
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={() => generate.mutate({ prompt, purpose: purpose as any })} disabled={!prompt || generate.isPending}>
              <Sparkles className="h-4 w-4 mr-2" />{generate.isPending ? "Gerando imagem..." : "Gerar Imagem"}
            </Button>
          </div>
          <div>
            {generate.isPending && (
              <div className="rounded-xl border border-border bg-card aspect-square flex items-center justify-center">
                <div className="text-center"><div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" /><p className="text-sm text-muted-foreground">Gerando sua imagem...</p></div>
              </div>
            )}
            {generatedUrl && !generate.isPending && (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden border border-border"><img src={generatedUrl} alt="Imagem gerada" className="w-full" /></div>
                <Button variant="outline" className="w-full" asChild><a href={generatedUrl} download="pnsp-imagem.png" target="_blank" rel="noopener"><Download className="h-4 w-4 mr-2" />Baixar Imagem</a></Button>
              </div>
            )}
            {!generatedUrl && !generate.isPending && (
              <div className="rounded-xl border border-dashed border-border bg-card/50 aspect-square flex items-center justify-center">
                <div className="text-center"><Image className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground">Sua imagem aparecera aqui</p></div>
              </div>
            )}
            {(myImages ?? []).length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">Imagens anteriores</p>
                <div className="grid grid-cols-3 gap-2">
                  {(myImages ?? []).slice(0, 6).map((img: any) => (
                    <a key={img.id} href={img.imageUrl} target="_blank" rel="noopener" className="rounded-lg overflow-hidden border border-border aspect-square">
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
