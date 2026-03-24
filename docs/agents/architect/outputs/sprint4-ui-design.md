# Sprint 4: 기술 설계 - 백테스팅 결과 UI

## 디렉토리 구조
```
src/
├── screens/
│   └── BacktestScreen.tsx     # 메인 백테스팅 화면
├── components/
│   ├── ResultSummary.tsx       # 결과 요약 카드 (2x2)
│   ├── TradeList.tsx           # 거래 내역 리스트
│   └── TradeItem.tsx           # 개별 거래 행
├── hooks/
│   └── useBacktest.ts          # 백테스팅 실행 상태 관리 hook
└── theme/
    └── tokens.ts               # 디자인 토큰
```

## 상태 관리: useBacktest Hook
```typescript
type BacktestState =
  | { status: 'idle' }
  | { status: 'loading'; message: string }
  | { status: 'success'; result: BacktestResult }
  | { status: 'error'; error: string };

function useBacktest() {
  const [state, setState] = useState<BacktestState>({ status: 'idle' });
  const runBacktest = async (config) => { ... };
  return { state, runBacktest };
}
```

## 컴포넌트 Props
- `ResultSummary`: `{ result: BacktestResult }`
- `TradeList`: `{ trades: Trade[] }`
- `TradeItem`: `{ trade: Trade; index: number }`

## App.tsx 변경
- 기존 NewAppScreen → BacktestScreen으로 교체
