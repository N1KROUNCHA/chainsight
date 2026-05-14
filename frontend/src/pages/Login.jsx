import { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (res.ok) {
        const user = await res.json();
        onLogin(user);
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: 'radial-gradient(circle at top right, #1e293b, #0f172a)' 
    }}>
      <div className="card" style={{ width: 360, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⬡</div>
          <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>ChainSight</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Multi-Role Supply Chain Platform</p>
        </div>
        
        {error && <div style={{ background: '#ef444420', color: '#ef4444', padding: 8, borderRadius: 6, fontSize: 12, marginBottom: 16, textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>EMAIL</label>
            <input 
              type="email" 
              className="btn btn-ghost" 
              style={{ width: '100%', textAlign: 'left', cursor: 'text', border: '1px solid var(--border)' }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>PASSWORD</label>
            <input 
              type="password" 
              className="btn btn-ghost" 
              style={{ width: '100%', textAlign: 'left', cursor: 'text', border: '1px solid var(--border)' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
