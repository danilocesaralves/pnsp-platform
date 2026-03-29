import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Plus, ChevronLeft, ChevronRight, Pencil, Trash2,
  MapPin, Clock, Music2, Mic2, Radio, Users2, Calendar,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type EventType   = "show" | "ensaio" | "gravacao" | "reuniao" | "outro";
type EventStatus = "confirmado" | "pendente" | "cancelado";

interface EventData {
  id:        number;
  title:     string;
  type:      EventType;
  date:      string;
  startTime: string | null;
  endTime:   string | null;
  location:  string | null;
  city:      string | null;
  state:     string | null;
  notes:     string | null;
  status:    EventStatus;
  isPublic:  boolean | null;
}

interface FormState {
  title:     string;
  type:      EventType;
  date:      string;
  startTime: string;
  endTime:   string;
  location:  string;
  city:      string;
  state:     string;
  notes:     string;
  status:    EventStatus;
  isPublic:  boolean;
}

const EMPTY_FORM: FormState = {
  title: "", type: "show", date: "",
  startTime: "", endTime: "", location: "",
  city: "", state: "", notes: "",
  status: "pendente", isPublic: false,
};

// ─── EventTypeBadge ───────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<EventType, { label: string; color: string; bg: string; Icon: React.ComponentType<any> }> = {
  show:     { label: "Show",     color: "#A78BFA", bg: "rgba(124,58,237,0.15)", Icon: Music2   },
  ensaio:   { label: "Ensaio",   color: "#60A5FA", bg: "rgba(37,99,235,0.15)",  Icon: Mic2     },
  gravacao: { label: "Gravação", color: "#34D399", bg: "rgba(5,150,105,0.15)",  Icon: Radio    },
  reuniao:  { label: "Reunião",  color: "#FBBF24", bg: "rgba(217,119,6,0.15)",  Icon: Users2   },
  outro:    { label: "Outro",    color: "#9CA3AF", bg: "rgba(107,107,107,0.15)", Icon: Calendar },
};

function EventTypeBadge({ type }: { type: EventType }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 9999,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
    }}>
      <cfg.Icon style={{ width: 10, height: 10 }} />
      {cfg.label}
    </span>
  );
}

// ─── EventStatusBadge ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<EventStatus, { label: string; color: string; bg: string }> = {
  confirmado: { label: "Confirmado", color: "#22C55E", bg: "rgba(34,197,94,0.15)"  },
  pendente:   { label: "Pendente",   color: "#D4A017", bg: "rgba(212,160,23,0.15)" },
  cancelado:  { label: "Cancelado",  color: "#EF4444", bg: "rgba(239,68,68,0.15)"  },
};

function EventStatusBadge({ status }: { status: EventStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 9999,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700,
    }}>
      {cfg.label}
    </span>
  );
}

// ─── EventCard ────────────────────────────────────────────────────────────────
function EventCard({ event, isOwner, onEdit, onDelete }: {
  event: EventData;
  isOwner: boolean;
  onEdit: (e: EventData) => void;
  onDelete: (id: number) => void;
}) {
  const dateStr = new Date(event.date + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div style={{
      background: "var(--terra-escura)",
      border: "1px solid var(--creme-10)",
      borderRadius: "var(--radius-md)",
      padding: "16px",
      display: "flex", gap: 14, alignItems: "flex-start",
    }}>
      {/* Coluna de data */}
      <div style={{
        minWidth: 52, textAlign: "center",
        background: "var(--ouro-sutil)", border: "1px solid rgba(212,146,10,0.25)",
        borderRadius: 8, padding: "8px 6px", flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase" }}>
          {new Date(event.date + "T12:00:00").toLocaleDateString("pt-BR", { month: "short" })}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--creme)", lineHeight: 1 }}>
          {new Date(event.date + "T12:00:00").getDate()}
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {event.title}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
          <EventTypeBadge type={event.type} />
          <EventStatusBadge status={event.status} />
          {event.isPublic && (
            <span style={{ padding: "2px 8px", borderRadius: 9999, background: "rgba(212,146,10,0.10)", color: "var(--ouro)", fontSize: 11, fontWeight: 600 }}>
              Público
            </span>
          )}
        </div>
        {(event.startTime || event.endTime) && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", color: "var(--creme-50)", marginBottom: 4 }}>
            <Clock style={{ width: 11, height: 11 }} />
            {event.startTime}{event.endTime ? ` — ${event.endTime}` : ""}
          </div>
        )}
        {(event.city || event.location) && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", color: "var(--creme-50)", marginBottom: 4 }}>
            <MapPin style={{ width: 11, height: 11 }} />
            {event.location || ""}{event.city ? ` · ${event.city}${event.state ? `/${event.state}` : ""}` : ""}
          </div>
        )}
        {event.notes && (
          <p style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", marginTop: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {event.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      {isOwner && (
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => onEdit(event)}
            style={{ padding: 6, borderRadius: 6, border: "1px solid var(--creme-10)", background: "none", cursor: "pointer", color: "var(--creme-50)", transition: "var(--transition)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--ouro)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.40)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--creme-50)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--creme-10)"; }}
          >
            <Pencil style={{ width: 12, height: 12 }} />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            style={{ padding: 6, borderRadius: 6, border: "1px solid var(--creme-10)", background: "none", cursor: "pointer", color: "var(--creme-50)", transition: "var(--transition)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#EF4444"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.40)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--creme-50)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--creme-10)"; }}
          >
            <Trash2 style={{ width: 12, height: 12 }} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── CalendarMini ─────────────────────────────────────────────────────────────
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function CalendarMini({ events, selectedDay, onSelectDay }: {
  events: EventData[];
  selectedDay: string | null;
  onSelectDay: (d: string | null) => void;
}) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const eventDays = new Set(
    events
      .filter(e => {
        const d = new Date(e.date + "T12:00:00");
        return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
      })
      .map(e => e.date)
  );

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const cells: (number | null)[] = [...Array(firstDay).fill(null)];
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div style={{ background: "var(--terra-escura)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-md)", padding: 16 }}>
      {/* Header navegação */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button
          onClick={prevMonth}
          style={{ padding: 4, background: "none", border: "none", cursor: "pointer", color: "var(--creme-50)", borderRadius: 4 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--ouro)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--creme-50)"; }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
        </button>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--creme)" }}>
          {MONTHS_PT[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          style={{ padding: 4, background: "none", border: "none", cursor: "pointer", color: "var(--creme-50)", borderRadius: 4 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--ouro)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--creme-50)"; }}
        >
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Dias da semana */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--creme-50)", padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Grid de dias */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasEvent  = eventDays.has(iso);
          const isToday   = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const isSelected = iso === selectedDay;

          return (
            <button
              key={idx}
              onClick={() => onSelectDay(isSelected ? null : iso)}
              style={{
                position: "relative",
                padding: "6px 2px",
                textAlign: "center",
                fontSize: 12,
                fontWeight: isToday ? 700 : 400,
                borderRadius: 6,
                border: isSelected ? "1px solid var(--ouro)" : "1px solid transparent",
                background: isSelected ? "var(--ouro-sutil)" : isToday ? "var(--creme-10)" : "none",
                color: isSelected ? "var(--ouro)" : isToday ? "var(--creme)" : "var(--creme-80)",
                cursor: "pointer",
                transition: "var(--transition)",
              }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--creme-10)"; }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "none"; }}
            >
              {day}
              {hasEvent && (
                <span style={{
                  position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
                  width: 4, height: 4, borderRadius: "50%", background: "var(--ouro)",
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── EventForm ────────────────────────────────────────────────────────────────
const inputSt: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,146,10,0.15)",
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 14,
  color: "var(--creme)",
  outline: "none",
  fontFamily: "var(--font-body)",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

function FieldGroup({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div style={{ flex: half ? "1 1 calc(50% - 6px)" : "1 1 100%", minWidth: 0 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</label>
      {children}
    </div>
  );
}

function EventForm({ onSave, onCancel, initial }: {
  onSave:   (data: Omit<FormState, ""> ) => void;
  onCancel: () => void;
  initial?: Partial<FormState>;
}) {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, ...initial });

  function set(key: keyof FormState, val: any) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.50)";
  }
  function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.15)";
  }

  return (
    <div style={{ background: "var(--terra)", border: "1px solid rgba(212,146,10,0.25)", borderRadius: "var(--radius-lg)", padding: 24 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 20 }}>
        {initial?.title ? "Editar Evento" : "Novo Evento"}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {/* Título */}
        <FieldGroup label="Título *">
          <input
            style={inputSt}
            placeholder="Ex: Show no Bar do João"
            value={form.title}
            onChange={e => set("title", e.target.value)}
            onFocus={focusBorder} onBlur={blurBorder}
            onKeyDown={e => e.key === "Enter" && e.preventDefault()}
          />
        </FieldGroup>

        {/* Tipo */}
        <FieldGroup label="Tipo" half>
          <select
            style={{ ...inputSt, cursor: "pointer" }}
            value={form.type}
            onChange={e => set("type", e.target.value as EventType)}
            onFocus={focusBorder} onBlur={blurBorder}
          >
            <option value="show">Show</option>
            <option value="ensaio">Ensaio</option>
            <option value="gravacao">Gravação</option>
            <option value="reuniao">Reunião</option>
            <option value="outro">Outro</option>
          </select>
        </FieldGroup>

        {/* Status */}
        <FieldGroup label="Status" half>
          <select
            style={{ ...inputSt, cursor: "pointer" }}
            value={form.status}
            onChange={e => set("status", e.target.value as EventStatus)}
            onFocus={focusBorder} onBlur={blurBorder}
          >
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </FieldGroup>

        {/* Data */}
        <FieldGroup label="Data *" half>
          <input
            type="date"
            style={inputSt}
            value={form.date}
            onChange={e => set("date", e.target.value)}
            onFocus={focusBorder} onBlur={blurBorder}
          />
        </FieldGroup>

        {/* Horários */}
        <FieldGroup label="Início" half>
          <input
            type="time"
            style={inputSt}
            value={form.startTime}
            onChange={e => set("startTime", e.target.value)}
            onFocus={focusBorder} onBlur={blurBorder}
          />
        </FieldGroup>
        <FieldGroup label="Término" half>
          <input
            type="time"
            style={inputSt}
            value={form.endTime}
            onChange={e => set("endTime", e.target.value)}
            onFocus={focusBorder} onBlur={blurBorder}
          />
        </FieldGroup>

        {/* Local */}
        <FieldGroup label="Local / Endereço">
          <input
            style={inputSt}
            placeholder="Bar do Samba, Rua das Flores 100"
            value={form.location}
            onChange={e => set("location", e.target.value)}
            onFocus={focusBorder} onBlur={blurBorder}
            onKeyDown={e => e.key === "Enter" && e.preventDefault()}
          />
        </FieldGroup>

        {/* Cidade / Estado */}
        <FieldGroup label="Cidade" half>
          <input
            style={inputSt}
            placeholder="Rio de Janeiro"
            value={form.city}
            onChange={e => set("city", e.target.value)}
            onFocus={focusBorder} onBlur={blurBorder}
            onKeyDown={e => e.key === "Enter" && e.preventDefault()}
          />
        </FieldGroup>
        <FieldGroup label="Estado" half>
          <input
            style={inputSt}
            placeholder="RJ"
            maxLength={2}
            value={form.state}
            onChange={e => set("state", e.target.value.toUpperCase())}
            onFocus={focusBorder} onBlur={blurBorder}
            onKeyDown={e => e.key === "Enter" && e.preventDefault()}
          />
        </FieldGroup>

        {/* Notas */}
        <FieldGroup label="Observações">
          <textarea
            style={{ ...inputSt, resize: "vertical", minHeight: 72 } as React.CSSProperties}
            placeholder="Detalhes adicionais, setlist, rider..."
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
            onFocus={focusBorder} onBlur={blurBorder}
          />
        </FieldGroup>

        {/* isPublic */}
        <FieldGroup label="">
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={() => set("isPublic", !form.isPublic)}
          >
            <div style={{
              width: 36, height: 20, borderRadius: 10,
              background: form.isPublic ? "var(--ouro)" : "var(--creme-10)",
              position: "relative", transition: "var(--transition)", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", top: 2,
                left: form.isPublic ? 18 : 2,
                width: 16, height: 16, borderRadius: "50%",
                background: form.isPublic ? "var(--preto)" : "var(--creme-50)",
                transition: "var(--transition)",
              }} />
            </div>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--creme-80)" }}>
              Visível no perfil público
            </span>
          </div>
        </FieldGroup>
      </div>

      {/* Botões */}
      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid var(--creme-20)", background: "none", color: "var(--creme-80)", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-body)" }}
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            if (!form.title.trim()) { toast.error("Título é obrigatório"); return; }
            if (!form.date) { toast.error("Data é obrigatória"); return; }
            onSave(form);
          }}
          className="pnsp-btn-primary"
          style={{ padding: "9px 24px", fontSize: 14 }}
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

// ─── AgendaTab ────────────────────────────────────────────────────────────────
export default function AgendaTab() {
  const { data: eventsData = [], refetch } = trpc.events.getMyEvents.useQuery();
  const createEvent = trpc.events.create.useMutation({
    onSuccess: () => { toast.success("Evento criado!"); refetch(); setShowForm(false); },
    onError:   (e) => toast.error(e.message),
  });
  const updateEvent = trpc.events.update.useMutation({
    onSuccess: () => { toast.success("Evento atualizado!"); refetch(); setEditingEvent(null); },
    onError:   (e) => toast.error(e.message),
  });
  const deleteEvent = trpc.events.delete.useMutation({
    onSuccess: () => { toast.success("Evento excluído"); refetch(); },
    onError:   (e) => toast.error(e.message),
  });

  const [showForm,      setShowForm]      = useState(false);
  const [editingEvent,  setEditingEvent]  = useState<EventData | null>(null);
  const [selectedDay,   setSelectedDay]   = useState<string | null>(null);

  const filteredEvents = selectedDay
    ? eventsData.filter(e => e.date === selectedDay)
    : eventsData;

  // Ordena: futuros primeiro, depois passados
  const today = new Date().toISOString().split("T")[0];
  const upcoming = filteredEvents.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past     = filteredEvents.filter(e => e.date <  today).sort((a, b) => b.date.localeCompare(a.date));

  function handleSave(data: FormState) {
    createEvent.mutate({
      ...data,
      startTime: data.startTime || undefined,
      endTime:   data.endTime   || undefined,
      location:  data.location  || undefined,
      city:      data.city      || undefined,
      state:     data.state     || undefined,
      notes:     data.notes     || undefined,
    });
  }

  function handleUpdate(data: Partial<FormState>) {
    if (!editingEvent) return;
    updateEvent.mutate({
      id:   editingEvent.id,
      data: {
        ...data,
        startTime: data.startTime || undefined,
        endTime:   data.endTime   || undefined,
        location:  data.location  || undefined,
        city:      data.city      || undefined,
        state:     data.state     || undefined,
        notes:     data.notes     || undefined,
      },
    });
  }

  function handleDelete(id: number) {
    deleteEvent.mutate({ id });
  }

  function openEdit(event: EventData) {
    setEditingEvent(event);
    setShowForm(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 700 }}>Minha Agenda</h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)", marginTop: 2 }}>
            {eventsData.length} evento{eventsData.length !== 1 ? "s" : ""} cadastrado{eventsData.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setEditingEvent(null); }}
          className="pnsp-btn-primary"
          style={{ padding: "10px 20px", fontSize: "var(--text-sm)" }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Novo Evento
        </button>
      </div>

      {/* Layout 2 colunas: calendário + lista */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 280px) 1fr", gap: 20, alignItems: "start" }}>

        {/* Calendário */}
        <CalendarMini
          events={eventsData}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />

        {/* Lista + formulários */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Formulário de criação */}
          {showForm && (
            <EventForm
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Formulário de edição */}
          {editingEvent && (
            <EventForm
              initial={{
                title:     editingEvent.title,
                type:      editingEvent.type,
                date:      editingEvent.date,
                startTime: editingEvent.startTime ?? "",
                endTime:   editingEvent.endTime   ?? "",
                location:  editingEvent.location  ?? "",
                city:      editingEvent.city       ?? "",
                state:     editingEvent.state      ?? "",
                notes:     editingEvent.notes      ?? "",
                status:    editingEvent.status,
                isPublic:  editingEvent.isPublic   ?? false,
              }}
              onSave={handleUpdate}
              onCancel={() => setEditingEvent(null)}
            />
          )}

          {/* Filtro ativo */}
          {selectedDay && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--ouro-sutil)", borderRadius: 8, border: "1px solid rgba(212,146,10,0.25)" }}>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--ouro)", fontWeight: 600 }}>
                Filtrado: {new Date(selectedDay + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
              </span>
              <button
                onClick={() => setSelectedDay(null)}
                style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--ouro)", cursor: "pointer", fontSize: "var(--text-sm)" }}
              >
                Limpar ✕
              </button>
            </div>
          )}

          {/* Eventos futuros */}
          {upcoming.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Próximos eventos
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {upcoming.map(e => (
                  <EventCard key={e.id} event={e} isOwner onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Eventos passados */}
          {past.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--creme-50)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, marginTop: upcoming.length > 0 ? 8 : 0 }}>
                Histórico
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {past.map(e => (
                  <EventCard key={e.id} event={e} isOwner onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Estado vazio */}
          {eventsData.length === 0 && !showForm && (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--terra-escura)", borderRadius: "var(--radius-md)", border: "1px dashed var(--creme-10)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎸</div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>Nenhum evento ainda</p>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)", marginBottom: 20 }}>
                Adicione seus shows, ensaios e gravações para gerenciar sua agenda
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="pnsp-btn-primary"
                style={{ padding: "10px 24px", fontSize: "var(--text-sm)" }}
              >
                <Plus style={{ width: 14, height: 14 }} />
                Adicionar Primeiro Evento
              </button>
            </div>
          )}

          {selectedDay && filteredEvents.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 24px", color: "var(--creme-50)", fontSize: "var(--text-sm)", background: "var(--terra-escura)", borderRadius: "var(--radius-md)", border: "1px dashed var(--creme-10)" }}>
              Nenhum evento neste dia. Clique em "Novo Evento" para adicionar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
