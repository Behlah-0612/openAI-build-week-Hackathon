import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { Enhance } from "@/components/ui/enhance";
import { ChefChat, type ChatMessage } from "@/components/chef-chat";

type ChefSearchParams = Promise<{ session?: string; error?: string }>;
type Video = { title: string; thumbnail: string; url: string };

function videos(value: unknown): Video[] {
  return Array.isArray(value)
    ? value.filter((video): video is Video => Boolean(video && typeof video === "object" && typeof (video as { title?: unknown }).title === "string" && typeof (video as { thumbnail?: unknown }).thumbnail === "string" && typeof (video as { url?: unknown }).url === "string"))
    : [];
}

export default async function Chef({ searchParams }: { searchParams: ChefSearchParams }) {
  const { session: requestedSession, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let sessionId: string | undefined;

  if (user && requestedSession && requestedSession !== "new") {
    const { data: session } = await supabase.from("chat_sessions").select("id").eq("id", requestedSession).eq("user_id", user.id).maybeSingle();
    sessionId = session?.id;
  }
  // A chat is loaded only when its ID is explicitly in the URL. Falling back
  // to the latest session makes “Start a new conversation” appear to undo
  // itself after a refresh or another login.

  const { data: messages } = sessionId ? await supabase.from("chat_messages").select("role,content,youtube_links_json,created_at").eq("session_id", sessionId).order("created_at", { ascending: true }).limit(100) : { data: [] };
  const initialMessages: ChatMessage[] = (messages ?? []).map((message) => ({
    role: message.role as "user" | "assistant",
    content: message.content,
    videos: videos(message.youtube_links_json),
  }));

  return (
    <main className="flex min-h-[100dvh] flex-col p-5">
      <PageHeader eyebrow="Personal chef" title="What’s cooking?" description="Ask about substitutions, techniques, scaling, or cooking videos." />
      {error && (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      )}

      {/*
        No-JS fallback (kept intentionally as-is): posts to
        /api/chat/send-form, which redirects to ?session=... and re-renders
        history via the server lookup above — both still fully functional
        without JavaScript.
      */}
      <Enhance
        fallback={
          <>
            <section className="mt-6 grid flex-1 content-start gap-3" aria-live="polite">
              {!messages?.length && <div className="max-w-[90%] rounded-xl bg-surface p-4 text-sm text-text shadow-sm shadow-black/5">Hi! I’m your personal chef. Ask me what to cook, how to substitute an ingredient, or for a technique video.</div>}
              {(messages ?? []).map((message, index) => (
                <article key={`${message.created_at}-${index}`} className={`max-w-[90%] rounded-xl p-4 text-sm ${message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-surface text-text shadow-sm shadow-black/5"}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {videos(message.youtube_links_json).map((video) => (
                    <a key={video.url} href={video.url} target="_blank" rel="noreferrer" className="mt-3 flex gap-3 rounded-lg bg-bg p-2 text-text">
                      <img src={video.thumbnail} alt="" className="h-12 w-20 rounded-lg object-cover" />
                      <span className="font-semibold text-primary">{video.title}</span>
                    </a>
                  ))}
                </article>
              ))}
            </section>

            <form action="/api/chat/send-form" method="post" className="sticky bottom-20 mt-4 flex gap-2 rounded-xl bg-surface p-2 shadow-lg shadow-black/10">
              {sessionId && <input type="hidden" name="session_id" value={sessionId} />}
              <label className="sr-only" htmlFor="chef-message">
                Message your chef
              </label>
              <input id="chef-message" name="message" required maxLength={1200} placeholder="Ask your chef…" className="min-h-12 min-w-0 flex-1 bg-transparent px-3 text-text outline-none placeholder:text-muted-text/70" />
              <button type="submit" className="min-h-12 rounded-lg bg-primary px-4 font-bold text-primary-foreground">
                Send
              </button>
            </form>
            <a href="/chef?session=new" className="mt-3 text-center text-sm font-semibold text-primary">
              Start a new conversation
            </a>
          </>
        }
      >
        <ChefChat initialMessages={initialMessages} initialSessionId={sessionId} />
      </Enhance>
    </main>
  );
}
