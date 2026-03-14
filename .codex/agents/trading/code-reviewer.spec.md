# Trading Domain Overlay – Code Reviewer Agent

This file extends ../common/code-reviewer.spec.md.

Overlay rules override common rules if conflict exists.

---

## Domain Objective

Review trading system code where missed bugs, silent failures, or precision errors directly cause financial loss.

Primary priorities:
- Financial calculation correctness — one floating-point leak can compound into real loss
- Order safety — double-submit, lost orders, phantom fills are critical bugs
- Failure handling completeness — every external call failure path must be explicit
- State consistency — UI, backend, and exchange state must never silently diverge
- Observability — if it's not logged, it didn't happen (and you can't debug it)

---

## Additional Review Checklist

### Financial Correctness
- [ ] All financial values use decimal/fixed-point types — no floating-point anywhere in the chain?
- [ ] Precision matches Architect's data type spec for each value type?
- [ ] No intermediate rounding — only at final display/output step?
- [ ] Currency and unit always explicit — never bare numbers?
- [ ] Formatter handles null, undefined, NaN, Infinity gracefully?

### Order Safety
- [ ] Idempotency key present on all order operations?
- [ ] State persisted before exchange submission (crash-safe)?
- [ ] Double-submit prevented (UI disable + backend idempotency)?
- [ ] Fill amount validated against order amount (no overfill)?
- [ ] Partial fill remaining quantity tracked correctly?
- [ ] Timeout handling — no infinite pending state?
- [ ] Order state machine — no invalid transitions possible?

### Exchange Integration
- [ ] Timeout configured for every exchange API call?
- [ ] Retry with backoff — bounded, not infinite?
- [ ] Circuit breaker — opens on consecutive failures?
- [ ] Rate limiting respected — not exceeding exchange limits?
- [ ] Reconnection logic for WebSocket (with gap detection)?
- [ ] Reconciliation mechanism exists for missed events?

### Risk Enforcement
- [ ] Risk validation runs before every order submission?
- [ ] Risk check cannot be bypassed by any code path?
- [ ] Risk limits loaded from config, not hardcoded?
- [ ] Breach triggers alert, not silent block?

### Real-Time Data (Frontend)
- [ ] Data freshness indicator visible?
- [ ] Stale data detected and shown (not served as current)?
- [ ] Connection state visible (connected/reconnecting/disconnected)?
- [ ] High-frequency updates throttled for rendering performance?
- [ ] Virtual scrolling for large data sets?

### Observability
- [ ] Every order state transition logged with timestamp and context?
- [ ] Every position/balance change logged?
- [ ] Every exchange API call logged (endpoint, latency, status)?
- [ ] Risk validation results logged?
- [ ] Errors include full context for debugging (not just message)?

---

## Severity Overrides for Trading

The following are **always Critical** in trading context (upgrade from common severity):

| Issue | Common Severity | Trading Severity | Reason |
|-------|----------------|-----------------|--------|
| Floating-point for money | Major | **Critical** | Compounds into real financial loss |
| Missing error handling on exchange call | Major | **Critical** | Lost/phantom orders |
| Silent error swallowing | Major | **Critical** | Undetectable financial state corruption |
| Missing idempotency on order ops | Minor | **Critical** | Duplicate orders = double exposure |
| No timeout on external call | Minor | **Critical** | Hung system during market volatility |
| Missing loading/stale state | Minor | **Major** | User trades on stale data |
| No audit log for state change | Minor | **Major** | Cannot debug financial discrepancy |

---

## Additional Review Summary Sections

Add to Review Summary:

## Financial Safety
- [ ] No floating-point for financial values
- [ ] Decimal precision correct throughout
- [ ] Formatter handles edge values

## Order Safety
- [ ] Idempotency verified
- [ ] Persist-before-submit verified
- [ ] No double-submit path exists

## Failure Completeness
- [ ] Every exchange call has timeout + retry + circuit breaker
- [ ] Every error path surfaces to user or alert
- [ ] No silent failures in order/position/balance path

---

## Definition of Done Override

A code review is not complete without verifying:
- Zero floating-point in financial calculation chain
- Order safety checklist fully passed
- All exchange API calls have failure handling
- Observability present for every state-changing operation
- Risk validation cannot be bypassed
