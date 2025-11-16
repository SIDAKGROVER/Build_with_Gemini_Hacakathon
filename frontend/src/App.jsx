import React, { useEffect, useState } from "react";
import axios from "axios";
import Chat from "./components/Chat";
import Budget from "./components/Budget";
import Auth from "./components/Auth";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    // Try to restore user from localStorage first
    try {
      const raw = localStorage.getItem("fm_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        setLoading(false);
        return;
      }
    } catch (err) {
      // ignore
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("fm_user");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="container">
        <header className="header" role="banner">
          <div className="logo" aria-hidden>FM</div>
          <div>
            <h1>FinMentor — AI Financial Coach</h1>
            <p>Making finance simple with AI (Mock Demo)</p>
          </div>
        </header>
        <main className="grid" role="main">
          <div className="card">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header" role="banner">
        <div className="logo" aria-hidden>FM</div>
        <div style={{flex:1}}>
          <h1>FinMentor — AI Financial Coach</h1>
          <p>Making finance simple with AI (Mock Demo)</p>
        </div>

        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {user ? (
            <>
              <div className="small">Hello, <strong>{user.name}</strong></div>
              <button className="btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <div className="small">Please sign in to use the chatbot</div>
          )}
        </div>
      </header>

      <main className="grid" role="main" aria-label="Primary content">
        <section className="card chat-box" aria-labelledby="chat-heading">
          <h2 id="chat-heading" className="small" style={{display:'none'}}>Chat</h2>
          {user ? <Chat /> : <Auth onLogin={(u) => setUser(u)} />}
        </section>

        <aside className="card budget-box" aria-labelledby="budget-heading">
          <h2 id="budget-heading" className="small" style={{display:'none'}}>Budget Planner</h2>
          <Budget />
          <div className="note">Tip: Use the chatbot to get plain-language finance help. This demo uses mock AI replies.</div>
        </aside>
      </main>
    </div>
  );
}
