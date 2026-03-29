import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { PROFILE_TYPES } from "@shared/pnsp";

// ─── Design tokens ───────────────────────────────────────────────────────────
const GOLD   = "#D4A017";
const CARD   = "#1a1200";
const BORDER = "rgba(212,160,23,0.15)";

const CONTEXTS = ["Show", "Aula", "Produção", "Parceria", "Outro"] as const;

// ─── StarDisplay ─────────────────────────────────────────────────────────────
export function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ color: GOLD, fontSize: size, lineHeight: 1, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? GOLD : "rgba(212,160,23,0.25)" }}>★</span>
      ))}
    </span>
  );
}

// ─── StarPicker ───────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div style={{ display: "flex", gap: 4, cursor: "pointer", userSelect: "none" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          style={{
            fontSize: 32,
            color: i <= display ? GOLD : "rgba(212,160,23,0.25)",
            transition: "color 0.12s, transform 0.12s",
            transform: i <= display ? "scale(1.1)" : "scale(1)",
            display: "inline-block",
          }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ─── ReplyForm ────────────────────────────────────────────────────────────────
function ReplyForm({ reviewId, onSuccess }: { reviewId: number; onSuccess: () => void }) {
  const [text, setText]     = useState("");
  const [error, setError]   = useState("");
  const replyMutation = trpc.reviews.replyToReview.useMutation({
    onSuccess: () => { onSuccess(); },
    onError: (e: any) => setError(e.message ?? "Erro ao enviar resposta"),
  });

  function handleSubmit() {
    if (!text.trim()) { setError("Digite uma resposta"); return; }
    setError("");
    replyMutation.mutate({ reviewId, reply: text.trim() });
  }

  return (
    <div style={{ marginTop: 12, padding: "14px 16px", background: "rgba(212,160,23,0.04)", borderRadius: 10, border: `1px solid rgba(212,160,23,0.12)` }}>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "Inter, var(--font-body)", marginBottom: 10 }}>
        Escreva sua resposta:
      </p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        placeholder="Obrigado pelo feedback..."
        style={{
          width: "100%", resize: "vertical", minHeight: 80,
          background: "#0f0c00", border: `1px solid rgba(212,160,23,0.20)`,
          borderRadius: 8, padding: "10px 12px",
          color: "rgba(255,255,255,0.85)", fontSize: 13,
          fontFamily: "Inter, var(--font-body)", outline: "none",
          boxSizing: "border-box",
        }}
      />
      {error && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 6, fontFamily: "Inter, var(--font-body)" }}>{error}</p>}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={replyMutation.isPending}
          style={{
            padding: "7px 18px",
            background: GOLD, color: "#0a0800",
            border: "none", borderRadius: 8,
            fontSize: 13, fontWeight: 700,
            fontFamily: "Inter, var(--font-body)",
            cursor: "pointer", opacity: replyMutation.isPending ? 0.6 : 1,
          }}
        >
          {replyMutation.isPending ? "Enviando…" : "Enviar resposta"}
        </button>
      </div>
    </div>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────
function ReviewCard({
  review, isOwner, onReplySuccess,
}: {
  review: {
    id: number;
    rating: number;
    comment: string | null;
    context: string | null;
    ownerReply: string | null;
    createdAt: Date | string;
    reviewerId: number;
    reviewerName: string;
    reviewerAvatar: string | null;
    reviewerType: string;
    reviewerSlug: string | null;
  };
  isOwner: boolean;
  onReplySuccess: () => void;
}) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div style={{
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      padding: "20px 22px",
      marginBottom: 14,
    }}>
      {/* Header: avatar + nome + data */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar inicial */}
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(212,160,23,0.12)",
            border: "1px solid rgba(212,160,23,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 700, color: GOLD, flexShrink: 0,
            overflow: "hidden",
          }}>
            {review.reviewerAvatar ? (
              <img
                src={review.reviewerAvatar}
                alt={review.reviewerName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              review.reviewerName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)", fontFamily: "Inter, var(--font-body)" }}>
              {review.reviewerName}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, var(--font-body)" }}>
              {PROFILE_TYPES[review.reviewerType as keyof typeof PROFILE_TYPES] ?? review.reviewerType?.replace(/_/g, " ")}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "Inter, var(--font-body)" }}>
            {new Date(review.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Estrelas + contexto */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <StarDisplay rating={review.rating} size={16} />
        {review.context && (
          <span style={{
            fontSize: 11, padding: "2px 9px", borderRadius: 99,
            background: "rgba(212,160,23,0.10)", border: "1px solid rgba(212,160,23,0.22)",
            color: GOLD, fontWeight: 600, fontFamily: "Inter, var(--font-body)",
          }}>
            {review.context}
          </span>
        )}
      </div>

      {/* Comentário */}
      {review.comment && (
        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.75)",
          lineHeight: 1.6, fontFamily: "Inter, var(--font-body)",
          margin: 0, marginBottom: review.ownerReply || (isOwner && !review.ownerReply) ? 14 : 0,
        }}>
          {review.comment}
        </p>
      )}

      {/* Resposta do dono */}
      {review.ownerReply && (
        <div style={{
          background: "rgba(212,160,23,0.05)",
          border: "1px solid rgba(212,160,23,0.12)",
          borderRadius: 10, padding: "12px 14px",
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 6, fontFamily: "Inter, var(--font-body)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Resposta do profissional
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.55, fontFamily: "Inter, var(--font-body)", margin: 0 }}>
            {review.ownerReply}
          </p>
        </div>
      )}

      {/* Botão responder (só dono, sem reply ainda) */}
      {isOwner && !review.ownerReply && (
        <>
          {!showReply ? (
            <button
              type="button"
              onClick={() => setShowReply(true)}
              style={{
                marginTop: 10, padding: "5px 14px",
                background: "none", border: `1px solid rgba(212,160,23,0.25)`,
                borderRadius: 8, color: GOLD,
                fontSize: 12, fontWeight: 600,
                fontFamily: "Inter, var(--font-body)",
                cursor: "pointer", transition: "border-color 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,160,23,0.25)"; }}
            >
              Responder
            </button>
          ) : (
            <ReplyForm
              reviewId={review.id}
              onSuccess={() => { setShowReply(false); onReplySuccess(); }}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── ReviewForm ───────────────────────────────────────────────────────────────
function ReviewForm({ profileId, onSuccess }: { profileId: number; onSuccess: () => void }) {
  const [rating, setRating]   = useState(0);
  const [context, setContext] = useState("Outro");
  const [comment, setComment] = useState("");
  const [error, setError]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const createMutation = trpc.reviews.create.useMutation({
    onSuccess: () => { setSubmitted(true); onSuccess(); },
    onError: (e: any) => setError(e.message ?? "Erro ao enviar avaliação"),
  });

  function handleSubmit() {
    if (rating === 0)          { setError("Selecione uma nota de 1 a 5 estrelas"); return; }
    if (comment.trim().length < 20) { setError("Comentário mínimo de 20 caracteres"); return; }
    setError("");
    createMutation.mutate({ reviewedId: profileId, rating, comment: comment.trim(), context });
  }

  if (submitted) {
    return (
      <div style={{
        background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
        borderRadius: 14, padding: "20px 24px", textAlign: "center",
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
        <p style={{ color: "#22C55E", fontWeight: 700, fontFamily: "Inter, var(--font-body)", fontSize: 15, marginBottom: 4 }}>
          Avaliação enviada!
        </p>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, fontFamily: "Inter, var(--font-body)" }}>
          Obrigado pelo seu feedback.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: 14, padding: "22px 24px", marginBottom: 24,
    }}>
      <h3 style={{
        fontFamily: "Syne, var(--font-display)", fontSize: 17,
        fontWeight: 700, color: GOLD, marginBottom: 18,
      }}>
        Deixar avaliação
      </h3>

      {/* Star picker */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "Inter, var(--font-body)", marginBottom: 8 }}>
          Sua nota *
        </p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {/* Contexto */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "Inter, var(--font-body)", marginBottom: 8 }}>
          Contexto da avaliação
        </p>
        <select
          value={context}
          onChange={e => setContext(e.target.value)}
          style={{
            padding: "9px 14px",
            background: "#0f0c00",
            border: `1px solid rgba(212,160,23,0.25)`,
            borderRadius: 8,
            color: "rgba(255,255,255,0.85)",
            fontSize: 13, fontFamily: "Inter, var(--font-body)",
            cursor: "pointer", outline: "none",
          }}
        >
          {CONTEXTS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Comentário */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "Inter, var(--font-body)", marginBottom: 8 }}>
          Comentário * <span style={{ color: "rgba(255,255,255,0.25)" }}>(mínimo 20 caracteres)</span>
        </p>
        <textarea
          value={comment}
          onChange={e => { setComment(e.target.value); if (error) setError(""); }}
          rows={4}
          placeholder="Conte como foi trabalhar com este profissional..."
          style={{
            width: "100%", resize: "vertical", minHeight: 96,
            background: "#0f0c00", border: `1px solid rgba(212,160,23,0.20)`,
            borderRadius: 8, padding: "10px 12px",
            color: "rgba(255,255,255,0.85)", fontSize: 13,
            fontFamily: "Inter, var(--font-body)", outline: "none",
            boxSizing: "border-box",
          }}
        />
        <p style={{ fontSize: 11, color: comment.length >= 20 ? "rgba(34,197,94,0.7)" : "rgba(255,255,255,0.25)", fontFamily: "Inter, var(--font-body)", marginTop: 4 }}>
          {comment.length}/1000
        </p>
      </div>

      {/* Erro */}
      {error && (
        <p style={{ color: "#ef4444", fontSize: 13, fontFamily: "Inter, var(--font-body)", marginBottom: 14 }}>
          {error}
        </p>
      )}

      {/* Botão enviar */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={createMutation.isPending}
        style={{
          padding: "11px 28px",
          background: GOLD, color: "#0a0800",
          border: "none", borderRadius: 10,
          fontSize: 14, fontWeight: 700,
          fontFamily: "Inter, var(--font-body)",
          cursor: "pointer",
          opacity: createMutation.isPending ? 0.6 : 1,
          transition: "opacity 0.2s, transform 0.15s",
        }}
        onMouseEnter={e => { if (!createMutation.isPending) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
      >
        {createMutation.isPending ? "Enviando…" : "Enviar avaliação"}
      </button>
    </div>
  );
}

// ─── ReviewStats ──────────────────────────────────────────────────────────────
function ReviewStats({ stats }: {
  stats: { avg: number; total: number; distribution: Array<{ rating: number; count: number }> };
}) {
  const maxCount = Math.max(...stats.distribution.map(d => d.count), 1);
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`,
      borderRadius: 16, padding: "24px 28px", marginBottom: 24,
      display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap",
    }}>
      {/* Média grande */}
      <div style={{ textAlign: "center", minWidth: 90 }}>
        <div style={{
          fontFamily: "Syne, var(--font-display)",
          fontSize: 56, fontWeight: 800, color: GOLD, lineHeight: 1,
        }}>
          {stats.avg.toFixed(1)}
        </div>
        <div style={{ marginTop: 6, marginBottom: 4 }}>
          <StarDisplay rating={stats.avg} size={18} />
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "Inter, var(--font-body)" }}>
          {stats.total} {stats.total === 1 ? "avaliação" : "avaliações"}
        </div>
      </div>

      {/* Barras por estrela */}
      <div style={{ flex: 1, minWidth: 200 }}>
        {stats.distribution.map(({ rating, count }) => (
          <div key={rating} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
            <span style={{ color: GOLD, fontSize: 12, fontWeight: 700, width: 18, textAlign: "right", fontFamily: "Inter, var(--font-body)" }}>
              {rating}
            </span>
            <span style={{ color: GOLD, fontSize: 13 }}>★</span>
            <div style={{ flex: 1, height: 7, background: "rgba(212,160,23,0.12)", borderRadius: 99 }}>
              <div style={{
                height: "100%",
                width: `${Math.round((count / maxCount) * 100)}%`,
                background: GOLD,
                borderRadius: 99,
                transition: "width 0.8s ease",
              }} />
            </div>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, width: 18, fontFamily: "Inter, var(--font-body)" }}>
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ReviewSection (export default) ──────────────────────────────────────────
export default function ReviewSection({
  profileId,
  isOwner,
  currentUserProfileId,
}: {
  profileId: number;
  isOwner: boolean;
  currentUserProfileId?: number | null;
}) {
  const { isAuthenticated } = useAuth();

  const { data: reviewsList, refetch: refetchReviews } =
    trpc.reviews.getByProfile.useQuery({ profileId });

  const { data: statsData, refetch: refetchStats } =
    trpc.reviews.getStats.useQuery({ profileId });

  const alreadyReviewed = currentUserProfileId
    ? (reviewsList ?? []).some((r: any) => Number(r.reviewerId) === currentUserProfileId)
    : false;

  const canReview = !!isAuthenticated && !isOwner && !!currentUserProfileId && !alreadyReviewed;

  function handleNewReview() {
    refetchReviews();
    refetchStats();
  }

  const hasReviews = (statsData?.total ?? 0) > 0;

  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{
        fontFamily: "Syne, var(--font-display)",
        fontSize: "var(--text-xl)", fontWeight: 700,
        marginBottom: 16, color: "var(--ouro)",
      }}>
        Avaliações
      </h2>

      {/* Stats block */}
      {hasReviews && statsData && <ReviewStats stats={statsData} />}

      {/* Formulário de nova avaliação */}
      {canReview && (
        <ReviewForm profileId={profileId} onSuccess={handleNewReview} />
      )}

      {/* Prompt para login */}
      {!isAuthenticated && !isOwner && (
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 12, padding: "16px 20px",
          fontSize: 13, color: "rgba(255,255,255,0.5)",
          fontFamily: "Inter, var(--font-body)",
          marginBottom: 20,
        }}>
          <a href="/entrar" style={{ color: GOLD, fontWeight: 600 }}>Entre</a> para deixar uma avaliação.
        </div>
      )}

      {/* Lista de reviews */}
      {(reviewsList ?? []).length > 0 ? (
        (reviewsList as any[]).map((review: any) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwner={isOwner}
            onReplySuccess={() => refetchReviews()}
          />
        ))
      ) : (
        !canReview && (
          <div style={{
            padding: "32px 0", textAlign: "center",
            color: "rgba(255,255,255,0.25)", fontSize: 13,
            fontFamily: "Inter, var(--font-body)",
          }}>
            Nenhuma avaliação ainda. Seja o primeiro a avaliar!
          </div>
        )
      )}
    </div>
  );
}
