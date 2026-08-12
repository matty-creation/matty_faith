import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import matplotlib.pyplot as plt

# ==========================================
# 1. DATA ACQUISITION
# ==========================================
def fetch_forex_data(ticker="EURUSD=X", period="2y", interval="1d"):
    """Downloads historical OHLCV data from Yahoo Finance."""
    df = yf.download(ticker, period=period, interval=interval)
    df.columns = [col[0].lower() if isinstance(col, tuple) else col.lower() for col in df.columns]
    df = df.dropna()
    return df

# ==========================================
# 2. FEATURE ENGINEERING & INDICATORS
# ==========================================
def add_features(df):
    """Calculates technical indicators as features for the ML model."""
    data = df.copy()
    
    # Returns & Volatility
    data['return_1d'] = data['close'].pct_change()
    data['volatility_5d'] = data['return_1d'].rolling(5).std()
    
    # Moving Averages & Distances
    data['sma_10'] = data['close'].rolling(10).mean()
    data['sma_50'] = data['close'].rolling(50).mean()
    data['dist_sma_10'] = (data['close'] - data['sma_10']) / data['sma_10']
    data['dist_sma_50'] = (data['close'] - data['sma_50']) / data['sma_50']
    
    # Relative Strength Index (RSI - 14)
    delta = data['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
    rs = gain / (loss + 1e-9)
    data['rsi'] = 100 - (100 / (1 + rs))
    
    # TARGET: 1 if tomorrow's Close > today's Close, else 0
    data['target'] = (data['close'].shift(-1) > data['close']).astype(int)
    
    return data.dropna()

# ==========================================
# 3. MODEL TRAINING & VALIDATION
# ==========================================
def train_ai_model(df):
    """Trains a Random Forest Classifier without look-ahead bias."""
    feature_cols = ['return_1d', 'volatility_5d', 'dist_sma_10', 'dist_sma_50', 'rsi']
    
    X = df[feature_cols]
    y = df['target']
    
    # Time-series split (80% Train, 20% Test)
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # Train Model
    model = RandomForestClassifier(n_estimators=100, max_depth=4, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate Accuracy
    predictions = model.predict(X_test)
    print("--- Model Performance Metrics ---")
    print(classification_report(y_test, predictions))
    
    # Attach predictions back to the test dataset
    test_df = df.iloc[split_idx:].copy()
    test_df['signal'] = model.predict(X_test)
    # Map 0 signal (Predict Down) to -1 for shorting, or 0 to stay flat
    test_df['position'] = np.where(test_df['signal'] == 1, 1, -1)
    
    return test_df

# ==========================================
# 4. BACKTESTING ENGINE
# ==========================================
def run_backtest(test_df, spread_cost=0.0001):
    """Simulates trading strategy performance against buy & hold."""
    results = test_df.copy()
    
    # Calculate strategy return (Position taken today * Next day return)
    # Subtract spread/slippage cost on signal changes
    results['position_change'] = results['position'].diff().fillna(0).abs()
    results['cost'] = results['position_change'] * spread_cost
    
    results['strategy_return'] = (results['position'].shift(1) * results['return_1d']) - results['cost']
    
    # Cumulative Returns
    results['cum_buy_hold'] = (1 + results['return_1d']).cumprod()
    results['cum_ai_strategy'] = (1 + results['strategy_return']).cumprod()
    
    return results

# ==========================================
# MAIN EXECUTION
# ==========================================
if __name__ == "__main__":
    print("1. Fetching EUR/USD Data...")
    raw_data = fetch_forex_data(ticker="EURUSD=X", period="3y", interval="1d")
    
    print("2. Engineering Technical Features...")
    featured_data = add_features(raw_data)
    
    print("3. Training Machine Learning Model...")
    test_results = train_ai_model(featured_data)
    
    print("4. Running Backtest...")
    backtest_results = run_backtest(test_results)
    
    # Plotting Results
    plt.figure(figsize=(12, 6))
    plt.plot(backtest_results['cum_buy_hold'], label="Buy & Hold EUR/USD", color="gray", linestyle="--")
    plt.plot(backtest_results['cum_ai_strategy'], label="AI Trading Strategy", color="green", linewidth=2)
    plt.title("AI Forex Strategy Backtest vs. Buy & Hold (EUR/USD)")
    plt.xlabel("Date")
    plt.ylabel("Cumulative Growth (1.0 = Baseline)")
    plt.legend()
    plt.grid(True)
    plt.show()