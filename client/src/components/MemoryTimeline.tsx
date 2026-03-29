import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mic2, Music, Trophy, Users, GraduationCap, Star, Plus, X, MapPin, Calendar } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type MemoryType = "show" | "gravacao" | "conquista" | "colaboracao" | "formacao" | "outro";
type Memory = {
  id: number; memoryType: MemoryType; title: string; description?: string | null;
  date: string; location?: string | null; imageUrl?: string | null;
  tags?: string[] | null; isPublic?: boolean | null; createdAt: string | Date;
};

// ─── MemoryTypeBadge ─────────────────────────────────────────────────────────
function MemoryTypeBadge({ type }: { type: MemoryType }) {
  const config: Record<MemoryType, { label: string; color: string; icon: React.ReactNode }> = {
    show: { label: "Show", color: "var(--ouro)", icon: <Mic2 size={11} /> },
    gravacao: { label: "Gravação", color: "#4a9eff", icon: <Music size={11} /> },
    conquista: { label: "Conquista", color: "var(--verde)", icon: <Trophy size={11} /> },
    colaboracao: { label: "Colaboração", color: "#7c5cbf", icon: <Users size={11} /> },
    formacao: { label: "Formação", color: "#e97", icon: <GraduationCap size={11} /> },
    outro: { label: "Outro", color: "var(--creme-50)", icon: <Star size={11} /> },
  };
  const c = config[type] ?? config.outro;
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: c.color + "22", color: c.color }}>
      {c.icon}{c.label}
    </span>
  );
}

// ─── MemoryCard ───────────────────────────────────────────────────────────────
function MemoryCard({ memory, isOwner, onDelete }: { memory: Memory; isOwner?: boolean; onDelete?: (id: number) => void }) {
  return (
    <div className="relative pl-6">
      {/* Timeline dot */}
      <div
        className="absolute left-0 top-3 w-3 h-3 rounded-full border-2 flex items-center justify-center"
        style={{ borderColor: "var(--ouro)", background: "var(--n950)" }}
      />
      <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--terra)" }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-1.5 items-center">
            <MemoryTypeBadge type={memory.memoryType} />
            {!memory.isPublic && (
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--n900)", color: "var(--creme-50)" }}>Privado</span>
            )}
          </div>
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(memory.id)}
              className="p-1 rounded hover:opacity-70 transition-opacity flex-shrink-0"
              style={{ color: "var(--creme-50)" }}
            >
              <X size={12} />
            </button>
          )}
        </div>
        <h4 className="text-sm font-bold mb-1" style={{ color: "var(--creme)" }}>{memory.title}</h4>
        {memory.description && (
          <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--creme-50)" }}>{memory.description}</p>
        )}
        {memory.imageUrl && (
          <img src={memory.imageUrl} alt={memory.title} className="w-full rounded-lg object-cover mb-2" style={{ maxHeight: 200 }} />
        )}
        <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--creme-50)" }}>
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {new Date(memory.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </span>
          {memory.location && (
            <span className="flex items-center gap-1"><MapPin size={10} />{memory.location}</span>
          )}
        </div>
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {memory.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--n900)", color: "var(--ouro)" }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NewMemoryForm ────────────────────────────────────────────────────────────
function NewMemoryForm({ profileId, onCreated }: { profileId: number; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [memoryType, setMemoryType] = useState<MemoryType>("show");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const create = trpc.memories.create.useMutation({
    onSuccess: () => {
      toast.success("Memória salva!");
      setOpen(false);
      setTitle(""); setDescription(""); setDate(""); setLocation(""); setTags("");
      onCreated();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!title.trim() || !date) return;
    create.mutate({
      profileId, memoryType, title: title.trim(),
      description: description.trim() || undefined,
      date, location: location.trim() || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      isPublic,
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="pnsp-btn-primary w-full flex items-center justify-center gap-2 text-sm"
      >
        <Plus size={14} /> Adicionar Memória
      </button>
    );
  }

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--terra)", border: "1px solid var(--ouro)44" }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: "var(--ouro)" }}>Nova Memória</span>
        <button onClick={() => setOpen(false)} style={{ color: "var(--creme-50)" }}><X size={14} /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs mb-1 block" style={{ color: "var(--creme-50)" }}>Tipo</label>
          <select
            value={memoryType}
            onChange={(e) => setMemoryType(e.target.value as MemoryType)}
            className="w-full text-sm px-2 py-1.5 rounded-lg border-0 outline-none"
            style={{ background: "var(--n900)", color: "var(--creme)" }}
          >
            {(["show","gravacao","conquista","colaboracao","formacao","outro"] as MemoryType[]).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: "var(--creme-50)" }}>Data *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm px-2 py-1.5 rounded-lg border-0 outline-none"
            style={{ background: "var(--n900)", color: "var(--creme)" }}
          />
        </div>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título *"
        className="w-full text-sm px-3 py-2 rounded-lg border-0 outline-none"
        style={{ background: "var(--n900)", color: "var(--creme)" }}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição (opcional)"
        rows={2}
        className="w-full text-sm px-3 py-2 rounded-lg border-0 outline-none resize-none"
        style={{ background: "var(--n900)", color: "var(--creme)" }}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Local"
          className="text-sm px-3 py-2 rounded-lg border-0 outline-none"
          style={{ background: "var(--n900)", color: "var(--creme)" }}
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (vírgula)"
          className="text-sm px-3 py-2 rounded-lg border-0 outline-none"
          style={{ background: "var(--n900)", color: "var(--creme)" }}
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--creme-50)" }}>
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-yellow-500" />
          Pública
        </label>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !date || create.isPending}
          className="pnsp-btn-primary ml-auto text-sm px-4 py-1.5 disabled:opacity-40"
        >
          {create.isPending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

// ─── MemoryTimeline (default export) ─────────────────────────────────────────
export default function MemoryTimeline({
  profileId,
  isOwner = false,
  myProfileId,
}: {
  profileId: number;
  isOwner?: boolean;
  myProfileId?: number;
}) {
  const [typeFilter, setTypeFilter] = useState<MemoryType | undefined>(undefined);

  const memoriesQ = isOwner
    ? trpc.memories.getMyMemories.useQuery({ profileId, memoryType: typeFilter, limit: 30 }, { enabled: !!profileId })
    : trpc.memories.getPublicMemories.useQuery({ profileId, limit: 20 }, { enabled: !!profileId });

  const deleteMutation = trpc.memories.delete.useMutation({
    onSuccess: () => {
      toast.success("Memória removida.");
      memoriesQ.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const memories = memoriesQ.data ?? [];

  const typeFilters: Array<{ value: MemoryType | undefined; label: string }> = [
    { value: undefined, label: "Todas" },
    { value: "show", label: "Shows" },
    { value: "gravacao", label: "Gravações" },
    { value: "conquista", label: "Conquistas" },
    { value: "colaboracao", label: "Colaborações" },
    { value: "formacao", label: "Formações" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Star size={16} style={{ color: "var(--ouro)" }} />
        <h3 className="text-base font-display font-bold" style={{ color: "var(--creme)" }}>Memórias</h3>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {typeFilters.map((f) => (
          <button
            key={String(f.value)}
            onClick={() => setTypeFilter(f.value)}
            className="text-xs px-3 py-1 rounded-full font-semibold transition-colors"
            style={{
              background: typeFilter === f.value ? "var(--ouro)" : "var(--terra)",
              color: typeFilter === f.value ? "#0A0800" : "var(--creme-50)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Add memory (owner only) */}
      {isOwner && myProfileId && (
        <NewMemoryForm profileId={myProfileId} onCreated={() => memoriesQ.refetch()} />
      )}

      {/* Timeline */}
      {memoriesQ.isLoading ? (
        <div className="text-center py-8 text-sm" style={{ color: "var(--creme-50)" }}>Carregando...</div>
      ) : memories.length === 0 ? (
        <div className="text-center py-10 text-sm" style={{ color: "var(--creme-50)" }}>
          {isOwner ? "Nenhuma memória ainda. Adicione seu primeiro momento!" : "Sem memórias públicas."}
        </div>
      ) : (
        <div
          className="relative pl-3"
          style={{ borderLeft: "2px solid var(--terra)" }}
        >
          {memories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory as Memory}
              isOwner={isOwner}
              onDelete={isOwner ? (id) => deleteMutation.mutate({ id }) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
