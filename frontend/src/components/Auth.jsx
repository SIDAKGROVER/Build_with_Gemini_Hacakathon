import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const doLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${apiBase}/api/auth/login`, {
        email: email.trim(),
        name: name || "User",
      });

      if (res.data.success) {
        const user = { name: res.data.user.name, email: res.data.user.email };
        localStorage.setItem("fm_user", JSON.stringify(user));
        onLogin(user);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const doSignup = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (!name || !email) {
      setError("Please enter your name and email.");
      setLoading(false);
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${apiBase}/api/auth/register`, {
        email: email.trim(),
        name: name.trim(),
      });

      if (res.data.success) {
        const user = { name: res.data.user.name, email: res.data.user.email };
        localStorage.setItem("fm_user", JSON.stringify(user));
        onLogin(user);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError("An account with this email already exists. Please log in.");
        setMode("login");
      } else {
        setError(err.response?.data?.error || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h3>{mode === "login" ? "Sign in to FinMentor" : "Create an account"}</h3>
      <p className="small">{mode === "login" ? "Access the chatbot and save preferences (persisted to MongoDB)." : "Sign up to save your chat history and preferences."}</p>

      {mode === "login" ? (
        <form onSubmit={doLogin} className="auth-form">
          <input 
            placeholder="Email address" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <input 
            placeholder="Name (optional)" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          {error && <div className="error" role="alert">{error}</div>}
          {info && <div className="small">{info}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <button 
              type="button" 
              className="btn" 
              onClick={() => { setMode("signup"); setError(""); setEmail(""); setName(""); }}
              disabled={loading}
            >
              Create account
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={doSignup} className="auth-form">
          <input 
            placeholder="Your full name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <input 
            placeholder="Email address" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {error && <div className="error" role="alert">{error}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </button>
            <button 
              type="button" 
              className="btn" 
              onClick={() => { setMode("login"); setError(""); setEmail(""); setName(""); }}
              disabled={loading}
            >
              Have an account?
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
