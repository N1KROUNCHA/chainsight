"""
Bottleneck Detector
===================
Purpose : Score each supply chain stage for delay and throughput issues
Score   : (DelayRate × 50) + ((100 - Throughput) × 0.5)
          Score ≥ 70 → CRITICAL, ≥ 40 → WARNING, else OK
"""

import numpy as np
from datetime import datetime, timedelta
import random

random.seed(7)

STAGES = [
    {'id': 'S1', 'stage': 'Procurement',       'capacity': 100, 'base_delay_rate': 0.08, 'base_throughput': 95},
    {'id': 'S2', 'stage': 'Inbound Logistics', 'capacity': 90,  'base_delay_rate': 0.22, 'base_throughput': 78},
    {'id': 'S3', 'stage': 'Warehousing',       'capacity': 120, 'base_delay_rate': 0.05, 'base_throughput': 99},
    {'id': 'S4', 'stage': 'Production',        'capacity': 80,  'base_delay_rate': 0.31, 'base_throughput': 69},
    {'id': 'S5', 'stage': 'Quality Control',   'capacity': 100, 'base_delay_rate': 0.12, 'base_throughput': 88},
    {'id': 'S6', 'stage': 'Dispatch',          'capacity': 110, 'base_delay_rate': 0.09, 'base_throughput': 91},
    {'id': 'S7', 'stage': 'Outbound Logistics','capacity': 85,  'base_delay_rate': 0.19, 'base_throughput': 81},
]


def simulate_shipments(n: int = 50) -> list:
    """Generate synthetic shipment delay records."""
    now = datetime.now()
    records = []
    for i in range(n):
        stage = random.choice(STAGES)
        delay = max(0, np.random.normal(
            loc=stage['base_delay_rate'] * 20,
            scale=3.0
        ))
        ts = now - timedelta(hours=random.randint(0, 72))
        records.append({
            'shipment_id': f'SHP-{2200 + i}',
            'stage_id':    stage['id'],
            'stage':       stage['stage'],
            'delay_hrs':   round(delay, 1),
            'ts':          ts.isoformat(),
        })
    return records


def bottleneck_score(delay_rate: float, throughput: float) -> float:
    return (delay_rate * 50) + ((100 - throughput) * 0.5)


def classify(score: float) -> str:
    if score >= 70: return 'CRITICAL'
    if score >= 40: return 'WARNING'
    return 'OK'


def analyze_stages(shipments: list) -> list:
    from collections import defaultdict
    stage_delays = defaultdict(list)
    for s in shipments:
        stage_delays[s['stage']].append(s['delay_hrs'])

    results = []
    for stg in STAGES:
        delays = stage_delays.get(stg['stage'], [])
        actual_delay_rate = stg['base_delay_rate'] + np.random.uniform(-0.03, 0.03)
        actual_throughput = stg['base_throughput'] + np.random.uniform(-2, 2)
        actual_delay_rate = max(0, min(1, actual_delay_rate))
        actual_throughput = max(0, min(100, actual_throughput))

        score = bottleneck_score(actual_delay_rate, actual_throughput)
        avg_delay = np.mean(delays) if delays else 0

        results.append({
            'stage':        stg['stage'],
            'delay_rate':   round(actual_delay_rate, 3),
            'throughput':   round(actual_throughput, 1),
            'avg_delay_hrs': round(avg_delay, 1),
            'score':        round(score, 1),
            'status':       classify(score),
            'n_shipments':  len(delays),
        })
    return results


if __name__ == '__main__':
    print("=" * 68)
    print("  ChainSight — Bottleneck Detector")
    print("  Score = (DelayRate × 50) + ((100 − Throughput) × 0.5)")
    print("=" * 68)

    shipments = simulate_shipments(n=80)
    print(f"\n📦 Simulated {len(shipments)} shipments across {len(STAGES)} stages\n")

    results = analyze_stages(shipments)
    print(f"{'Stage':<22} {'DelayRate':>10} {'Throughput':>11} {'AvgDelay':>9} {'Score':>7} {'Status'}")
    print("-" * 68)
    for r in results:
        flag = '🔴' if r['status'] == 'CRITICAL' else '🟡' if r['status'] == 'WARNING' else '🟢'
        print(f"{r['stage']:<22} {r['delay_rate']:>10.1%} {r['throughput']:>10.1f}% {r['avg_delay_hrs']:>8.1f}h {r['score']:>7.1f} {flag} {r['status']}")

    critical = [r for r in results if r['status'] == 'CRITICAL']
    warnings = [r for r in results if r['status'] == 'WARNING']
    print(f"\n🔴 Critical bottlenecks: {len(critical)} — {[r['stage'] for r in critical]}")
    print(f"🟡 Warnings:            {len(warnings)} — {[r['stage'] for r in warnings]}")
    print("\n✅ Bottleneck analysis complete.")
