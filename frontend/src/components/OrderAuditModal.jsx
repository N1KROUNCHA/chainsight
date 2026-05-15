import OrderAuditTimeline from './OrderAuditTimeline';
import { QRCodeSVG } from 'qrcode.react';

export default function OrderAuditModal({ isOpen, onClose, orderId }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '700px', width: '90%', position: 'relative' }}>
                <button className="close-btn" onClick={onClose}>&times;</button>
                <div className="page-header" style={{ marginBottom: 20 }}>
                    <div className="page-title">🔗 Blockchain Audit Passport</div>
                    <div className="page-desc">Immutable Ledger History for Order #{orderId}</div>
                </div>

                <div style={{ marginTop: 10 }}>
                    <OrderAuditTimeline orderId={orderId} />
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 32px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                }
                .close-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 28px;
                    cursor: pointer;
                }
                .close-btn:hover {
                    color: var(--text-primary);
                }
            `}</style>
        </div>
    );
}
