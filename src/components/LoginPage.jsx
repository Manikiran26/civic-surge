import { useEffect, useRef, useState } from "react";
import { Apple, Lock, Mail, MapPin, Shield, Sparkles } from "lucide-react";

export default function LoginPage({ onLogin }) {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const handleMove = (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--x", x.toFixed(2));
      card.style.setProperty("--y", y.toFixed(2));
    };
    card.addEventListener("mousemove", handleMove);
    return () => card.removeEventListener("mousemove", handleMove);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin?.(email.trim() || "CivicSurge User", email.trim() || "user@civicsurge.ai");
    }, 1200);
  };

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-map" aria-hidden="true">
          <img
            className="auth-map__image"
            src="/download.png"
            alt=""
            loading="eager"
            decoding="async"
          />
          <div className="auth-map__shine" />
          <div className="auth-map__overlay" />
        </div>
        <div className="auth-left__content">
          <div className="auth-logo">
            <span className="brand__mark">
              <img src="/models/PHOTO-2026-03-28-00-40-54.jpg" alt="CivicSurge logo" />
            </span>
            <div>
              <div className="auth-logo__name">CivicSurge</div>
              <div className="auth-logo__tag">Hyper-local intelligence platform</div>
            </div>
          </div>
          <div className="auth-value-grid">
            <div className="auth-value">
              <MapPin size={18} />
              <div>
                <strong>Real-time Hyper-Local Targeting</strong>
                <span>Deliver precision alerts by zone, time, and intent.</span>
              </div>
            </div>
            <div className="auth-value">
              <Shield size={18} />
              <div>
                <strong>Track Government Projects Transparently</strong>
                <span>Verified updates, citizen feedback, and compliance trails.</span>
              </div>
            </div>
            <div className="auth-value">
              <Sparkles size={18} />
              <div>
                <strong>Data-driven Civic Insights</strong>
                <span>Operational dashboards with impact and engagement signals.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="login-glass" ref={cardRef}>
          <div className="login-glass__glow" />
          <div className="login-glass__badge">
            <Lock size={14} />
            Secure Login
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your command center.</p>
          <form className="login-fields" onSubmit={handleSubmit}>
            <label className="float-field">
              <input
                type="email"
                placeholder=" "
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <span>Email</span>
              <Mail size={16} />
            </label>
            <label className="float-field">
              <input
                type="password"
                placeholder=" "
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <span>Password</span>
              <Lock size={16} />
            </label>
            <div className="login-row">
              <label className="checkbox-row">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <button type="button" className="link-button">
                Forgot password?
              </button>
            </div>
            <button type="submit" className="primary-button login-cta" disabled={loading}>
              {loading ? <span className="loader" /> : "Login"}
            </button>
          </form>
          <div className="social-row">
            <button type="button" className="social-button">
              <span className="google-mark">G</span>
              Google
            </button>
            <button type="button" className="social-button">
              <Apple size={16} />
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
