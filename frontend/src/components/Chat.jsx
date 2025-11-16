import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Chat({ isGuest }) {
  const [income, setIncome] = useState("");
  const [goal, setGoal] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      who: "ai",
      text: "Hi! I'm FinMentor 👋 Ask me about saving, budgeting or starting small investments.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Generate or retrieve a session ID for this user (persists across messages in this chat session)
  const [sessionId] = useState(() => {
    const stored = sessionStorage.getItem("finmentor_session_id");
    if (stored) return stored;
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("finmentor_session_id", newId);
    return newId;
  });

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { who: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await axios.post(`${base}/api/chat`, {
        userMessage: userMsg,
        income: income ? Number(income) : undefined,
        goal: goal || undefined,
        userId: sessionId,
      });

      const aiText = res?.data?.reply || "Sorry, no reply received.";
      setMessages((prev) => [...prev, { who: "ai", text: aiText }]);

      // Log the search query to MongoDB (fire and forget; don't block response)
      axios.post(`${base}/api/chat/log`, {
        userId: sessionId,
        query: userMsg,
        income: income ? Number(income) : null,
        goal: goal || null,
        timestamp: new Date().toISOString(),
      }).catch((err) => console.warn("Failed to log search:", err.message));
    } catch (err) {
      setMessages((prev) => [...prev, { who: "ai", text: "Oops — I couldn't reach the server. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="meta" aria-hidden>
        <div className="kv">💬 Chatbot</div>
        <div className="small">Personalize: income & goal (optional)</div>
      </div>

      <form className="chat-fields" onSubmit={sendMessage} aria-label="Chat personalization">
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="Monthly income (₹)"
          aria-label="Monthly income"
        />
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Goal (e.g., buy laptop in 9 months)"
          aria-label="Goal description"
        />
      </form>

      <div className="chat-window" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <div
            className={`msg-row ${m.who === "user" ? "row-user" : "row-ai"}`}
            key={i}
            aria-label={m.who === "user" ? `You: ${m.text}` : `FinMentor: ${m.text}`}
          >
            <div className="avatar" aria-hidden>
              {m.who === "user" ? "Y" : "F"}
            </div>
            <div className={`msg ${m.who === "user" ? "user" : "ai"}`}>
              <div className="msg-meta"><strong>{m.who === "user" ? "You" : "FinMentor"}</strong></div>
              <div className="msg-body">{m.text}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {isGuest ? (
        <div className="guest-overlay">
          <div>Please sign in to use the chatbot.</div>
        </div>
      ) : (
        <form className="input-row" onSubmit={sendMessage} aria-label="Send message">
          <input
            type="text"
            placeholder="Ask FinMentor: e.g., How much should I save?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Message"
            disabled={loading}
          />
          <button className="btn" type="submit" disabled={loading || !input.trim()} aria-disabled={loading} aria-label="Send message">
            {loading ? "Sending…" : "Send"}
          </button>
        </form>
      )}
    </div>
  );
}
