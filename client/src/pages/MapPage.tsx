import { useRef, useState, useEffect } from "react";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BRAZIL_STATES } from "@shared/pnsp";

export default function MapPage() {
  const [mapType, setMapType] = useState<"all" | "profiles" | "studios">("all");
  const [state, setState] = useState("");
  const markersRef = useRef<google.maps.Marker[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { data: markers = [] } = trpc.map.getMarkers.useQuery({
    type: mapType,
    state: state || undefined,
  });

  // Re-render markers when data changes
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    (markers as any[]).forEach((marker) => {
      if (!marker.lat || !marker.lng) return;
      const m = new google.maps.Marker({
        position: { lat: Number(marker.lat), lng: Number(marker.lng) },
        map: mapRef.current!,
        title: marker.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: marker.type === "studio" ? "#6366f1" : "#c9a227",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      const href = marker.type === "studio"
        ? "/estudios/" + (marker.slug ?? marker.id).toLowerCase()
        : "/perfil/" + (marker.slug ?? marker.id).toLowerCase();
      const infoContent = [
        '<div style="padding:8px;min-width:140px">',
        "<strong>" + marker.name + "</strong><br/>",
        "<small>" + (marker.city || "") + (marker.state ? ", " + marker.state : "") + "</small><br/>",
        '<a href="' + href + '" style="color:#c9a227;font-size:12px">Ver perfil</a>',
        "</div>",
      ].join("");
      const info = new google.maps.InfoWindow({ content: infoContent });
      m.addListener("click", () => info.open(mapRef.current, m));
      markersRef.current.push(m);
    });
  }, [markers]);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    map.setCenter({ lat: -15.7801, lng: -47.9292 });
    map.setZoom(5);
  };

  return (
    <PublicLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Mapa Vivo Nacional</h1>
          <p className="text-muted-foreground">Artistas, grupos, estúdios e eventos em todo o Brasil</p>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <Select value={mapType} onValueChange={(v) => setMapType(v as any)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="profiles">Perfis</SelectItem>
              <SelectItem value="studios">Estúdios</SelectItem>
            </SelectContent>
          </Select>
          <Select value={state} onValueChange={(v) => setState(v === "all" ? "" : v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              {BRAZIL_STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="self-center">
            {(markers as any[]).length} pontos no mapa
          </Badge>
        </div>
        <div className="rounded-xl overflow-hidden border border-border shadow-sm" style={{ height: "600px" }}>
          <MapView onMapReady={handleMapReady} />
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Clique em um ponto para ver detalhes do perfil ou estúdio
        </p>
      </div>
    </PublicLayout>
  );
}
