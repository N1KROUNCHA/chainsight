import { useEffect, useState } from 'react';
import { api } from '../api';

const STEP_ICONS = {
    'ORDER_CREATED': '📝',
    'STATUS_UPDATE': '🔄',
    'TRANSPORTER_ASSIGNED': '🚛',
    'DISPATCHED': '🚀',
    'DELIVERED': '✅',
    'DEFAULT': '📦'
};

export default function OrderAuditTimeline({ orderId }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            setLoading(true);
            api.getBlockchainByOrder(orderId)
                .then(setEvents)
                .catch(err => console.error("Audit Fetch Error:", err))
                .finally(() => setLoading(false));
        }
    }, [orderId]);

    if (loading) return <div className="loading-dots">Fetching Ledger...</div>;
    if (!Array.isArray(events) || events.length === 0) return <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No on-chain records found for this order.</div>;

    return (
        <div className="timeline-container">
            {events.map((event, index) => (
                <div key={event.id || index} className="timeline-item">
                    <div className="timeline-node">
                        <div className="node-icon">{STEP_ICONS[event.eventType] || STEP_ICONS['DEFAULT']}</div>
                        {index < events.length - 1 && <div className="node-line"></div>}
                    </div>
                    <div className="timeline-content card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{(event.eventType || 'UNKNOWN').replace(/_/g, ' ')}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{event.details}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', color: 'var(--accent)' }}>
                                {event.transactionHash ? `${event.transactionHash.substring(0, 14)}...` : 'SIMULATED'}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Role: {event.entityRole || 'SYSTEM'}</span>
                        </div>
                    </div>
                </div>
            ))}

            <style>{`
                .timeline-container {
                    padding: 20px 10px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .timeline-item {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 0;
                }
                .timeline-node {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 40px;
                }
                .node-icon {
                    width: 36px;
                    height: 36px;
                    background: var(--bg-card);
                    border: 2px solid var(--accent);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    z-index: 2;
                    box-shadow: 0 0 15px var(--accent-glow);
                }
                .node-line {
                    flex: 1;
                    width: 2px;
                    background: var(--border);
                    margin: 4px 0;
                }
                .timeline-content {
                    flex: 1;
                    padding: 12px 16px !important;
                    margin-bottom: 20px !important;
                    background: rgba(255, 255, 255, 0.03) !important;
                    border-left: 3px solid var(--accent) !important;
                    transition: transform 0.2s;
                }
                .timeline-content:hover {
                    transform: translateX(5px);
                    background: rgba(255, 255, 255, 0.05) !important;
                }
            `}</style>
        </div>
    );
}
