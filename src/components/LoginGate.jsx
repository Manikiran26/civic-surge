import { Lock, LogIn } from "lucide-react";
import { useState } from "react";

export default function LoginGate({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-gate">
      <div className="login-card">
        <div className="login-card__badge">
          <Lock size={16} />
          Secure Access
        </div>
        <h2>Sign in to unlock civic intel</h2>
        <p>Map is live. Filters, alerts, and insights unlock after login.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onLogin?.(email.trim() || "Citizen");
          }}
          className="login-form"
        >
          <label>
            <span>Email</span>
            <input
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary-button">
            <LogIn size={14} />
            Enter Platform
          </button>
        </form>
        <div className="login-foot">
          Demo login only. No credentials are stored.
        </div>
      </div>
    </div>
  );
}
