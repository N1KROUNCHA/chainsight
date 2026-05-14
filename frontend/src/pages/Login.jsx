import { useState } from 'react';

export default function Login({ onLogin }) {
  const [view, setView] = useState('LOGIN'); // LOGIN or REGISTER
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('RETAILER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = view === 'LOGIN' ? '/api/auth/login' : '/api/auth/register';
      const body = view === 'LOGIN' 
        ? { email, password } 
        : { email, password, fullName, role };

      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        const user = await res.json();
        if (view === 'REGISTER') {
          alert('Registration successful! Please login.');
          setView('LOGIN');
        } else {
          onLogin(user);
        }
      } else {
        setError(view === 'LOGIN' ? 'Invalid credentials' : 'Registration failed');
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
      <div className="card" style={{ width: 400, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⬡</div>
          <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 4 }}>ChainSight</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {view === 'LOGIN' ? 'Sign in to your account' : 'Create your supply chain profile'}
          </p>
        </div>
        
        {error && <div style={{ background: '#ef444420', color: '#ef4444', padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 20, textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {view === 'REGISTER' && (
            <>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>FULL NAME</label>
                <input 
                  type="text" 
                  className="btn btn-ghost" 
                  style={{ width: '100%', textAlign: 'left', cursor: 'text', border: '1px solid var(--border)' }}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>YOUR ROLE</label>
                <select 
                  className="btn btn-ghost" 
                  style={{ width: '100%', textAlign: 'left', border: '1px solid var(--border)' }}
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  required
                >
                  <option value="RETAILER">Retailer (Store Owner)</option>
                  <option value="DISTRIBUTOR">Distributor (Regional Hub)</option>
                  <option value="SUPPLIER">Supplier (Manufacturer)</option>
                  <option value="TRUCK_OWNER">Transporter (Fleet Owner)</option>
                </select>
              </div>
            </>
          )}
          
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
            {loading ? 'Processing...' : (view === 'LOGIN' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {view === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button 
            onClick={() => setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
            style={{ 
              background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, 
              marginLeft: 8, cursor: 'pointer', textDecoration: 'underline' 
            }}
          >
            {view === 'LOGIN' ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
