"""
Inventory Optimizer
===================
Purpose : Calculate ROP, safety stock, EOQ, and flag reorder requirements
Formula : ROP = (Daily Demand × Lead Time) + Safety Stock
          EOQ = sqrt(2 × D × S / H)
"""

import math
import numpy as np

PRODUCTS = [
    {'sku': 'A100', 'name': 'Raw Material A',  'daily_demand': 14, 'lead_time_days': 7,  'demand_std': 3.0, 'unit_cost': 45.00,  'holding_pct': 0.25, 'order_cost': 120},
    {'sku': 'B200', 'name': 'Finished Good B',  'daily_demand': 8,  'lead_time_days': 10, 'demand_std': 2.0, 'unit_cost': 125.50, 'holding_pct': 0.25, 'order_cost': 200},
    {'sku': 'C310', 'name': 'Component C',      'daily_demand': 5,  'lead_time_days': 12, 'demand_std': 1.5, 'unit_cost': 22.75,  'holding_pct': 0.20, 'order_cost': 80},
    {'sku': 'D450', 'name': 'Packaging D',      'daily_demand': 60, 'lead_time_days': 5,  'demand_std': 10.0,'unit_cost': 3.20,   'holding_pct': 0.15, 'order_cost': 50},
    {'sku': 'E501', 'name': 'Sub-assembly E',   'daily_demand': 3,  'lead_time_days': 14, 'demand_std': 1.0, 'unit_cost': 89.00,  'holding_pct': 0.25, 'order_cost': 150},
]

CURRENT_STOCK = {'A100': 420, 'B200': 220, 'C310': 85, 'D450': 1800, 'E501': 30}
Z_95 = 1.645  # z-score for 95% service level


def safety_stock(demand_std: float, lead_time: int, z: float = Z_95) -> float:
    """SS = Z × σ_demand × √(lead_time)"""
    return z * demand_std * math.sqrt(lead_time)


def reorder_point(daily_demand: float, lead_time: int, ss: float) -> float:
    """ROP = (d × L) + SS"""
    return daily_demand * lead_time + ss


def economic_order_quantity(annual_demand: float, order_cost: float, unit_cost: float, holding_pct: float) -> float:
    """EOQ = √(2DS / H),  H = holding_pct × unit_cost"""
    H = holding_pct * unit_cost
    return math.sqrt(2 * annual_demand * order_cost / H) if H > 0 else 0


def analyze_product(p: dict, on_hand: int) -> dict:
    ss  = safety_stock(p['demand_std'], p['lead_time_days'])
    rop = reorder_point(p['daily_demand'], p['lead_time_days'], ss)
    annual_demand = p['daily_demand'] * 365
    eoq = economic_order_quantity(annual_demand, p['order_cost'], p['unit_cost'], p['holding_pct'])
    days_remaining = on_hand / p['daily_demand'] if p['daily_demand'] > 0 else 999

    if on_hand <= ss:
        status = 'CRITICAL'
    elif on_hand <= rop:
        status = 'REORDER'
    else:
        status = 'OK'

    return {
        'sku': p['sku'], 'name': p['name'],
        'on_hand': on_hand,
        'safety_stock': round(ss, 1),
        'reorder_point': round(rop, 1),
        'eoq': round(eoq, 0),
        'days_remaining': round(days_remaining, 1),
        'status': status,
    }


if __name__ == '__main__':
    print("=" * 70)
    print("  ChainSight — Inventory Optimizer")
    print("  Service Level: 95%  |  Formula: ROP = (d × L) + SS")
    print("=" * 70)

    results = []
    for p in PRODUCTS:
        on_hand = CURRENT_STOCK.get(p['sku'], 0)
        r = analyze_product(p, on_hand)
        results.append(r)

    print(f"\n{'SKU':<8} {'Name':<22} {'On Hand':>8} {'SS':>7} {'ROP':>7} {'EOQ':>7} {'Days':>6} {'Status'}")
    print("-" * 70)
    for r in results:
        flag = '🔴' if r['status'] == 'CRITICAL' else '🟡' if r['status'] == 'REORDER' else '🟢'
        print(f"{r['sku']:<8} {r['name']:<22} {r['on_hand']:>8} {r['safety_stock']:>7.1f} {r['reorder_point']:>7.1f} {r['eoq']:>7.0f} {r['days_remaining']:>6.1f} {flag} {r['status']}")

    critical = [r for r in results if r['status'] == 'CRITICAL']
    reorder  = [r for r in results if r['status'] == 'REORDER']
    print(f"\n⚠️  Critical: {len(critical)} SKU(s) — {[r['sku'] for r in critical]}")
    print(f"🔄 Reorder:  {len(reorder)} SKU(s) — {[r['sku'] for r in reorder]}")
    print("\n✅ Inventory optimization analysis complete.")
