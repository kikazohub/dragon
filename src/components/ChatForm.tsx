"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { chatAction, saveMemoryAction } from "@/app/actions";
import { Button, TextArea } from "@/components/ui";

interface Msg {
  role: string;
  content: string;
}

interface Props {
  dragonName: string;
  initialMessages: Msg[];
}

export function ChatForm({ dragonName, initialMessages }: Props) {
  const [messages, setMessages] = useState<Msg[]>(
    initialMessages.length ? initialMessages : []
  );
  const [input, setInput] = useState("");
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [memoryText, setMemoryText] = useState("");
  const [memoryMsg, setMemoryMsg] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  const send = () => {
    const text = input.trim();
    if (!text || pending) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    startTransition(async () => {
      const res = await chatAction(text);
      if (res.ok && res.reply) {
        setMessages((m) => [...m, { role: "dragon", content: res.reply! }]);
      } else if (!res.ok) {
        setMessages((m) => [...m, { role: "system", content: res.error ?? "Algo falló." }]);
      }
    });
  };

  const saveMemory = (formData: FormData) => {
    startTransition(async () => {
      const res = await saveMemoryAction(formData);
      if (res.ok) {
        setMemoryText("");
        setMemoryOpen(false);
        setMemoryMsg("Tu dragón guardó esto en lo más profundo de su memoria. 💛");
      }
    });
  };

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-xl">🐲</span> Conversar con {dragonName}
        </div>
        <button
          onClick={() => setMemoryOpen((o) => !o)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/10"
        >
          💭 Contarle algo íntimo
        </button>
      </div>

      {memoryOpen && (
        <div className="border-b border-white/10 bg-amber-500/5 p-4">
          <form action={saveMemory} className="flex flex-col gap-3">
            <p className="text-sm text-zinc-300">
              Cuéntale algo sobre ti, tu día o lo que sientes. {dragonName} lo recordará para siempre y
              lo usará en sus conversaciones.
            </p>
            <TextArea
              value={memoryText}
              onChange={(e) => setMemoryText(e.target.value)}
              name="content"
              placeholder="Ej: Hoy fue un día difícil en el trabajo, me siento algo triste..."
              rows={3}
              maxLength={500}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                Guardar recuerdo
              </Button>
              <Button
                type="button"
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={() => setMemoryOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="mx-auto max-w-sm text-center text-sm text-zinc-400">
            <p className="text-4xl">🥚</p>
            <p className="mt-3">
              {dragonName} todavía siente tu presencia. Empieza a hablarle: cuéntale cómo estás, y con
              el tiempo escucharás la voz de tu dragón.
            </p>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "system" ? (
            <div key={i} className="text-center text-xs italic text-zinc-500">
              {m.content}
            </div>
          ) : (
            <div
              key={i}
              className={`flex ${m.role === "dragon" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "dragon"
                    ? "rounded-bl-sm border border-white/10 bg-white/5 text-zinc-100"
                    : "rounded-br-sm bg-amber-500 text-black"
                }`}
              >
                {m.role === "dragon" && <span className="mb-1 block text-xs text-amber-300">🐲 {dragonName}</span>}
                <span className="whitespace-pre-wrap">{m.content}</span>
              </div>
            </div>
          )
        )}
        {pending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-400">
              {dragonName} está... pensando...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-3">
        {memoryMsg && <p className="mb-2 text-center text-xs text-emerald-300">{memoryMsg}</p>}
        <div className="flex gap-2">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Escríbele a ${dragonName}...`}
            rows={1}
            maxLength={1000}
            className="flex-1"
          />
          <Button onClick={send} disabled={pending} className="self-end">
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}