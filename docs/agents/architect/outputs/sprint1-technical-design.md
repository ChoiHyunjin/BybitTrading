# Sprint 1: 기술 설계 - 핵심 모델 & 지표 엔진

## 디렉토리 구조

```
src/
├── models/
│   ├── Price.ts          # OHLCV 가격 데이터 타입
│   ├── Trade.ts          # 매수/매도 거래 기록 타입
│   ├── BacktestResult.ts # 백테스트 결과 집계 타입
│   └── index.ts          # 모델 re-export
├── engine/
│   ├── PricesManager.ts  # 가격 히스토리 관리 + 통계 계산
│   ├── IndicatorMaker.ts # 기술적 지표 (볼린저밴드, MA)
│   └── index.ts
└── constants.ts          # 설정값 (심볼, 기간 등)
```

## 타입 설계

### Price
```typescript
interface Price {
  openTime: number;    // Unix timestamp (ms)
  symbol: string;      // e.g., "BTCUSDT"
  interval: string;    // e.g., "3" (minutes)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
}
```

### Trade
```typescript
type TradeAction = 'BUY' | 'SELL';

interface Trade {
  action: TradeAction;
  price: number;
  amount: number;
  timestamp: number;
  money: number;         // 거래 후 잔고
  pnl?: number;          // 실현 손익 (SELL 시에만)
  pnlPercent?: number;   // 실현 손익률 (SELL 시에만)
}
```

### BacktestResult
```typescript
interface BacktestResult {
  initialMoney: number;
  finalMoney: number;
  totalReturn: number;       // 총 수익률 (%)
  winRate: number;           // 승률 (%)
  maxDrawdown: number;       // 최대 낙폭 MDD (%)
  totalTrades: number;       // 총 거래 쌍 수 (매수+매도 = 1)
  winTrades: number;
  loseTrades: number;
  trades: Trade[];           // 전체 거래 내역
  peakMoney: number;         // 최고 자산
}
```

## 클래스 설계

### PricesManager
- `prices: number[]` — 가격 히스토리 버퍼 (max 크기 제한)
- `pushPrice(price: number): void`
- `getAverage(period: number): number` — 단순이동평균
- `getVariance(period: number): number` — 표본분산
- `getStandardDeviation(period: number): number` — 표준편차
- `setPrices(prices: number[]): void` — 초기 가격 설정

### IndicatorMaker
- `pricesManager: PricesManager`
- `n: number, k: number` — BB 파라미터
- `ma: number` — 현재 이동평균
- `touchedBottom: boolean, touchedTop: boolean`
- `pushPrice(price: number): void`
- `upper(): number, lower(): number` — BB 상단/하단
- `getBW(): number` — 밴드폭
- `movingAverage(period: number): number`
- `resetTouched(): void`

## 설계 원칙
1. **순수 계산 레이어**: API/UI 의존성 없음, 순수 TypeScript
2. **테스트 용이성**: 모든 public 메서드는 입력→출력이 명확
3. **기존 Swift 로직 보존**: 원본 알고리즘 유지, TypeScript로 포팅
4. **number 타입 사용**: RN 환경에서 Decimal 라이브러리 없이 시작, 추후 필요시 전환

## 의존성
- 없음 (순수 TypeScript, 외부 라이브러리 불필요)
