import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
}

const WEBHOOK_URL = import.meta.env.VITE_CHATBOT_WEBHOOK_URL as string;
const SESSION_KEY = "chatbot_session_id";

const getSessionId = () => {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

// n8n response shape varies depending on how the user wires it,
// so we look at common field names in priority order.
const extractReply = (data: unknown): string => {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return "";
  const o = data as Record<string, unknown>;
  for (const key of ["reply", "output", "message", "text", "response", "answer"]) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v;
  }
  if (Array.isArray(o) && o.length > 0) return extractReply(o[0]);
  return "";
};

const ChatbotWidget: React.FC = () => {
  const { lang } = useLang();
  const ar = lang === "ar";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: ar
        ? "مرحبًا! كيف يمكنني مساعدتك؟"
        : "Hi! How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: getSessionId(),
          lang,
        }),
      });
      const ct = res.headers.get("content-type") ?? "";
      const data = ct.includes("application/json") ? await res.json() : await res.text();
      const reply = extractReply(data) ||
        (ar ? "تم استلام رسالتك." : "Got your message.");
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, role: "bot", text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-err-${Date.now()}`,
          role: "bot",
          text: ar
            ? "تعذر الاتصال. حاول مرة أخرى."
            : "Couldn't reach the assistant. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  if (!WEBHOOK_URL) return null;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={ar ? "افتح الدردشة" : "Open chat"}
          className="fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-6 end-6 z-50 flex w-[min(380px,calc(100vw-2rem))] flex-col rounded-2xl border border-border bg-card shadow-2xl"
          style={{ height: "min(560px, calc(100vh - 6rem))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold text-sm">
                {ar ? "المساعد" : "Support"}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={ar ? "إغلاق" : "Close"}
              className="rounded-md p-1 hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-ee-sm"
                      : "bg-secondary text-foreground rounded-es-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-secondary text-muted-foreground rounded-2xl rounded-es-sm px-3.5 py-2 text-sm">
                  …
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <input
              className="form-input flex-1"
              placeholder={ar ? "اكتب رسالتك…" : "Type a message…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={sending}
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="rounded-lg bg-primary px-3 text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
              aria-label={ar ? "إرسال" : "Send"}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
