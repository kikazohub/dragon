import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDragonByUser, getUserById, getMessages } from "@/lib/data";
import { syncTimeline, dayOf } from "@/lib/dragon";
import { stageForDay } from "@/lib/options";
import { ChatForm } from "@/components/ChatForm";
import { Card } from "@/components/ui";
import { ollamaReady } from "@/lib/ollama";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const dragon = getDragonByUser(session.userId);
  if (!dragon) redirect("/configure");
  const user = getUserById(session.userId);

  syncTimeline(dragon);
  const day = dayOf(dragon);
  const stage = stageForDay(day);
  const messages = getMessages(dragon.id, 30).reverse().map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const ready = await ollamaReady();

  const embryo = stage.id === "egg";

  return (
    <div className="animate-fade-up mx-auto flex max-w-3xl flex-col gap-4 py-2">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">Hablar dentro</h1>
        <p className="mt-2 text-zinc-400">
          {embryo
            ? "El huevo aún no habla con voz propia, pero percibe todo. Dale contexto y él lo guardará para el día en que abra los ojos."
            : `Cada conversación alimenta la memoria de ${dragon.name}. Cuéntale tu vida: él la guarda y la devuelve hecha comprensión.`}
        </p>
      </div>

      {!ready && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Ollama no está respondiendo (modelo: llama3.2:3b en localhost:11434). {user?.username ?? "Tu dragón"} podrá
          conversar cuando el servicio esté activo. Mientras tanto, guarda recuerdos: no se perderán.
        </div>
      )}

      {embryo && (
        <Card className="text-sm text-zinc-300">
          🥚 <strong>{dragon.name}</strong> todavía está dentro del huevo. Aun así, puedes hablarle y contarle
          cosas: se quedará todo grabado en su memoria y en sus{" "}
          <a href="/journal" className="text-amber-400 underline">
            primeras entradas del diario
          </a>
          . Su voz despertará el día 3.
        </Card>
      )}

      <ChatForm dragonName={dragon.name} initialMessages={messages} />
    </div>
  );
}