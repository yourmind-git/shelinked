"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, RefreshCw } from "lucide-react";
import { Message } from "@/types";

const STARTERS = [
  "I don't know what my next career step should be.",
  "I want to get promoted to the next level. Where do I start?",
  "I'm struggling to establish myself as a leader. What should I do?",
  "I want to move into Product Management. How?",
];

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

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/coach").then((r) => r.json()).then((data) => {
      if (data?.messages) {
        setMessages(data.messages as Message[]);
        setConvId(data.id);
      }
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages, conversationId: convId }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.message) {
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
      if (!convId) {
        fetch("/api/coach").then(r => r.json()).then(d => d?.id && setConvId(d.id));
      }
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-zinc-900">AI Career Coach</h1>
        <p className="text-zinc-500 text-sm mt-1">Direct, strategic coaching tailored to your career goals.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <Card className="p-5 bg-[#7C3AED]/5 border-[#7C3AED]/20">
              <p className="text-sm text-zinc-700 font-medium mb-1">Your AI Career Coach is ready.</p>
              <p className="text-sm text-zinc-500">
                Ask about your next step, how to get promoted, how to strengthen your leadership, or anything
                else on your career journey.
              </p>
            </Card>
            <div className="space-y-2">
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Common starting points</p>
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left text-sm px-4 py-3 rounded-xl border border-zinc-100 bg-white hover:border-[#7C3AED]/30 hover:bg-zinc-50 transition-colors text-zinc-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

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
          placeholder="Ask your coach anything..."
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
