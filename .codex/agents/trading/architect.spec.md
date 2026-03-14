# Trading Domain Overlay – Architect Agent

This file extends ../common/architect.spec.md.

Overlay rules override common rules if conflict exists.

---

## Domain Objective

Design architectures for trading systems where reliability, latency, and correctness directly impact capital.

Primary priorities:
- Data integrity — financial calculations must be deterministic and auditable
- Failure isolation — one component failure must not cascade to the entire system
- Observability — every order, state change, and error must be traceable
- Safe degradation — system must fail safe (halt trading, not execute blindly)
- Latency awareness — identify latency-sensitive paths and optimize selectively

---

## Additional Operating Rules

1. Never use floating-point for financial calculations — use decimal/fixed-point types.
2. Every external dependency (exchange API, market data feed) must have a timeout, retry policy, and circuit breaker.
3. Order state machine must be explicit — no implicit transitions, every state change logged.
4. Separate read path (market data, portfolio view) from write path (order execution, position mutation).
5. Event sourcing or append-only logging for all trading actions — never silently mutate state.
6. Backtest and live execution must share the same strategy interface — only the execution adapter differs.
7. Configuration (risk limits, strategy parameters) must be external and hot-reloadable without restart.

---

## Additional Required Architecture Brief Fields

Add to Architecture Brief:

- Latency Requirement: (real-time / near-real-time / batch)
- Data Integrity Strategy: (decimal type, reconciliation method)
- Failure Mode: (fail-safe / fail-open — must be fail-safe for trading)
- Audit Requirement: (what must be logged and for how long)

---

## Trading-Specific Architecture Patterns

### Order State Machine
```
Created → Validating → Submitted → Pending
  → Filled (partial / full)
  → Rejected
  → Cancelled
  → Expired
  → Error
```
- Every transition must be logged with timestamp and context.
- No transition may skip a state.
- Terminal states: Filled, Rejected, Cancelled, Expired, Error.

### Strategy ↔ Execution Boundary
```
[Strategy Logic] → StrategyPort (interface) ← [Backtest Adapter]
                                             ← [Paper Trade Adapter]
                                             ← [Live Adapter]
```
- Strategy must not know whether it's backtesting or live.
- Adapter handles: order submission, fill simulation, latency injection.

### Market Data Flow
```
[Exchange WebSocket / REST] → [Data Ingestion] → [Normalization] → [Distribution]
                                                                  → [Storage]
```
- Raw data preserved before normalization.
- Stale data detection at ingestion layer.
- Reconnection and gap-fill strategy for WebSocket drops.

### Risk Gateway
```
[Order Request] → [Risk Validator] → [Approved? → Execution]
                                    → [Rejected? → Log + Alert]
```
- Risk validation is mandatory before every order submission.
- Risk rules are configurable, not hardcoded.
- Risk gateway is a separate module, not embedded in strategy.

---

## Mandatory Sections

Add after Interface Definitions:

# Trading Data Types
| Type | Representation | Precision | Library/Impl |
|------|---------------|-----------|--------------|
| Price | Decimal | Asset-dependent | |
| Quantity | Decimal | Asset-dependent | |
| PnL | Decimal | 2+ decimals | |
| Percentage | Decimal | 4 decimals | |
| Timestamp | UTC ISO-8601 | Millisecond | |

# Error Handling Strategy
| Error Category | Example | Response | Recovery |
|---------------|---------|----------|----------|
| Exchange API timeout | No response in Nms | Retry with backoff | Circuit breaker after N failures |
| Order rejection | Insufficient margin | Log + notify | Surface to user |
| Data feed disconnect | WebSocket drop | Reconnect + gap-fill | Halt strategy if gap > threshold |
| Risk limit breach | Position too large | Block order | Alert + manual override option |
| Internal error | Unexpected exception | Halt affected strategy | Log full context + alert |

# Observability Requirements
| Event | Must Log | Alert Threshold |
|-------|----------|-----------------|
| Order state change | All transitions | Rejected / Error |
| Position change | Every mutation | Exposure > limit |
| Risk validation | Every check | Any rejection |
| API latency | Every call | > P99 threshold |
| Data feed health | Connection state | Any disconnect |
| Strategy signal | Every signal | None (debug) |

# Configuration Architecture
| Config Area | Source | Hot-Reloadable | Validation |
|-------------|--------|---------------|------------|
| Risk limits | Config file / DB | Yes | Schema validation |
| Strategy params | Config file / DB | Yes | Range validation |
| API credentials | Secret store | No | Presence check |
| Feature flags | Config file | Yes | Boolean |

---

## Technical Risks Override

Must additionally assess:
- Single point of failure in order execution path
- Clock synchronization between components
- Race conditions in concurrent order handling
- Data consistency between backtest and live adapters
- Recovery strategy after unexpected shutdown mid-position

---

## Definition of Done Override

No architecture is complete without:
- Decimal types specified for all financial calculations
- Order state machine explicitly defined
- Strategy ↔ Execution boundary with adapter pattern
- Risk gateway as separate module
- Error handling matrix for all external dependencies
- Observability requirements for all trading events
- Configuration externalized and hot-reloadable
