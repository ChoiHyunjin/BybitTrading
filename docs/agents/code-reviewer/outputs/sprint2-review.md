# Sprint 2: Code Review - 백테스팅 엔진

## Review Summary
**Status: APPROVED** ✅

## Checklist

### Correctness
- [x] TradingStrategy 인터페이스: name, init, onPrice, reset ✅
- [x] BollingerStrategy: 기존 Swift 로직 충실히 포팅 ✅
- [x] BacktestEngine: 초기화 → 순회 → 매수/매도 → 결과 생성 ✅
- [x] 매도 로직: `money += price * amount` (기존 2x 버그 수정) ✅
- [x] PnL 계산: `(sellPrice - buyPrice) * amount` ✅
- [x] 미체결 포지션: 마지막 가격으로 평가 반영 ✅

### Architecture
- [x] 전략-엔진 분리: Strategy는 Signal만 반환, 엔진이 주문 관리 ✅
- [x] 새 전략 추가 용이: TradingStrategy 구현만 하면 됨 ✅
- [x] 순수 함수적: 외부 상태 의존 없음 ✅

### Test Coverage
- [x] BacktestEngine: 5 tests (empty data, trades, win/lose, unrealized, MDD) ✅
- [x] BollingerStrategy: 4 tests (HOLD, normal, interface, reset) ✅

### Notes
- BollingerStrategy의 실제 매수/매도 시그널은 특정 시장 조건에서만 발생하므로 단위 테스트에서 직접 트리거하기 어려움 → 통합 테스트에서 실제 데이터로 검증 권장
- `Math.floor((money / price) * 1000) / 1000` — 소수점 3자리 절삭, 거래소 규격과 일치
