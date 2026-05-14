import { useEffect, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Filler, Tooltip, Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { api } from '../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

const chartDefaults = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false, backgroundColor: '#162033', borderColor: '#1e2d47', borderWidth: 1, titleColor: '#f1f5f9', bodyColor: '#94a3b8', padding: 10 },
  },
  scales: {
    x: { grid: { color: '#1e2d47' }, ticks: { color: '#475569', font: { size: 11 } } },
    y: { grid: { color: '#1e2d47' }, ticks: { color: '#475569', font: { size: 11 } } },
  },
};

export default function DemandForecasting() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trend');

  useEffect(() => {
    api.forecast().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-ring" />;
  if (!data) return <div style={{ color: 'var(--text-muted)' }}>Failed to load data.</div>;

  const labels = data.historical.map(h => h.period);

  const lineChartData = {
    labels,
    datasets: [
      { label: 'Historical Sales', data: data.historical.map(h => h.sales), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', pointRadius: 4, tension: 0.4, fill: true },
      { label: 'Forecast', data: data.historical.map(h => h.forecast), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.06)', borderDash: [6, 3], pointRadius: 4, tension: 0.4, fill: true },
      { label: 'Upper', data: data.historical.map(h => h.upper ?? null), borderColor: 'rgba(139,92,246,0.25)', borderDash: [3, 3], pointRadius: 0, tension: 0.4 },
      { label: 'Lower', data: data.historical.map(h => h.lower ?? null), borderColor: 'rgba(139,92,246,0.25)', borderDash: [3, 3], pointRadius: 0, tension: 0.4 },
    ],
  };

  const barData = {
    labels: data.products.map(p => p.sku),
    datasets: [{
      label: 'Forecast Units',
      data: data.products.map(p => p.forecastUnits),
      backgroundColor: ['#3b82f6cc','#8b5cf6cc','#10b981cc','#f59e0bcc','#ef4444cc'],
      borderRadius: 6,
    }],
  };

  const trendColor = { up: 'var(--green)', down: 'var(--red)', flat: 'var(--text-muted)' };
  const trendIcon  = { up: '▲', down: '▼', flat: '→' };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📈 Demand Forecasting</div>
        <div className="page-desc">XGBoost + ARIMA ensemble — {(data.overallConfidence * 100).toFixed(1)}% accuracy</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[['Algorithm', data.algorithm], ['Confidence', `${(data.overallConfidence*100).toFixed(1)}%`], ['Horizon', '5 months'], ['SKUs Tracked', data.products.length]].map(([l, v]) => (
          <div key={l} className="metric-chip"><span className="lbl">{l}</span><span className="val">{v}</span></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['trend','📈 Trend & Forecast'], ['sku','📦 SKU Breakdown']].map(([k, label]) => (
          <button key={k} className={`btn ${activeTab === k ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab(k)}>{label}</button>
        ))}
      </div>

      {activeTab === 'trend' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-icon" style={{ background: 'var(--blue-soft)' }}>📊</div>Sales Trend + 5-Month Forecast</div>
            </div>
            <div style={{ height: 320 }}>
              <Line data={lineChartData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: true, labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11 } } } } }} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-icon" style={{ background: 'var(--purple-soft)' }}>🔮</div>Forecast Detail — Next 5 Periods</div>
            </div>
            <table className="data-table">
              <thead><tr><th>Period</th><th>Forecast Units</th><th>Lower</th><th>Upper</th><th>Status</th></tr></thead>
              <tbody>
                {data.historical.filter(h => h.forecast !== null).map((h, i) => (
                  <tr key={i}>
                    <td className="primary">{h.period}</td>
                    <td style={{ color: 'var(--accent-2)', fontWeight: 600 }}>{h.forecast}</td>
                    <td>{h.lower}</td><td>{h.upper}</td>
                    <td><span className="badge purple">Projected</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sku' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-icon" style={{ background: 'var(--green-soft)' }}>📦</div>Per-SKU Demand Forecast</div>
            </div>
            <div style={{ height: 280 }}><Bar data={barData} options={chartDefaults} /></div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="card-icon" style={{ background: 'var(--blue-soft)' }}>📋</div>SKU Forecast Table</div>
            </div>
            <table className="data-table">
              <thead><tr><th>SKU</th><th>Product</th><th>Forecast (units)</th><th>Confidence</th><th>Trend</th></tr></thead>
              <tbody>
                {data.products.map(p => (
                  <tr key={p.sku}>
                    <td><span className="tx-hash" style={{ background: 'var(--purple-soft)', color: 'var(--accent-2)' }}>{p.sku}</span></td>
                    <td className="primary">{p.name}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.forecastUnits.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 80 }}>
                          <div className="progress-fill" style={{ width: `${p.confidence*100}%`, background: 'var(--accent)' }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{(p.confidence*100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{ color: trendColor[p.trend], fontWeight: 600 }}>{trendIcon[p.trend]} {p.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
