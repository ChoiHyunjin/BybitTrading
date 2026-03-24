# Sprint 2: 기술 설계 - 백테스팅 엔진

## 핵심 설계: 전략-엔진 분리

### Strategy Interface
```typescript
interface TradingStrategy {
  name: string;
  init(prices: number[]): void;
  onPrice(price: Price): Signal;
  reset(): void;
}

type Signal = 'BUY' | 'SELL' | 'HOLD';
```

**원칙**: 전략은 매수/매도 "신호"만 반환. 포지션 관리/주문 실행은 엔진이 담당.

### BacktestEngine
```typescript
class BacktestEngine {
  run(config: BacktestConfig, data: Price[]): BacktestResult;
}

interface BacktestConfig {
  strategy: TradingStrategy;
  initialMoney: number;
  symbol: string;
}
```

**동작 흐름:**
1. 초기 가격으로 전략 초기화 (`strategy.init()`)
2. 각 캔들에 대해 `strategy.onPrice(price)` → Signal
3. Signal에 따라 매수/매도 실행, Trade 기록
4. 전체 순회 후 `calculateBacktestResult()` 호출

### BollingerStrategy
기존 `Trader.swift`의 전략 로직을 `TradingStrategy` 인터페이스로 포팅:
- `onNoCoin` → touchedTop && price <= shortMA → BUY
- `onHasCoin` → BW >= 1% && shortMA > longMA → SELL, 또는 touchedBottom && price >= shortMA → SELL

### 디렉토리 구조 추가
```
src/
├── engine/
│   ├── BacktestEngine.ts     # NEW: 백테스팅 실행 엔진
│   ├── PricesManager.ts
│   ├── IndicatorMaker.ts
│   └── index.ts
├── strategies/
│   ├── TradingStrategy.ts    # NEW: 전략 인터페이스
│   ├── BollingerStrategy.ts  # NEW: 볼린저밴드 전략
│   └── index.ts
```

### 매수/매도 로직 (엔진 담당)
- **매수**: `amount = floor((money / price) * 1000) / 1000` (기존 Swift 로직 유지)
- **매도**: `money += price * amount` (실제 매도 수익. 기존 Swift의 2x 로직은 수정)
- **Trade 기록**: 매수/매도마다 Trade 생성, SELL 시 pnl 계산
