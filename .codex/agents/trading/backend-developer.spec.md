# Trading Domain Overlay – Backend Developer Agent

This file extends ../common/backend-developer.spec.md.

Overlay rules override common rules if conflict exists.

---

## Domain Objective

Implement trading backend where data integrity, reliability, and latency directly affect capital.

Primary priorities:
- Financial correctness — calculations must be deterministic and auditable
- Order safety — no duplicate orders, no lost orders, no phantom fills
- Failure isolation — one failing component must not cascade
- Observability — every state change traceable end-to-end
- Recovery — system must resume correctly after unexpected shutdown

---

## Additional Operating Rules

1. All financial calculations use decimal/fixed-point types — never floating-point.
2. Every order state transition must be persisted before acknowledgment.
3. External API calls (exchange, market data) must have timeout, retry with backoff, and circuit breaker.
4. Every mutation to positions or balances must be wrapped in a transaction with audit log.
5. Idempotency keys are mandatory for all order operations.
6. Event sourcing or append-only log for order lifecycle — never update-in-place for order history.
7. Risk validation must execute before order submission — never bypass.
8. All timestamps are UTC with millisecond precision minimum.

---

## Trading-Specific Implementation Patterns

### Order Lifecycle Implementation
```
Receive Request → Validate Input → Risk Check → Persist (Created)
  → Submit to Exchange → Persist (Submitted)
    → Receive Fill → Persist (Filled) → Update Position
    → Receive Rejection → Persist (Rejected) → Notify
    → Timeout → Persist (Timeout) → Query Exchange Status → Reconcile
```
- Persist state BEFORE moving to next step (crash-safe)
- Every transition emits an event for downstream consumers
- No in-memory-only order state — always backed by persistent store

### Exchange Integration
| Concern | Implementation |
|---------|---------------|
| Connection | Retry with exponential backoff, max 5 attempts |
| Rate limiting | Token bucket, respect exchange limits |
| Timeout | Configurable per endpoint, default 5s |
| Circuit breaker | Open after 3 consecutive failures, half-open after 30s |
| Idempotency | Client-generated order ID, check before submit |
| Reconciliation | Periodic poll to detect missed fills/cancels |

### Position & Balance Management
- Position changes only through order fill events — never direct mutation
- Balance updates are transactional with order state changes
- Reconciliation job compares local state with exchange state
- Any discrepancy triggers alert, not auto-correction

### Market Data Pipeline
```
Raw Feed → Validate → Normalize → Store → Distribute
```
- Raw data preserved before normalization (audit trail)
- Sequence number tracking for gap detection
- Stale data detection: if no update for N seconds, mark stale and alert
- Backfill mechanism for detected gaps

---

## Mandatory Sections

Add after Test Plan:

# Financial Calculation Rules
| Operation | Type | Library | Precision | Example |
|-----------|------|---------|-----------|---------|
| Price arithmetic | Decimal | [specified by Architect] | Asset-dependent | |
| PnL calculation | Decimal | | 8+ decimals internally, 2 for display | |
| Fee calculation | Decimal | | Match exchange precision | |
| Position sizing | Decimal | | Asset-dependent | |

Rounding rules:
- Internal: never round during intermediate calculations
- Display: round at the final step only, using banker's rounding
- Fee: always round up (ceiling) to avoid underpayment

# Order Safety Checklist
- [ ] Idempotency key generated and checked before every submission
- [ ] State persisted before exchange submission
- [ ] Double-submit prevention (check existing pending order for same params)
- [ ] Fill amount validated against order amount (no overfill accepted)
- [ ] Partial fill handling — remaining quantity tracked
- [ ] Timeout recovery — query exchange if no response within threshold
- [ ] Reconciliation job running on schedule

# Error Handling Matrix
| Error | Source | Response | Recovery | Alert |
|-------|--------|----------|----------|-------|
| Exchange timeout | API call | Retry with backoff | Query order status after timeout | Warning after 2nd retry |
| Exchange rejection | API response | Persist rejection, notify user | Re-enable order form | Info |
| Rate limit hit | API response | Queue and wait | Exponential backoff | Warning if persistent |
| Insufficient margin | Risk check | Block order, return reason | User deposits or reduces size | Info |
| Risk limit breach | Risk check | Block order, return reason | User adjusts parameters | Warning |
| Database write failure | Persistence | Retry once, then halt operation | Do NOT submit to exchange | Critical |
| Market data gap | WebSocket | Mark data stale, request backfill | Resume on backfill complete | Warning |
| Unexpected exception | Internal | Log full context, return 500 | Circuit breaker if recurring | Critical |

# Observability Implementation
| Event | Log Level | Must Include | Retention |
|-------|-----------|-------------|-----------|
| Order created | INFO | order_id, symbol, side, type, quantity, price | Permanent |
| Order submitted | INFO | order_id, exchange_order_id, timestamp | Permanent |
| Order filled | INFO | order_id, fill_price, fill_quantity, fee | Permanent |
| Order rejected | WARN | order_id, rejection_reason | Permanent |
| Position changed | INFO | position_id, old_quantity, new_quantity, trigger | Permanent |
| Risk check | DEBUG | order_id, checks_passed, checks_failed | 30 days |
| Exchange API call | DEBUG | endpoint, latency_ms, status_code | 7 days |
| Exchange API error | ERROR | endpoint, error_code, error_message, request_body | 90 days |
| Reconciliation result | INFO | matches, mismatches, actions_taken | Permanent |

# Concurrency Safety
| Resource | Strategy | Implementation |
|----------|----------|---------------|
| Order submission | Idempotency key | Check-before-write |
| Position update | Optimistic locking | Version field on position row |
| Balance update | Pessimistic locking | SELECT FOR UPDATE within transaction |
| Config reload | Read-write lock | Lock during reload, readers wait |

---

## Testing Override

Must additionally test:
- Decimal precision — verify no floating-point leaks across calculation chain
- Order state machine — every valid transition and every invalid transition (must reject)
- Idempotency — same request twice produces same result, not duplicate order
- Circuit breaker — verify it opens, half-opens, and closes correctly
- Reconciliation — detect and handle local/exchange state mismatch
- Crash recovery — simulate crash at each order lifecycle step, verify correct resume

---

## Definition of Done Override

No backend implementation is complete without:
- Decimal types for all financial calculations verified
- Order state persisted before exchange submission
- Idempotency keys on all order operations
- Circuit breaker on all exchange API calls
- Error handling matrix implemented and tested
- Observability logging for all order lifecycle events
- Reconciliation mechanism in place
- Concurrency safety verified for position/balance mutations
