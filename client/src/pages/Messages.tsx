import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { MessageSquare, Send, ArrowLeft, Loader2, User } from "lucide-react";

/* ─── ConversationItem ───────────────────────────────────────────────────────── */
function ConversationItem({
  conv,
  isActive,
  onClick,
}: {
  conv: any;
  isActive: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const other = conv.otherProfile;
  const lastMsg = conv.lastMessage;
  const unread = conv.unreadCount ?? 0;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        background: isActive
          ? "var(--ouro-sutil)"
          : hov
          ? "var(--creme-5)"
          : "transparent",
        border: `1px solid ${isActive ? "rgba(212,146,10,0.30)" : "transparent"}`,
        transition: "var(--transition)",
        marginBottom: 2,
      }}
    >
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={
            other?.avatarUrl ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              other?.displayName ?? "?"
            )}&backgroundColor=D4A017&textColor=0a0a0a&fontWeight=700&fontSize=40&radius=50`
          }
          alt={other?.displayName ?? ""}
          style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--creme-10)" }}
        />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            minWidth: 18, height: 18,
            background: "var(--ouro)",
            color: "var(--preto)",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <span style={{
            fontSize: "var(--text-sm)",
            fontWeight: unread > 0 ? 700 : 600,
            color: isActive ? "var(--ouro)" : "var(--creme)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 130,
          }}>
            {other?.displayName ?? "Usuário"}
          </span>
          {lastMsg && (
            <span style={{ fontSize: 10, color: "var(--creme-50)", flexShrink: 0 }}>
              {new Date(lastMsg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        {lastMsg && (
          <p style={{
            fontSize: "var(--text-xs)",
            color: unread > 0 ? "var(--creme-80)" : "var(--creme-50)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontWeight: unread > 0 ? 500 : 400,
          }}>
            {lastMsg.content}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── MessageBubble ──────────────────────────────────────────────────────────── */
function MessageBubble({ msg, isOwn }: { msg: any; isOwn: boolean }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: isOwn ? "flex-end" : "flex-start",
      marginBottom: 8,
    }}>
      <div style={{
        maxWidth: "72%",
        padding: "10px 14px",
        borderRadius: isOwn ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
        background: isOwn ? "var(--ouro)" : "var(--terra)",
        color: isOwn ? "var(--preto)" : "var(--creme)",
        border: isOwn ? "none" : "1px solid var(--creme-10)",
        fontSize: "var(--text-sm)",
        lineHeight: 1.5,
        wordBreak: "break-word",
      }}>
        <p style={{ margin: 0, fontFamily: "var(--font-body)" }}>{msg.content}</p>
        <p style={{
          margin: "4px 0 0",
          fontSize: 10,
          opacity: 0.65,
          textAlign: "right",
          fontFamily: "var(--font-body)",
        }}>
          {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

/* ─── ChatWindow ─────────────────────────────────────────────────────────────── */
function ChatWindow({
  conversationId,
  otherProfile,
  myProfileId,
}: {
  conversationId: number;
  otherProfile: any;
  myProfileId: number;
}) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: messages = [], isLoading } = trpc.chat.getMessages.useQuery(
    { conversationId, limit: 100, offset: 0 },
    { refetchInterval: 5000 },
  );
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      utils.chat.getMessages.invalidate({ conversationId });
      utils.chat.getConversations.invalidate();
      utils.chat.getUnreadCount.invalidate();
    },
  });
  const markAsRead = trpc.chat.markAsRead.useMutation();

  // mark as read when opening
  useEffect(() => {
    markAsRead.mutate({ conversationId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSend() {
    const content = text.trim();
    if (!content) return;
    setText("");
    sendMessage.mutate({ conversationId, content });
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 20px",
        borderBottom: "1px solid var(--creme-10)",
        flexShrink: 0,
      }}>
        <img
          src={
            otherProfile?.avatarUrl ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              otherProfile?.displayName ?? "?"
            )}&backgroundColor=D4A017&textColor=0a0a0a&fontWeight=700&fontSize=40&radius=50`
          }
          alt={otherProfile?.displayName ?? ""}
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
        />
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--creme)", fontFamily: "var(--font-body)" }}>
            {otherProfile?.displayName ?? "Usuário"}
          </p>
          {otherProfile?.slug && (
            <a
              href={`/perfil/${otherProfile.slug}`}
              style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", textDecoration: "none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--ouro)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--creme-50)"; }}
            >
              Ver perfil →
            </a>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}>
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite", color: "var(--ouro)" }} />
          </div>
        )}
        {!isLoading && sorted.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--creme-50)", padding: "40px 0" }}>
            <MessageSquare style={{ width: 36, height: 36, margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)" }}>
              Seja o primeiro a enviar uma mensagem!
            </p>
          </div>
        )}
        {sorted.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.senderId === myProfileId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--creme-10)",
        display: "flex",
        gap: 10,
        alignItems: "flex-end",
        flexShrink: 0,
        background: "var(--preto)",
      }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Digite uma mensagem... (Enter para enviar)"
          rows={1}
          style={{
            flex: 1,
            background: "var(--terra)",
            border: "1px solid var(--creme-10)",
            borderRadius: "var(--radius-md)",
            color: "var(--creme)",
            fontSize: "var(--text-sm)",
            fontFamily: "var(--font-body)",
            padding: "10px 14px",
            resize: "none",
            outline: "none",
            lineHeight: 1.5,
            maxHeight: 120,
            overflowY: "auto",
            transition: "border-color 0.2s",
          }}
          onFocus={e => { (e.target as HTMLElement).style.borderColor = "rgba(212,146,10,0.40)"; }}
          onBlur={e => { (e.target as HTMLElement).style.borderColor = "var(--creme-10)"; }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sendMessage.isPending}
          style={{
            padding: "10px 14px",
            background: text.trim() ? "var(--ouro)" : "var(--terra)",
            border: "none",
            borderRadius: "var(--radius-md)",
            color: text.trim() ? "var(--preto)" : "var(--creme-50)",
            cursor: text.trim() ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 700,
            fontSize: "var(--text-sm)",
            fontFamily: "var(--font-body)",
            transition: "var(--transition)",
            flexShrink: 0,
          }}
        >
          {sendMessage.isPending
            ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
            : <Send style={{ width: 16, height: 16 }} />
          }
        </button>
      </div>
    </div>
  );
}

/* ─── Messages page ──────────────────────────────────────────────────────────── */
export default function Messages() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const handledParamRef = useRef(false);

  const { data: myProfile } = trpc.profiles.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );
  const { data: conversations = [], isLoading: loadingConvs, refetch: refetchConvs } = trpc.chat.getConversations.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 10000 },
  );
  const getOrCreateForParam = trpc.chat.getOrCreateConversation.useMutation({
    onSuccess: (conv) => {
      refetchConvs();
      setActiveConvId(conv.id);
      setShowMobileChat(true);
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/entrar");
  }, [isAuthenticated, loading, navigate]);

  // Auto-open conversation from ?profileId= query param
  useEffect(() => {
    if (handledParamRef.current) return;
    if (!isAuthenticated || !myProfile || loadingConvs) return;
    const params = new URLSearchParams(search);
    const pidStr = params.get("profileId");
    if (!pidStr) return;
    const pid = Number(pidStr);
    if (!pid) return;
    handledParamRef.current = true;
    const existing = conversations.find(c => c.otherProfile?.id === pid);
    if (existing) {
      setActiveConvId(existing.id);
      setShowMobileChat(true);
    } else if (!getOrCreateForParam.isPending) {
      getOrCreateForParam.mutate({ otherProfileId: pid });
    }
  }, [search, isAuthenticated, myProfile, loadingConvs, conversations]);

  const activeConv = conversations.find(c => c.id === activeConvId) ?? null;

  function selectConv(id: number) {
    setActiveConvId(id);
    setShowMobileChat(true);
  }

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <Loader2 style={{ width: 28, height: 28, animation: "spin 1s linear infinite", color: "var(--ouro)" }} />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--creme)", marginBottom: 4 }}>
            Mensagens
          </h1>
          <p style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)" }}>
            Comunicação direta com outros profissionais da plataforma
          </p>
        </div>

        {/* Layout 2 colunas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: showMobileChat ? "1fr" : "320px 1fr",
          gap: 0,
          background: "var(--terra)",
          border: "1px solid var(--creme-10)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          minHeight: 540,
        }}
          className="chat-layout"
        >
          {/* Sidebar — conversations list */}
          <div style={{
            borderRight: "1px solid var(--creme-10)",
            display: showMobileChat ? "none" : "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
            className="chat-sidebar"
          >
            <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--creme-10)" }}>
              <h2 style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--creme-50)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Conversas
              </h2>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {loadingConvs && (
                <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                  <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite", color: "var(--ouro)" }} />
                </div>
              )}
              {!loadingConvs && conversations.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 16px" }}>
                  <User style={{ width: 32, height: 32, margin: "0 auto 12px", color: "var(--creme-50)", opacity: 0.4 }} />
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)", fontFamily: "var(--font-body)" }}>
                    Nenhuma conversa ainda
                  </p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", marginTop: 8, opacity: 0.7, fontFamily: "var(--font-body)" }}>
                    Visite um perfil e clique em "Enviar mensagem"
                  </p>
                </div>
              )}
              {conversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeConvId}
                  onClick={() => selectConv(conv.id)}
                />
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 540, overflow: "hidden" }}>
            {/* Mobile back button */}
            {showMobileChat && (
              <button
                type="button"
                onClick={() => setShowMobileChat(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 16px",
                  background: "none", border: "none",
                  color: "var(--ouro)", cursor: "pointer",
                  fontSize: "var(--text-sm)", fontWeight: 600, fontFamily: "var(--font-body)",
                  borderBottom: "1px solid var(--creme-10)",
                }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} />
                Conversas
              </button>
            )}

            {activeConvId && activeConv && myProfile ? (
              <ChatWindow
                key={activeConvId}
                conversationId={activeConvId}
                otherProfile={activeConv.otherProfile}
                myProfileId={myProfile.id}
              />
            ) : (
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--creme-50)",
                gap: 12,
                padding: 40,
              }}>
                <MessageSquare style={{ width: 48, height: 48, opacity: 0.3 }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)" }}>
                  Selecione uma conversa para começar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
