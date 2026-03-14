---
name: agile-cycle-trading
description: Use when this Bybit trading project should be delivered in trading-specific story-sized loops with repeated risk-aware feedback.
---

# Trading Agile Development Cycle

Trading 도메인에 특화된 애자일 사이클. User Story 하나 단위로 전체 역할(common + trading overlay)을 빠르게 순환하고, 피드백을 반영하여 반복한다.

## Core Principle

**가장 작은 동작 가능한 조각을 빠르게 완성하고, 피드백을 받고, 반복한다.**
**트레이딩에서는 리스크 검증이 완료되어야 "완성"이다.**

## Cycle

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  Backlog ← 피드백 + 리스크 발견사항 반영           │
│    ↓                                             │
│  Sprint Planning (Story 1개 선택)                 │
│    ↓                                             │
│  Sprint Execution:                               │
│    Trading PO → Trading UX → Trading Visual       │
│    → Trading Architect → Trading Dev              │
│    → Trading Code Review                          │
│    ↓                                             │
│  Demo & Feedback                                  │
│    ↓                                             │
│  Retro + Risk Review                              │
│    ↓                                             │
│  다음 Story로 반복                                 │
└──────────────────────────────────────────────────┘
```

## Process

### Step 0: Backlog 생성 (최초 1회)

Trading PO 역할로 Epic + Stories 분해. 트레이딩 특화 필드 포함.

- Trading Hypothesis, Strategy Type, Asset Universe 정의
- Risk constraints 먼저 정의 (이것이 Story 범위를 제한)
- 각 Story는 1 Sprint에 완료 가능한 크기

**Backlog 형식:**
| # | Story | Priority | Size | Risk Level | Dependency | Status |
|---|-------|----------|------|-----------|-----------|--------|

**Trading Story 분류 가이드:**
| 유형 | 예시 | 우선순위 기준 |
|------|------|-------------|
| 인프라 | 시장 데이터 연결, Decimal 유틸리티 | 다른 Story의 의존성 |
| 핵심 로직 | 주문 제출, 포지션 관리 | 자본 리스크 영향도 |
| 리스크 | Risk Gateway, Circuit Breaker | 반드시 핵심 로직 전 또는 동시 |
| 모니터링 | 대시보드, 알림 | 핵심 로직 이후 |
| 최적화 | 지연시간 개선, 캐싱 | 기본 동작 확인 후 |

**필수 규칙:** 리스크 관련 Story는 해당 기능 Story와 같은 Sprint 또는 이전 Sprint에 배치한다.

### Step 1: Sprint Planning

이번 Sprint Story 선택.

트레이딩 추가 기준:
- 리스크 Story가 기능 Story보다 선행 또는 동시
- 외부 API 의존 Story는 mock/paper 모드 먼저
- 자본 노출 Story는 검증 Story와 함께

**Output:** Sprint Story + Definition of Done (Trading 체크리스트 포함)

### Step 2: Sprint Execution

#### 2-1. Trading PO: Story 확정
- Acceptance Criteria + Trading Acceptance Criteria
- Risk constraints 확인
- 시뮬레이션 vs 라이브 범위 명시

#### 2-2. Trading UX Designer
- 해당 Story 플로우/상태/카피
- 되돌릴 수 없는 액션 → 확인 플로우
- 실시간 데이터 → 갱신 주기/stale 상태
- 알림 계층 (info → warning → critical → emergency)
- 스트레스 상황 사용성 평가

#### 2-3. Trading Visual Designer
- 다크 테마 기준
- 숫자: tabular-numeric, 정밀도, 정렬
- 양/음수: 색상 + 아이콘 이중 인코딩
- 알림 배너 시각적 단계
- 색각이상 시뮬레이션 체크

#### 2-4. Trading Architect
- 해당 Story 범위 기술 설계
- Decimal 타입 정의
- 주문 상태 머신 (해당 범위)
- Risk Gateway 인터페이스 (해당 범위)
- 에러 핸들링 매트릭스

#### 2-5. Trading Developer
- FE: Decimal 포매터, WebSocket 관리, 이중 제출 방지
- BE: persist-before-submit, 멱등성, circuit breaker
- FE/BE가 독립적이면 병렬 실행
- Acceptance Criteria + Trading Criteria 충족 확인

#### 2-6. Trading Code Reviewer
Trading 심각도 적용:
- float for money → **Critical**
- Missing exchange error handling → **Critical**
- Silent error swallowing → **Critical**
- Missing idempotency → **Critical**
- No timeout on external call → **Critical**

추가 체크:
- Financial Safety (decimal, precision, edge values)
- Order Safety (idempotency, persist-before-submit, no double-submit)
- Failure Completeness (every exchange call handled)

- Approve → Step 3
- Request Changes → Step 2-5로 복귀

### Step 3: Demo & Feedback

```
---
## Sprint [N] Demo: [Story Name]

### 완성된 것
[구현된 기능]

### Trading Safety 확인
- [ ] Decimal types (no float)
- [ ] Order safety (해당 시)
- [ ] Error handling complete
- [ ] Observability present

### 확인 요청
1. Acceptance Criteria 충족?
2. 기대와 다른 부분?
3. 새로 발견된 리스크?
4. 우선순위 변경?

### Backlog 업데이트
- 새 Story:
- 새 리스크 Story:
- 우선순위 변경:
---
```

### Step 4: Retrospective + Risk Review

일반 회고 + 트레이딩 리스크 리뷰.

```
---
## Sprint [N] Retro

### What went well
### What to improve

### Risk Review
- 새로 발견된 리스크:
- 기존 리스크 상태 변경:
- 리스크 관련 Backlog 추가:

### Action items for next Sprint
---
```

### Step 5: 다음 Sprint

Backlog 업데이트 후 Step 1로.

| # | Story | Priority | Size | Risk Level | Status |
|---|-------|----------|------|-----------|--------|
| 1 | ... | ... | ... | ... | Done (Sprint 1) |
| 2 | ... | ... | ... | ... | ← Next |

## Trading-Specific Rules

1. **리스크 Story 선행** — 기능 Story를 만들기 전에 해당 리스크 Story가 완료 또는 동시 진행.
2. **시뮬레이션 우선** — 라이브 전에 반드시 backtest/paper trade Story가 선행.
3. **자본 노출 점진적 확대** — 첫 Sprint에서 full 자본 노출 금지. 소액 → 검증 → 확대.
4. **Rollback Story** — 라이브 배포 Story에는 반드시 롤백 계획 포함.
5. **Sprint 중 리스크 발견 시** — 즉시 리스크 Story를 Backlog에 추가하고 다음 Sprint에서 최우선 처리.

## Recommended Sprint Order (예시)

```
Sprint 1: 인프라 (데이터 연결, Decimal 유틸, 기본 타입)
Sprint 2: 핵심 로직 + Risk Gateway (주문 제출 + 리스크 검증)
Sprint 3: 모니터링 (포지션 대시보드, 알림)
Sprint 4: Backtest 검증 (시뮬레이션 + 결과 리포트)
Sprint 5: Paper Trading (모의 실행 + 성과 측정)
Sprint 6: Live (소액) + Observability 강화
```

## How to Start

사용자에게 어떤 트레이딩 기능/전략을 만들 것인지 물어보세요.

1. Step 0 (Backlog 생성)부터 시작합니다.
2. Trading hypothesis, strategy type, risk constraints를 먼저 정의합니다.
3. Stories로 분해하고 리스크 Story 선행 배치를 확인합니다.
4. 우선순위 확인 후 첫 Sprint를 시작합니다.
