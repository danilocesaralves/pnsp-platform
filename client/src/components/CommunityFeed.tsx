import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Heart, MessageCircle, Send, Image, Video, Trophy, Calendar, Briefcase, FileText } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type PostType = "texto" | "imagem" | "video" | "evento" | "oportunidade" | "conquista";
type CommunityPost = {
  id: number;
  postType: PostType;
  title?: string | null;
  body: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string | Date;
  tags?: string[] | null;
};
type Profile = { id: number; displayName: string; avatarUrl?: string | null; profileType: string };
type PostRow = { post: CommunityPost; profile: Profile };

// ─── PostTypeBadge ────────────────────────────────────────────────────────────
function PostTypeBadge({ type }: { type: PostType }) {
  const config: Record<PostType, { label: string; color: string; icon: React.ReactNode }> = {
    texto: { label: "Post", color: "var(--creme-50)", icon: <FileText size={10} /> },
    imagem: { label: "Foto", color: "var(--ouro)", icon: <Image size={10} /> },
    video: { label: "Vídeo", color: "#e55", icon: <Video size={10} /> },
    evento: { label: "Evento", color: "var(--verde)", icon: <Calendar size={10} /> },
    oportunidade: { label: "Oportunidade", color: "#7c5cbf", icon: <Briefcase size={10} /> },
    conquista: { label: "Conquista", color: "var(--ouro)", icon: <Trophy size={10} /> },
  };
  const c = config[type] ?? config.texto;
  return (
    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full" style={{ background: c.color + "22", color: c.color }}>
      {c.icon}{c.label}
    </span>
  );
}

// ─── CommentItem ─────────────────────────────────────────────────────────────
function CommentItem({ body, displayName, avatarUrl, createdAt }: {
  body: string; displayName: string; avatarUrl?: string | null; createdAt: string | Date;
}) {
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex gap-2 items-start">
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: "var(--ouro)", color: "#0A0800" }}>
        {avatarUrl ? <img src={avatarUrl} alt={displayName} className="w-6 h-6 rounded-full object-cover" /> : initials}
      </div>
      <div className="flex-1">
        <span className="text-xs font-semibold" style={{ color: "var(--creme)" }}>{displayName}</span>
        <p className="text-xs" style={{ color: "var(--creme-50)" }}>{body}</p>
      </div>
    </div>
  );
}

// ─── PostCard ────────────────────────────────────────────────────────────────
function PostCard({
  row,
  myProfileId,
  likedPostIds,
  onLike,
  onComment,
}: {
  row: PostRow;
  myProfileId?: number;
  likedPostIds: number[];
  onLike: (postId: number) => void;
  onComment: (postId: number, body: string) => void;
}) {
  const { post, profile } = row;
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const isLiked = likedPostIds.includes(post.id);
  const initials = profile.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const commentsQ = trpc.community.getComments.useQuery({ postId: post.id }, { enabled: showComments });

  const handleComment = () => {
    if (!commentText.trim() || !myProfileId) return;
    onComment(post.id, commentText.trim());
    setCommentText("");
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--terra)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: "var(--ouro)", color: "#0A0800" }}>
          {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} className="w-10 h-10 rounded-full object-cover" /> : initials}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: "var(--creme)" }}>{profile.displayName}</p>
          <div className="flex items-center gap-2">
            <PostTypeBadge type={post.postType} />
            <span className="text-xs" style={{ color: "var(--creme-50)" }}>
              {new Date(post.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        {post.title && (
          <p className="text-sm font-bold mb-1" style={{ color: "var(--creme)" }}>{post.title}</p>
        )}
        <p className="text-sm leading-relaxed" style={{ color: "var(--creme-50)" }}>{post.body}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--n900)", color: "var(--ouro)" }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-2 border-t" style={{ borderColor: "var(--n900)" }}>
        <button
          onClick={() => myProfileId && onLike(post.id)}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: isLiked ? "#e55" : "var(--creme-50)" }}
        >
          <Heart size={16} fill={isLiked ? "#e55" : "none"} />
          <span>{post.likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "var(--creme-50)" }}
        >
          <MessageCircle size={16} />
          <span>{post.commentsCount}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-4 space-y-2">
          {commentsQ.data?.map((r) => (
            <CommentItem
              key={r.comment.id}
              body={r.comment.body}
              displayName={r.profile.displayName}
              avatarUrl={r.profile.avatarUrl}
              createdAt={r.comment.createdAt}
            />
          ))}
          {myProfileId && (
            <div className="flex gap-2 mt-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Comentar..."
                className="flex-1 text-sm px-3 py-1.5 rounded-lg border-0 outline-none"
                style={{ background: "var(--n900)", color: "var(--creme)" }}
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                className="p-1.5 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ color: "var(--ouro)" }}
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── NewPostForm ──────────────────────────────────────────────────────────────
function NewPostForm({ profileId, onCreated }: { profileId: number; onCreated: () => void }) {
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState<PostType>("texto");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");

  const create = trpc.community.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post publicado!");
      setBody("");
      setTitle("");
      setTags("");
      onCreated();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!body.trim()) return;
    create.mutate({
      profileId,
      postType,
      title: title.trim() || undefined,
      body: body.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--terra)", border: "1px solid var(--ouro)44" }}>
      <div className="flex items-center gap-2 mb-1">
        <Send size={14} style={{ color: "var(--ouro)" }} />
        <span className="text-sm font-bold" style={{ color: "var(--ouro)" }}>Compartilhar com a comunidade</span>
      </div>
      <div className="flex gap-2">
        <select
          value={postType}
          onChange={(e) => setPostType(e.target.value as PostType)}
          className="text-sm px-2 py-1.5 rounded-lg border-0 outline-none"
          style={{ background: "var(--n900)", color: "var(--creme)" }}
        >
          {(["texto","imagem","video","evento","oportunidade","conquista"] as PostType[]).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título (opcional)"
          className="flex-1 text-sm px-3 py-1.5 rounded-lg border-0 outline-none"
          style={{ background: "var(--n900)", color: "var(--creme)" }}
        />
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="O que você quer compartilhar?"
        rows={3}
        className="w-full text-sm px-3 py-2 rounded-lg border-0 outline-none resize-none"
        style={{ background: "var(--n900)", color: "var(--creme)" }}
      />
      <div className="flex items-center gap-2">
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (separadas por vírgula)"
          className="flex-1 text-sm px-3 py-1.5 rounded-lg border-0 outline-none"
          style={{ background: "var(--n900)", color: "var(--creme)" }}
        />
        <button
          onClick={handleSubmit}
          disabled={!body.trim() || create.isPending}
          className="pnsp-btn-primary text-sm px-4 py-1.5 disabled:opacity-40"
        >
          {create.isPending ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </div>
  );
}

// ─── CommunityFeed (default export) ──────────────────────────────────────────
export default function CommunityFeed({
  myProfileId,
  showComposer = true,
}: {
  myProfileId?: number;
  showComposer?: boolean;
}) {
  const [postTypeFilter, setPostTypeFilter] = useState<PostType | undefined>(undefined);

  const postsQ = trpc.community.getPosts.useQuery({ postType: postTypeFilter, limit: 20 });
  const postIds = postsQ.data?.map((r) => r.post.id) ?? [];

  const likesQ = trpc.community.getMyLikes.useQuery(
    { profileId: myProfileId ?? 0, postIds },
    { enabled: !!myProfileId && postIds.length > 0 },
  );
  const likedPostIds = likesQ.data ?? [];

  const likeMutation = trpc.community.likePost.useMutation({
    onSuccess: () => postsQ.refetch(),
    onError: (e) => toast.error(e.message),
  });

  const commentMutation = trpc.community.addComment.useMutation({
    onSuccess: () => postsQ.refetch(),
    onError: (e) => toast.error(e.message),
  });

  const handleLike = (postId: number) => {
    if (!myProfileId) return toast.error("Faça login para curtir");
    likeMutation.mutate({ postId, profileId: myProfileId });
  };

  const handleComment = (postId: number, body: string) => {
    if (!myProfileId) return toast.error("Faça login para comentar");
    commentMutation.mutate({ postId, profileId: myProfileId, body });
  };

  const filterTypes: Array<{ value: PostType | undefined; label: string }> = [
    { value: undefined, label: "Todos" },
    { value: "conquista", label: "Conquistas" },
    { value: "evento", label: "Eventos" },
    { value: "oportunidade", label: "Oportunidades" },
    { value: "texto", label: "Posts" },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filterTypes.map((f) => (
          <button
            key={String(f.value)}
            onClick={() => setPostTypeFilter(f.value)}
            className="text-xs px-3 py-1 rounded-full transition-colors font-semibold"
            style={{
              background: postTypeFilter === f.value ? "var(--ouro)" : "var(--terra)",
              color: postTypeFilter === f.value ? "#0A0800" : "var(--creme-50)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Composer */}
      {showComposer && myProfileId && (
        <NewPostForm profileId={myProfileId} onCreated={() => postsQ.refetch()} />
      )}

      {/* Posts */}
      {postsQ.isLoading ? (
        <div className="text-center py-8 text-sm" style={{ color: "var(--creme-50)" }}>Carregando...</div>
      ) : postsQ.data?.length === 0 ? (
        <div className="text-center py-12 text-sm" style={{ color: "var(--creme-50)" }}>
          Nenhuma publicação ainda. Seja o primeiro!
        </div>
      ) : (
        <div className="space-y-4">
          {postsQ.data?.map((row) => (
            <PostCard
              key={row.post.id}
              row={row}
              myProfileId={myProfileId}
              likedPostIds={likedPostIds}
              onLike={handleLike}
              onComment={handleComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
