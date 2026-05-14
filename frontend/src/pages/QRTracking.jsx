import { useState, useEffect } from 'react';
import { api } from '../api';

const DEMO_CODES = ['SHP-2241', 'SHP-2235', 'SHP-2225'];
const STATUS_META = {
  'In Transit': { badge: 'warn', icon: '🚚' },
  'Delivered':  { badge: 'ok',   icon: '✅' },
  'Pending':    { badge: 'info', icon: '⏳' },
};

function QRDisplay({ code }) {
  const seed = code.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const grid = Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      if ((r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2)) return true;
      return ((seed * (r + 1) * (c + 1) * 31337) % 100) < 45;
    })
  );
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, padding: 12, background: 'white', borderRadius: 8 }}>
      {grid.map((row, r) => (
        <div key={r} style={{ display: 'flex', gap: 2 }}>
          {row.map((filled, c) => (
            <div key={c} style={{ width: 9, height: 9, background: filled ? '#080c14' : 'white', borderRadius: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function QRTracking() {
  const [scanCode, setScanCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [activeDemo, setActiveDemo] = useState(null);

  useEffect(() => {
    api.qr().then(d => setRecentScans(d.recentScans || [])).catch(() => {});
  }, []);

  const doScan = async (code) => {
    const c = (code || scanCode).trim().toUpperCase();
    if (!c) return;
    setLoading(true); setError(''); setResult(null); setActiveDemo(c);
    try {
      const data = await api.qrCode(c);
      setResult(data);
    } catch {
      setError(`No shipment found for "${c}". Try: ${DEMO_CODES.join(', ')}`);
    } finally {
      setLoading(false);
    }
  };

  const statusMeta = result ? (STATUS_META[result.status] || { badge: 'info', icon: '📦' }) : null;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📱 QR / Barcode Tracking</div>
        <div className="page-desc">Real-time shipment verification, inventory sync and scan history</div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Scanner panel */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><div className="card-icon" style={{ background: 'var(--blue-soft)' }}>📷</div>Scan Shipment</div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input type="text" value={scanCode}
              onChange={e => setScanCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && doScan()}
              placeholder="Enter shipment code (e.g. SHP-2241)"
              style={{ flex: 1, padding: '9px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', outline: 'none' }}
            />
            <button className="btn btn-primary" onClick={() => doScan()} disabled={loading}>
              {loading ? '⌛' : '🔍'} Scan
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>DEMO SHIPMENTS</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DEMO_CODES.map(code => (
                <button key={code} className="btn btn-ghost"
                  style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', borderColor: activeDemo === code ? 'var(--accent)' : 'var(--border)' }}
                  onClick={() => { setScanCode(code); doScan(code); }}>
                  {code}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--red-soft)', border: '1px solid #ef444440', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>
              ❌ {error}
            </div>
          )}

          {result && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <QRDisplay code={result.shipmentId} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{result.shipmentId}</div>
                <span className={`badge ${statusMeta.badge}`}>{statusMeta.icon} {result.status}</span>
              </div>
              {[
                ['Product',     result.product],
                ['SKU',         result.sku],
                ['Origin',      result.origin],
                ['Destination', result.destination],
                ['Quantity',    `${result.qty} units`],
                ['Last Scan',   new Date(result.lastScan).toLocaleString('en-IN')],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>BLOCKCHAIN TX</div>
                <span className="tx-hash">{result.txHash}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-icon" style={{ background: 'var(--green-soft)' }}>🕐</div>Recent Scans</div>
            </div>
            {recentScans.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent scans.</div>
            ) : (
              <div>
                {recentScans.map((s, i) => (
                  <div key={i} onClick={() => { setScanCode(s.code); doScan(s.code); }}
                    style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>📦</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>{s.code}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.product}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {s.location} · {new Date(s.scannedAt).toLocaleString('en-IN')}</div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--accent)' }}>→</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-icon" style={{ background: 'var(--purple-soft)' }}>⚙️</div>How It Works</div>
            </div>
            {[
              { icon: '📱', step: '1. Scan',    desc: 'Warehouse staff scan barcode/QR at each checkpoint' },
              { icon: '🔍', step: '2. Lookup',  desc: 'System fetches real-time shipment data from API' },
              { icon: '🔗', step: '3. Record',  desc: 'Each scan event is logged to blockchain immutably' },
              { icon: '📦', step: '4. Sync',    desc: 'Inventory database auto-updated on delivery confirm' },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 32, height: 32, background: 'var(--bg-hover)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{item.step}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
