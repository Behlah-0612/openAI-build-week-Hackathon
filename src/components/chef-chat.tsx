"use client";

import { type FormEvent, useState } from "react";
import { Plus, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Video = { title: string; thumbnail: string; url: string };
export type ChatMessage = { role: "user" | "assistant"; content: string; videos?: Video[] };

const welcome: ChatMessage = {
  role: "assistant",
  content: "Hi! I’m your personal chef. Ask for a substitution, a faster method, or a video for any technique.",
};

async function errorMessage(response: Response) {
  const type = response.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    return body?.error ?? `Chat request failed (${response.status}).`;
  }
  const body = await response.text().catch(() => "");
  return body || `Chat request failed (${response.status} ${response.statusText}).`;
}

export function ChefChat({ initialMessages = [], initialSessionId }: { initialMessages?: ChatMessage[]; initialSessionId?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages.length ? initialMessages : [welcome]);
  const [value, setValue] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  function updateLastAssistant(update: (message: ChatMessage) => ChatMessage) {
    setMessages((current) => {
      const index = current.map((message) => message.role).lastIndexOf("assistant");
      return index === -1 ? [...current, update({ role: "assistant", content: "" })] : current.map((message, messageIndex) => messageIndex === index ? update(message) : message);
    });
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim() || busy) return;

    const message = value.trim();
    setValue("");
    setMessages((current) => [...current, { role: "user", content: message }, { role: "assistant", content: "" }]);
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, session_id: sessionId }),
      });

      if (!response.ok) {
        const detail = await errorMessage(response);
        updateLastAssistant((assistant) => ({ ...assistant, content: `I couldn’t send that message: ${detail}` }));
        return;
      }

      if (!response.body) {
        updateLastAssistant((assistant) => ({ ...assistant, content: "I couldn’t start a response stream. Please try again." }));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedReply = false;

      while (true) {
        const { value: chunk, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(chunk, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const eventText of events) {
          const type = eventText.match(/^event: (.+)$/m)?.[1];
          const raw = eventText.match(/^data: (.+)$/m)?.[1];
          if (!type || raw === undefined) continue;
          const data = JSON.parse(raw) as string | Video[] | { session_id?: string; message?: string };

          if (type === "token" && typeof data === "string") {
            receivedReply = true;
            updateLastAssistant((assistant) => ({ ...assistant, content: assistant.content + data }));
          }
          if (type === "videos" && Array.isArray(data)) updateLastAssistant((assistant) => ({ ...assistant, videos: data }));
          if (type === "error") {
            const explanation = typeof data === "string" ? data : !Array.isArray(data) ? data.message ?? "I couldn’t complete that request." : "I couldn’t complete that request.";
            updateLastAssistant((assistant) => ({ ...assistant, content: explanation }));
          }
          if (type === "done" && !Array.isArray(data) && typeof data !== "string" && data.session_id) {
            setSessionId(data.session_id);
            // Keep this conversation addressable across refreshes, while a
            // plain /chef visit always starts with a clean conversation.
            router.replace(`/chef?session=${data.session_id}`);
          }
        }
      }

      if (!receivedReply) {
        updateLastAssistant((assistant) => assistant.content ? assistant : { ...assistant, content: "I couldn’t generate a reply. Please try again." });
      }
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : "Unknown connection error.";
      updateLastAssistant((assistant) => ({ ...assistant, content: `I couldn’t reach the chef service: ${detail}` }));
    } finally {
      setBusy(false);
    }
  }

  function newChat() {
    setMessages([welcome]);
    setSessionId(undefined);
    setValue("");
    router.replace("/chef?session=new");
  }

  return (
    <div className="mt-6 flex min-h-[65vh] flex-col">
      <div className="grid flex-1 content-start gap-3" aria-live="polite">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={cn(
              "max-w-[90%] rounded-xl p-4 text-sm",
              message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-surface text-text shadow-sm shadow-black/5",
            )}
          >
            <p className="whitespace-pre-wrap">{message.content || (busy ? "Thinking…" : "I couldn’t generate a reply.")}</p>
            {message.videos?.map((video) => (
              <a key={video.url} href={video.url} target="_blank" rel="noreferrer" className="mt-3 flex gap-3 rounded-lg bg-bg p-2 text-text">
                <img src={video.thumbnail} alt="" className="h-12 w-20 rounded-md object-cover" />
                <span className="font-semibold text-primary">{video.title}</span>
              </a>
            ))}
          </div>
        ))}
      </div>

      <form onSubmit={send} className="sticky bottom-20 mt-4 flex items-center gap-2 rounded-xl bg-surface p-2 shadow-lg shadow-black/10">
        <label className="sr-only" htmlFor="chef-message">
          Message your chef
        </label>
        <input
          id="chef-message"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={busy}
          placeholder="Ask your chef…"
          className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-text outline-none placeholder:text-muted-text/70 disabled:opacity-60"
        />
        <Button type="submit" size="icon" disabled={busy || !value.trim()} loading={busy} aria-label="Send message">
          {!busy && <Send size={18} aria-hidden="true" />}
        </Button>
      </form>
      <Button type="button" variant="link" size="sm" onClick={newChat} className="mx-auto mt-3 flex items-center gap-1">
        <Plus size={14} aria-hidden="true" /> Start a new conversation
      </Button>
    </div>
  );
}
