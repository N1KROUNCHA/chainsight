import { useEffect, useState } from 'react';
import { api } from '../api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

  const chartData = {
    labels: data.historicalTrend.map(d => d.day),
    datasets: [{
      label: 'Avg Transit Time (Hrs)',
      data: data.historicalTrend.map(d => d.hrs),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: { 
        beginAtZero: false,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'var(--text-muted)', font: { size: 10 } }
      },
      x: { 
        grid: { display: false },
        ticks: { color: 'var(--text-muted)', font: { size: 10 } }
      }
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">⚠️ Bottleneck Detection</div>
          <div className="page-desc">Blockchain-driven operational constraints analysis</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>{data.metrics.efficiencyScore}%</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>System Efficiency</div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>TOTAL SHIPMENTS</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{data.metrics.totalAnalyzed}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>AVG LEAD TIME</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue)' }}>{data.metrics.avgLeadTimeHrs}h</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>ON-CHAIN VERIFIED</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>100%</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, height: 300 }}>
        <div className="card-header">
          <div className="card-title">Transit Time Trend (Blockchain Logs)</div>
        </div>
        <div style={{ height: 220 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Stage Analysis</div>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Stage</th><th>Avg Hrs</th><th>Delay</th><th>Throughput</th></tr>
            </thead>
            <tbody>
              {data.stages.map(s => (
                <tr key={s.id}>
                  <td className="primary">{s.stage}</td>
                  <td>{s.avgProcessingHrs.toFixed(1)}h</td>
                  <td style={{ color: s.delayRate > 0.1 ? 'var(--yellow)' : 'var(--green)' }}>
                    {(s.delayRate * 100).toFixed(0)}%
                  </td>
                  <td>
                    <div className="progress-bar" style={{ width: 60 }}>
                      <div className="progress-fill" style={{ width: `${s.throughput}%`, background: s.throughput < 85 ? '#f59e0b' : '#10b981' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Bottleneck Prediction Model</div>
          </div>
          <div style={{ padding: '10px 0' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 15 }}>
              Using historical variance from the blockchain ledger, the system predicts a 
              <strong style={{ color: 'var(--yellow)' }}> 12% probability </strong> 
              of congestion in the <strong>Transit</strong> stage over the next 48 hours.
            </p>
            <div style={{ background: 'var(--blue-soft)', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>AI RECOMMENDATION</div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                Reroute shipments through <strong>Corridor B</strong> to avoid predicted delay.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
