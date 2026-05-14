import { useEffect, useState } from 'react';
import { api } from '../api';

function ScoreGauge({ score }) {
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';
  const label = score >= 70 ? 'CRITICAL' : score >= 40 ? 'WARNING' : 'OK';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 8px' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#1e2d47" strokeWidth="8" />
          <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${(score / 100) * 213.6} 213.6`}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color }}>
          {score}
        </div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
    </div>
  );
}

export default function Bottleneck() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.bottleneck().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-ring" />;
  if (!data) return <div style={{ color: 'var(--text-muted)' }}>Failed to load data.</div>;

  const statusBadge = { OK: 'ok', WARNING: 'warn', CRITICAL: 'crit' };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">⚠️ Bottleneck Detection</div>
        <div className="page-desc">Identify persistent operational constraints — delay rates, throughput, queue analysis</div>
      </div>

      {/* Score cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {data.stages.map(s => (
          <div key={s.id} className="card" style={{ textAlign: 'center', borderColor: s.status === 'CRITICAL' ? '#ef444440' : s.status === 'WARNING' ? '#f59e0b40' : 'var(--border)' }}>
            <ScoreGauge score={s.score} />
            <div className="glow-divider" style={{ margin: '12px 0 8px' }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{s.stage}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Delay: <strong style={{ color: 'var(--yellow)' }}>{(s.delayRate * 100).toFixed(0)}%</strong></span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Throughput: <strong style={{ color: 'var(--accent-3)' }}>{s.throughput}%</strong></span>
            </div>
            <span className={`badge ${statusBadge[s.status]}`}>{s.status}</span>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Pipeline table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><div className="card-icon" style={{ background: 'var(--blue-soft)' }}>📋</div>Stage Analysis</div>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Stage</th><th>Avg Hrs</th><th>Delay Rate</th><th>Throughput</th><th>Score</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.stages.map(s => (
                <tr key={s.id}>
                  <td className="primary">{s.stage}</td>
                  <td>{s.avgProcessingHrs}h</td>
                  <td style={{ color: s.delayRate > 0.25 ? 'var(--red)' : s.delayRate > 0.1 ? 'var(--yellow)' : 'var(--green)' }}>
                    {(s.delayRate * 100).toFixed(0)}%
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div className="progress-fill" style={{ width: `${s.throughput}%`, background: s.throughput < 75 ? '#ef4444' : s.throughput < 85 ? '#f59e0b' : '#10b981' }} />
                      </div>
                      <span style={{ fontSize: 11 }}>{s.throughput}%</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: s.score >= 70 ? 'var(--red)' : s.score >= 40 ? 'var(--yellow)' : 'var(--green)' }}>{s.score}</td>
                  <td><span className={`badge ${statusBadge[s.status]}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent delays */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><div className="card-icon" style={{ background: 'var(--red-soft)' }}>⏱️</div>Recent Delay Events</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.recentDelays.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--red-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🕐</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{d.shipmentId}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>+{d.delayHrs}h</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{d.stage}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(d.ts).toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="glow-divider" />
          <div style={{ padding: '4px 0' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Bottleneck Scoring Formula</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent)', padding: '8px 12px', background: 'var(--blue-soft)', borderRadius: 8, lineHeight: 1.6 }}>
              Score = (DelayRate × 50) + ((100 − Throughput) × 0.5)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
