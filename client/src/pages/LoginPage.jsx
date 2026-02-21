import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Btn } from '../components/ui/Btn.jsx';
import { Input } from '../components/ui/Input.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: T.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 40, width: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 50, height: 50, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, #B8860B)`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: T.bg, marginBottom: 12 }}>CS</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.text }}>CS360</h1>
          <p style={{ fontSize: 12, color: T.textS, marginTop: 4 }}>Customer Success Platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="you@company.com" required />
          <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="Enter your password" required />

          {error && <div style={{ color: T.err, fontSize: 12, marginBottom: 12, padding: "8px 12px", background: T.err + "15", borderRadius: 8 }}>{error}</div>}

          <Btn onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "10px", marginTop: 4 }}>
            {loading ? "Please wait..." : "Sign In"}
          </Btn>
        </form>
      </div>
    </div>
  );
}
