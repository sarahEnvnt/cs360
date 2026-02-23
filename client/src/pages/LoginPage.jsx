import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const stats = [
  { value: "360\u00B0", label: "Account Visibility" },
  { value: "6", label: "Health Dimensions" },
  { value: "Real-time", label: "NPS Tracking" },
];

const features = [
  { icon: "\u25C8", title: "Unified Account Intelligence", desc: "Consolidate health scores, stakeholders, and revenue data into a single actionable view." },
  { icon: "\u2605", title: "Proactive Risk Detection", desc: "Identify at-risk accounts early with multi-dimensional health scoring and trend analysis." },
  { icon: "\u25C9", title: "Active Projects & Leads Tracking", desc: "Monitor active projects and leads with real-time budget tracking and progress insights." },
  { icon: "\u25B7", title: "Engagement Management", desc: "Track every touchpoint — meetings, calls, and follow-ups — with full activity history." },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = mode === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: `1.5px solid ${focused === field ? T.accent : T.border}`,
    background: T.bg,
    color: T.text,
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
    boxShadow: focused === field ? `0 0 0 3px ${T.accent}18` : "none",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Left Panel: Branding ── */}
      <div style={{
        flex: "0 0 52%", display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "64px 64px 48px", position: "relative", overflow: "hidden",
        background: isDark
          ? `linear-gradient(165deg, #0A0F1C 0%, #0F1628 40%, #131B32 100%)`
          : `linear-gradient(165deg, #1A1D2E 0%, #232840 40%, #2A2F4A 100%)`,
      }}>
        {/* Decorative gradient orbs */}
        <div style={{ position: "absolute", top: -120, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,39,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, left: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,156,246,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40, position: "relative" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 13,
            background: `linear-gradient(135deg, #C9A227, #9A7B1A)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 700, color: "#0A0F1C",
            boxShadow: "0 4px 20px rgba(201,162,39,0.3)",
          }}>CS</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#EAEDF3", letterSpacing: -0.3 }}>CS360</div>
            <div style={{ fontSize: 10, color: "#C9A227", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>Customer Success Platform</div>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ margin: "0 0 16px", fontSize: 32, fontWeight: 800, color: "#EAEDF3", lineHeight: 1.2, letterSpacing: -0.5, maxWidth: 460 }}>
          Turn customer data into{" "}
          <span style={{ background: "linear-gradient(135deg, #C9A227, #E8C547)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            strategic outcomes
          </span>
        </h1>
        <p style={{ fontSize: 15, color: "#6B7A94", lineHeight: 1.7, maxWidth: 440, margin: "0 0 36px" }}>
          The unified platform for customer success teams to monitor account health, drive retention, and accelerate growth.
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 24, marginBottom: 40 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: "14px 20px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", minWidth: 100, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#C9A227" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#6B7A94", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature list */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", transition: "background .2s" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11,
                background: "linear-gradient(135deg, rgba(201,162,39,0.15), rgba(201,162,39,0.05))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "#C9A227", flexShrink: 0,
              }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#EAEDF3", marginBottom: 5 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#6B7A94", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#3D4A5F" }}>Powered by <span style={{ color: "#6B7A94", fontWeight: 600 }}>ENVNT</span></span>
          <span style={{ fontSize: 10, color: "#3D4A5F" }}>v2.0 &middot; PostgreSQL Backend</span>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: T.bg, position: "relative",
      }}>
        {/* Subtle top accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.accent}40, transparent)` }} />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            position: "absolute", top: 20, right: 24,
            width: 36, height: 36, borderRadius: 10,
            border: `1px solid ${T.border}`, background: T.card,
            color: T.textS, cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .2s",
          }}
        >
          {isDark ? '\u2600' : '\u263D'}
        </button>

        <div style={{ width: 360, padding: "0 32px" }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: -0.3 }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: T.textS, marginTop: 8, lineHeight: 1.5 }}>Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, color: T.textS, marginBottom: 6, fontWeight: 500 }}>
                Email address <span style={{ color: T.err }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="you@company.com"
                required
                style={inputStyle("email")}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: T.textS, marginBottom: 6, fontWeight: 500 }}>
                Password <span style={{ color: T.err }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="Enter your password"
                  required
                  style={{ ...inputStyle("password"), paddingRight: 60 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  style={{
                    position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: `1px solid ${T.border}`, borderRadius: 6,
                    color: T.textS, cursor: "pointer", fontSize: 11, fontWeight: 500,
                    padding: "5px 10px", fontFamily: "inherit", transition: "color .2s, border-color .2s",
                  }}
                  onMouseEnter={e => { e.target.style.color = T.text; e.target.style.borderColor = T.textS; }}
                  onMouseLeave={e => { e.target.style.color = T.textS; e.target.style.borderColor = T.border; }}
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                color: T.err, fontSize: 13, marginBottom: 16, padding: "10px 14px",
                background: T.err + "10", borderRadius: 10, border: `1px solid ${T.err}25`,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 15 }}>{"\u26A0"}</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px 20px", borderRadius: 10, border: "none",
                background: loading ? T.textD : `linear-gradient(135deg, ${T.accent}, #B8860B)`,
                color: "#0A0F1C", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity .2s, transform .1s",
                boxShadow: `0 4px 16px ${T.accent}25`,
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.target.style.opacity = "0.9"; }}
              onMouseLeave={e => { if (!loading) e.target.style.opacity = "1"; }}
              onMouseDown={e => { if (!loading) e.target.style.transform = "scale(0.985)"; }}
              onMouseUp={e => { e.target.style.transform = "scale(1)"; }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Bottom text */}
          <p style={{ textAlign: "center", fontSize: 12, color: T.textD, marginTop: 32, lineHeight: 1.5 }}>
            Protected by enterprise-grade security<br />
            <span style={{ color: T.textS }}>Contact your administrator for access</span>
          </p>
        </div>
      </div>
    </div>
  );
}
