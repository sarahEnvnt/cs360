import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

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
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: T.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: "relative" }}>

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

      <div style={{ width: 380, padding: "0 32px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36, justifyContent: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 13,
            background: `linear-gradient(135deg, #C9A227, #9A7B1A)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 700, color: "#0A0F1C",
            boxShadow: `0 4px 20px rgba(201,162,39,0.3)`,
          }}>CS</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: T.text, letterSpacing: -0.3 }}>CS360</div>
            <div style={{ fontSize: 10, color: T.accent, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>Customer Success Platform</div>
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 36, textAlign: "center" }}>
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
  );
}
