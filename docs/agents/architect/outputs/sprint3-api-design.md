# Sprint 3: 기술 설계 - Bybit API 연동

## Bybit V5 Kline API

### Endpoint
```
GET https://api.bybit.com/v5/market/kline
```

### Parameters
- `category`: "linear" (USDT perpetual)
- `symbol`: e.g., "BTCUSDT"
- `interval`: "1", "3", "5", "15", "30", "60", "120", "240", "360", "720", "D", "W", "M"
- `start`: 시작 타임스탬프 (ms)
- `end`: 종료 타임스탬프 (ms)
- `limit`: 최대 200개

### Response
```json
{
  "retCode": 0,
  "result": {
    "symbol": "BTCUSDT",
    "category": "linear",
    "list": [
      ["openTime", "open", "high", "low", "close", "volume", "turnover"]
    ]
  }
}
```
- list는 **최신순** 정렬 → 시간순으로 reverse 필요

## 디렉토리 구조
```
src/
├── api/
│   ├── BybitApi.ts       # Bybit REST API 클라이언트
│   └── index.ts
```

## BybitApi 설계
```typescript
class BybitApi {
  static async fetchKlines(params: KlineParams): Promise<Price[]>;
  static async fetchAllKlines(params: KlineRangeParams): Promise<Price[]>;
}
```

- `fetchKlines`: 단일 요청 (최대 200개)
- `fetchAllKlines`: 기간 전체를 페이지네이션으로 수집

## 설계 원칙
- 공개 API만 사용 (인증 불필요)
- V5 API 사용 (최신)
- testnet이 아닌 mainnet에서 과거 데이터 조회 (testnet은 데이터 부족)
