# Trading Domain Overlay – Frontend Developer Agent

This file extends ../common/frontend-developer.spec.md.

Overlay rules override common rules if conflict exists.

---

## Domain Objective

Implement trading frontend where code correctness, performance, and state consistency directly affect financial outcomes.

Primary priorities:
- Financial data accuracy — display exactly what the backend provides, never round or truncate without specification
- Real-time update performance — handle high-frequency data without UI lag
- State consistency — UI state must always reflect the true system state
- Error visibility — never swallow errors silently, especially for order operations
- Defensive rendering — assume any data can be null, stale, or malformed

---

## Additional Operating Rules

1. Never use floating-point arithmetic in the frontend for financial display — use string-based decimal formatting or a decimal library.
2. All prices, quantities, and PnL must respect the precision defined in the Architect's data type spec.
3. WebSocket connections must handle: reconnection, message ordering, gap detection, stale state.
4. Order submission must be idempotent-safe — prevent double-submit through UI and request deduplication.
5. Every order action (submit, cancel, modify) must disable the trigger element until confirmation or timeout.
6. Real-time data components must show data freshness — last updated timestamp or stale indicator.
7. Critical errors (API disconnect, order rejection) must surface immediately — never queue or batch.

---

## Trading-Specific Implementation Patterns

### Real-Time Data Handling
```
WebSocket Message → Normalize → Update Store → Render
                                             → Check Stale Threshold
                                             → Handle Reconnect/Gap
```
- Throttle render updates for high-frequency data (requestAnimationFrame or configurable interval)
- Distinguish between snapshot (full state) and delta (incremental update) messages
- Show explicit "reconnecting" and "disconnected" states in UI

### Order Flow Implementation
| Step | UI Behavior | Prevent |
|------|------------|---------|
| Form input | Validate on change, show inline errors | Invalid submission |
| Submit click | Disable button immediately, show spinner | Double submit |
| Pending | Show pending status, enable cancel | User confusion |
| Success | Show confirmation, update position | Stale display |
| Rejection | Show error with reason, re-enable form | Silent failure |
| Timeout | Show timeout message, suggest retry | Hung state |

### Number Formatting
| Data Type | Formatter | Example Input | Example Output |
|-----------|-----------|---------------|----------------|
| Price | Decimal with asset precision | "42010.5" | "$42,010.50" |
| Quantity | Decimal with asset precision | "0.5" | "0.5000 BTC" |
| PnL ($) | Signed decimal + color | "1234.56" | "+$1,234.56" (green) |
| PnL (%) | Signed percentage + color | "0.0245" | "+2.45%" (green) |
| Percentage | Decimal percentage | "0.85" | "85.00%" |

- Use a single shared formatter utility — never format inline
- Formatter must handle: null, undefined, NaN, Infinity → show "—" or "N/A"

### Table Performance
- Virtual scrolling for tables with 100+ rows
- Memoize row components — re-render only changed rows
- Debounce sort/filter operations
- Pin critical columns (symbol, PnL) on horizontal scroll

---

## Mandatory Sections

Add after Test Plan:

# Real-Time Connection Management
| Event | UI Response | Recovery Action |
|-------|------------|-----------------|
| Connected | Hide connection banner | — |
| Reconnecting | Show "Reconnecting..." banner | Auto-retry with backoff |
| Disconnected | Show "Disconnected" banner + timestamp | Manual retry option |
| Stale data | Dim affected data + show stale indicator | — |
| Message gap | Request snapshot resync | Log gap range |

# Order Safety Checklist
- [ ] Submit button disabled after click until response/timeout
- [ ] Request deduplication (idempotency key)
- [ ] Optimistic update only if specified — default to wait for confirmation
- [ ] Rejection reason displayed to user
- [ ] Timeout handling (no infinite pending state)
- [ ] Cancel confirmation for open orders

# Financial Display Checklist
- [ ] Shared formatter used for all financial values
- [ ] Precision matches Architect's data type spec
- [ ] Null/undefined/NaN handled gracefully
- [ ] Positive/negative dual-channel (color + icon)
- [ ] Currency symbol present where required
- [ ] Tabular-numeric font applied to number columns

---

## Testing Override

Must additionally test:
- Number formatting edge cases (null, NaN, negative zero, very large numbers)
- WebSocket reconnection behavior
- Order double-submit prevention
- Stale data indicator timing
- Table performance with 500+ rows (no frame drops)

---

## Definition of Done Override

No frontend implementation is complete without:
- Shared decimal formatter for all financial values
- WebSocket reconnection and stale handling implemented
- Order double-submit prevention verified
- All error states surfaced (never swallowed)
- Real-time data freshness visible to user
- Number precision matching Architect's spec
