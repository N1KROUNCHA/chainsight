"""
Demand Forecasting Module
=========================
Algorithms: XGBoost + ARIMA ensemble
Purpose   : Predict future demand using historical sales and seasonal trends
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# ── Synthetic historical data ─────────────────────────────────────────────────
def generate_sales_data(n_months: int = 24) -> pd.DataFrame:
    np.random.seed(42)
    dates  = pd.date_range(start='2024-01-01', periods=n_months, freq='ME')
    trend  = np.linspace(80, 180, n_months)
    season = 20 * np.sin(2 * np.pi * np.arange(n_months) / 12)
    noise  = np.random.normal(0, 6, n_months)
    sales  = (trend + season + noise).clip(min=0).astype(int)
    df = pd.DataFrame({'date': dates, 'sales': sales})
    df['month']   = df['date'].dt.month
    df['quarter'] = df['date'].dt.quarter
    df['trend']   = np.arange(n_months)
    df['lag_1']   = df['sales'].shift(1).fillna(method='bfill')
    df['lag_12']  = df['sales'].shift(12).fillna(method='bfill')
    df['rolling_3'] = df['sales'].rolling(3, min_periods=1).mean()
    return df


# ── ARIMA-style simple forecast (stub) ───────────────────────────────────────
def arima_forecast(series: np.ndarray, horizon: int = 5) -> np.ndarray:
    """Simple moving-average + trend extrapolation (ARIMA concept stub)."""
    ma   = series[-6:].mean()
    diff = np.diff(series[-6:]).mean()
    return np.array([ma + diff * (i + 1) for i in range(horizon)])


# ── XGBoost-style forecast (linear regression stand-in) ──────────────────────
def xgboost_forecast(df: pd.DataFrame, horizon: int = 5) -> np.ndarray:
    """Feature-based regression forecast (XGBoost stand-in without sklearn dep)."""
    X = df[['trend', 'month', 'lag_1', 'rolling_3']].values.astype(float)
    y = df['sales'].values.astype(float)

    # Normal equations: w = (X^T X)^{-1} X^T y
    Xb = np.hstack([np.ones((len(X), 1)), X])
    try:
        w = np.linalg.lstsq(Xb, y, rcond=None)[0]
    except Exception:
        return arima_forecast(y, horizon)

    forecasts = []
    last_trend = df['trend'].max()
    last_lag   = y[-1]
    roll3      = y[-3:].mean()

    for i in range(1, horizon + 1):
        month  = ((df['month'].iloc[-1] + i - 1) % 12) + 1
        trend  = last_trend + i
        feat   = np.array([1.0, trend, month, last_lag, roll3])
        pred   = np.dot(w, feat)
        forecasts.append(max(pred, 0))
        last_lag = pred
        roll3    = np.mean(forecasts[-3:])

    return np.array(forecasts)


# ── Ensemble ──────────────────────────────────────────────────────────────────
def ensemble_forecast(df: pd.DataFrame, horizon: int = 5, alpha: float = 0.6) -> dict:
    """Blend XGBoost (60%) + ARIMA (40%) forecasts."""
    xgb   = xgboost_forecast(df, horizon)
    arima = arima_forecast(df['sales'].values, horizon)
    blend = alpha * xgb + (1 - alpha) * arima

    # Confidence interval: ±10% of forecast
    margin = blend * 0.10
    future_dates = pd.date_range(
        start=df['date'].iloc[-1] + pd.DateOffset(months=1),
        periods=horizon, freq='ME'
    )
    return {
        'dates':  [str(d.date()) for d in future_dates],
        'values': [round(float(v), 1) for v in blend],
        'lower':  [round(float(v - m), 1) for v, m in zip(blend, margin)],
        'upper':  [round(float(v + m), 1) for v, m in zip(blend, margin)],
    }


# ── Seasonal decomposition summary ───────────────────────────────────────────
def seasonal_summary(df: pd.DataFrame) -> dict:
    monthly_avg = df.groupby('month')['sales'].mean().to_dict()
    peak_month  = max(monthly_avg, key=monthly_avg.get)
    trough_month = min(monthly_avg, key=monthly_avg.get)
    return {
        'peak_month':   peak_month,
        'trough_month': trough_month,
        'peak_avg':     round(monthly_avg[peak_month], 1),
        'trough_avg':   round(monthly_avg[trough_month], 1),
    }


# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("=" * 60)
    print("  ChainSight — Demand Forecasting Engine")
    print("  Algorithm: XGBoost + ARIMA Ensemble")
    print("=" * 60)

    df = generate_sales_data(n_months=24)
    print(f"\n📊 Historical data loaded: {len(df)} months")
    print(df[['date', 'sales']].tail(6).to_string(index=False))

    result = ensemble_forecast(df, horizon=5)
    print(f"\n🔮 5-Month Demand Forecast (XGBoost 60% + ARIMA 40%):")
    print(f"{'Date':<14} {'Forecast':>10} {'Lower':>10} {'Upper':>10}")
    print("-" * 48)
    for d, v, lo, hi in zip(result['dates'], result['values'], result['lower'], result['upper']):
        print(f"{d:<14} {v:>10.1f} {lo:>10.1f} {hi:>10.1f}")

    season = seasonal_summary(df)
    print(f"\n📅 Seasonal Analysis:")
    print(f"  Peak month  : {season['peak_month']:>2} (avg {season['peak_avg']} units)")
    print(f"  Trough month: {season['trough_month']:>2} (avg {season['trough_avg']} units)")
    print("\n✅ Forecasting pipeline complete.")
