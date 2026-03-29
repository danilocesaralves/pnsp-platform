import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { Link } from "wouter";
import { X } from "lucide-react";
import { PROFILE_TYPES } from "@shared/pnsp";

// ─── State coordinates (center of each BR state) ─────────────────────────────
const STATE_COORDS: Record<string, [number, number]> = {
  AC: [-8.77,  -70.55], AL: [-9.71,  -35.73], AM: [-3.07,  -61.66],
  AP: [1.41,   -51.77], BA: [-13.29, -41.71], CE: [-5.20,  -39.53],
  DF: [-15.78, -47.93], ES: [-20.32, -40.34], GO: [-15.83, -49.83],
  MA: [-5.42,  -45.44], MG: [-18.10, -44.38], MS: [-20.51, -54.54],
  MT: [-12.64, -55.42], PA: [-5.53,  -52.29], PB: [-7.06,  -35.55],
  PE: [-8.28,  -35.07], PI: [-6.60,  -42.28], PR: [-24.89, -51.55],
  RJ: [-22.25, -42.66], RN: [-5.81,  -36.59], RO: [-10.83, -63.34],
  RR: [1.99,   -61.33], RS: [-30.01, -51.22], SC: [-27.45, -50.95],
  SE: [-10.57, -37.45], SP: [-22.19, -48.79], TO: [-9.46,  -48.26],
};

const STATE_NAMES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AM: "Amazonas", AP: "Amapá",
  BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
  GO: "Goiás", MA: "Maranhão", MG: "Minas Gerais", MS: "Mato Grosso do Sul",
  MT: "Mato Grosso", PA: "Pará", PB: "Paraíba", PE: "Pernambuco",
  PI: "Piauí", PR: "Paraná", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RO: "Rondônia", RR: "Roraima", RS: "Rio Grande do Sul", SC: "Santa Catarina",
  SE: "Sergipe", SP: "São Paulo", TO: "Tocantins",
};

const TYPE_OPTIONS = [
  { value: "",              label: "Todos" },
  { value: "artista_solo",  label: "Artistas" },
  { value: "grupo_banda",   label: "Grupos" },
  { value: "produtor",      label: "Produtores" },
  { value: "estudio",       label: "Estúdios" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stateIcon(count: number) {
  const size = count >= 10 ? 44 : 36;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(212,146,10,0.90);border:2px solid #D4920A;display:flex;align-items:center;justify-content:center;color:#0A0800;font-size:${count >= 10 ? 12 : 11}px;font-weight:700;box-shadow:0 2px 10px rgba(212,146,10,0.45);cursor:pointer;">${count}</div>`,
    className: "",
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── ProfileMapCard — outside export default ──────────────────────────────────
function ProfileMapCard({ profile }: { profile: any }) {
  const typeLabel = PROFILE_TYPES.find((t: any) => t.value === profile.profileType)?.label ?? profile.profileType;
  return (
    <Link href={`/perfil/${profile.slug}`}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 0", cursor: "pointer",
        borderBottom: "1px solid rgba(212,146,10,0.08)",
      }}>
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: "rgba(212,146,10,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#D4920A", fontWeight: 700, fontSize: 14,
          }}>
            {profile.displayName?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--creme)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile.displayName}
          </div>
          <div style={{ fontSize: 11, color: "var(--creme-50)", marginTop: 1 }}>
            {typeLabel}{profile.city ? ` · ${profile.city}` : ""}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── StateCard — outside export default ──────────────────────────────────────
function StateCard({ stateCode, profiles, onClose }: {
  stateCode: string;
  profiles: any[];
  onClose: () => void;
}) {
  return (
    <div style={{
      position: "absolute", top: 16, right: 16, zIndex: 1000,
      width: 280, maxHeight: "calc(100% - 32px)",
      background: "var(--terra)", border: "1px solid rgba(212,146,10,0.25)",
      borderRadius: 16, overflow: "hidden",
      display: "flex", flexDirection: "column",
      boxShadow: "0 8px 32px rgba(0,0,0,0.65)",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px 12px",
        borderBottom: "1px solid rgba(212,146,10,0.12)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--creme)" }}>
            {STATE_NAMES[stateCode] ?? stateCode}
          </div>
          <div style={{ fontSize: 12, color: "var(--creme-50)", marginTop: 2 }}>
            {profiles.length} {profiles.length === 1 ? "perfil" : "perfis"}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--creme-50)", padding: 4, lineHeight: 1 }}
        >
          <X size={16} />
        </button>
      </div>
      {/* List */}
      <div style={{ overflowY: "auto", padding: "0 16px 16px", flex: 1 }}>
        {profiles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--creme-50)", fontSize: 13 }}>
            Nenhum perfil neste estado
          </div>
        ) : (
          profiles.map(p => <ProfileMapCard key={p.id} profile={p} />)
        )}
      </div>
    </div>
  );
}

// ─── MapaVivo — default export ────────────────────────────────────────────────
export default function MapaVivo() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [profileType, setProfileType]     = useState("");

  const { data: allProfiles = [] } = trpc.profiles.list.useQuery({
    profileType: profileType || undefined,
    limit: 100,
  });

  // Group by state code
  const byState = (allProfiles as any[]).reduce<Record<string, any[]>>((acc, p) => {
    const code = (p.state as string | undefined)?.toUpperCase();
    if (!code) return acc;
    if (!acc[code]) acc[code] = [];
    acc[code].push(p);
    return acc;
  }, {});

  const selectedProfiles = selectedState ? (byState[selectedState] ?? []) : [];

  return (
    <PublicLayout>
      <div style={{ padding: "24px 16px 0" }}>
        {/* Header */}
        <div style={{ maxWidth: 1280, margin: "0 auto", marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--creme)", marginBottom: 4 }}>
              Mapa Vivo
            </h1>
            <p style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)" }}>
              Artistas e profissionais do samba por todo o Brasil
            </p>
          </div>
          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setProfileType(opt.value); setSelectedState(null); }}
                style={{
                  padding: "6px 14px", borderRadius: 9999,
                  fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                  background: profileType === opt.value ? "var(--ouro)" : "var(--terra)",
                  color:      profileType === opt.value ? "var(--preto)" : "var(--creme-50)",
                  border:     `1px solid ${profileType === opt.value ? "var(--ouro)" : "var(--creme-10)"}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map container */}
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <MapContainer
            center={[-15.7801, -47.9292]}
            zoom={4}
            scrollWheelZoom
            style={{
              width: "100%",
              height: "calc(100vh - 240px)",
              minHeight: 420,
              borderRadius: 16,
              border: "1px solid rgba(212,146,10,0.15)",
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {Object.entries(STATE_COORDS).map(([code, coords]) => {
              const count = (byState[code] ?? []).length;
              if (count === 0) return null;
              return (
                <Marker
                  key={code}
                  position={coords}
                  icon={stateIcon(count)}
                  eventHandlers={{ click: () => setSelectedState(code) }}
                >
                  <Popup>
                    <div style={{ minWidth: 120, fontSize: 13 }}>
                      <strong>{STATE_NAMES[code] ?? code}</strong>
                      <br />
                      {count} {count === 1 ? "perfil" : "perfis"}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {selectedState && (
            <StateCard
              stateCode={selectedState}
              profiles={selectedProfiles}
              onClose={() => setSelectedState(null)}
            />
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
