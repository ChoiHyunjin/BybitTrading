# Epic: React Native 백테스팅 시스템

## Goal
Bybit 과거 데이터를 기반으로 트레이딩 전략을 검증하고 성과를 분석할 수 있는 모바일 백테스팅 앱

## Business Value
- 실거래 전 전략 성과 검증으로 손실 리스크 감소
- 전략 개선의 객관적 근거 확보
- 다양한 전략을 빠르게 비교 평가

## Hypotheses
- H1: 과거 데이터 기반 백테스팅으로 전략의 수익성을 사전 검증할 수 있다
- H2: 볼린저밴드 기반 전략이 BTCUSDT에서 양의 수익률을 보인다

## Risk Constraints
- 부동소수점 오류 방지 (금융 계산 정확도)
- API 호출 제한 대응 (rate limiting)
- 대량 데이터 처리 시 모바일 성능 고려

---

## Backlog

| # | Story | Priority | Size | Status |
|---|-------|----------|------|--------|
| 1 | **핵심 모델 & 지표 엔진**: Price/Trade/BacktestResult 모델과 볼린저밴드/이동평균 지표 | Must | M | Sprint 1 |
| 2 | **백테스팅 엔진**: 전략-엔진 분리, 과거 데이터로 전략 실행 | Must | L | Pending |
| 3 | **Bybit API 연동**: 과거 캔들 데이터 fetch | Must | M | Pending |
| 4 | **백테스팅 결과 UI**: 수익률/승률/MDD/거래내역 화면 | Must | L | Pending |
| 5 | **백테스팅 설정 UI**: 기간/심볼/초기자본 설정 및 실행 | Should | M | Pending |

## MVP Scope
Stories 1-4 (Must 항목)

## Out of Scope (v1)
- 실시간 트레이딩
- 다중 전략 동시 비교
- 포트폴리오 관리
- 알림/노티피케이션

---

## Sprint 1: 핵심 모델 & 지표 엔진

### User Story
**As a** 트레이더
**I want** Price, Trade, BacktestResult 모델과 볼린저밴드/이동평균 지표를 사용할 수 있다
**So that** 백테스팅 엔진의 기반이 마련된다

### Acceptance Criteria
1. `Price` (OHLCV + timestamp) 타입 정의
2. `Trade` (매수/매도, 가격, 수량, 타임스탬프, 수익) 타입 정의
3. `BacktestResult` (총 수익률, 승률, MDD, 총 거래 수, 거래 내역) 타입 정의
4. `PricesManager`: 가격 히스토리 관리, 이동평균, 분산, 표준편차 계산
5. `IndicatorMaker`: 볼린저밴드 (upper/lower/bandwidth), MA, 터치 상태 추적
6. 단위 테스트 통과

### Definition of Done
- 모든 타입/클래스 구현 완료
- 단위 테스트 통과
- 코드 리뷰 완료
