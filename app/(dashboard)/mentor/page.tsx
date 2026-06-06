"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, RefreshCw, ArrowLeft } from "lucide-react";
import { Message, MentorPersona, MENTOR_PERSONAS } from "@/types";

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[#7C3AED] text-white rounded-br-sm"
            : "bg-white border border-zinc-100 text-zinc-800 rounded-bl-sm"
        }`}
      >
        {msg.content.split("\n").map((line, i) => (
          <span key={i}>{line}{i < msg.content.split("\n").length - 1 && <br />}</span>
        ))}
      </div>
    </div>
  );
}

export default function MentorPage() {
  const [selectedPersona, setSelectedPersona] = useState<MentorPersona | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPersona) return;
    setMessages([]);
    setConvId(undefined);
    fetch(`/api/mentor?persona=${selectedPersona}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.messages) {
          setMessages(data.messages as Message[]);
          setConvId(data.id);
        }
      });
  }, [selectedPersona]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const content = text || input.trim();
    if (!content || loading || !selectedPersona) return;
    setInput("");

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    const res = await fetch("/api/mentor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages, persona: selectedPersona, conversationId: convId }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.message) {
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
      if (!convId) {
        fetch(`/api/mentor?persona=${selectedPersona}`).then(r => r.json()).then(d => d?.id && setConvId(d.id));
      }
    }
  }

  if (!selectedPersona) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">AI Mentor</h1>
          <p className="text-zinc-500 mt-1">Choose a mentor persona for specialized guidance.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {(Object.entries(MENTOR_PERSONAS) as [MentorPersona, typeof MENTOR_PERSONAS[MentorPersona]][]).map(
            ([key, persona]) => (
              <button
                key={key}
                onClick={() => setSelectedPersona(key)}
                className="text-left p-5 rounded-xl border border-zinc-100 bg-white hover:border-[#7C3AED]/30 hover:bg-zinc-50 transition-all group"
              >
                <div className="text-2xl mb-3">{persona.icon}</div>
                <h3 className="font-semibold text-zinc-900 mb-1 group-hover:text-[#7C3AED] transition-colors">
                  {persona.label}
                </h3>
                <p className="text-sm text-zinc-500">{persona.description}</p>
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  const persona = MENTOR_PERSONAS[selectedPersona];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="mb-4 shrink-0 flex items-center gap-3">
        <button onClick={() => setSelectedPersona(null)} className="text-zinc-400 hover:text-zinc-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{persona.icon}</span>
            <h1 className="text-xl font-bold text-zinc-900">{persona.label}</h1>
          </div>
          <p className="text-sm text-zinc-500">{persona.description}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && (
          <Card className="p-5 bg-[#7C3AED]/5 border-[#7C3AED]/20">
            <p className="text-sm text-zinc-700">
              <strong>{persona.label}</strong> is ready to mentor you. Ask them anything about your
              career, leadership challenges, or how to reach your goals.
            </p>
          </Card>
        )}
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <RefreshCw className="h-4 w-4 text-zinc-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 flex gap-2 pt-2 border-t border-zinc-100">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={`Ask your ${persona.label}...`}
          className="resize-none min-h-[48px] max-h-32"
          rows={1}
        />
        <Button onClick={() => send()} disabled={!input.trim() || loading} size="icon" className="shrink-0 h-12 w-12">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
