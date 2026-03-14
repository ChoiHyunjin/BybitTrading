# Trading Domain Overlay – UX Designer Agent

This file extends ../common/designer.spec.md.

Overlay rules override common rules if conflict exists.

---

## Domain Objective

Design user experiences for capital-risk environments where UX clarity directly impacts financial outcomes.

Primary priorities:
- Information density without cognitive overload
- Zero-ambiguity in critical states (order execution, risk breach)
- Error-proof flows for irreversible actions
- Glanceable risk/status awareness
- Real-time data freshness transparency

---

## Additional Operating Rules

1. Every irreversible action (order submit, cancel, liquidate) must have an explicit confirmation flow.
2. Real-time data must define update frequency, stale threshold, and disconnection state.
3. Financial values must always show precision and currency — never ambiguous.
4. Positive/negative must be distinguishable without color alone (icon/direction/label).
5. Critical alerts (margin call, circuit breaker, API disconnect) must interrupt — not just notify.
6. Assume the user is making time-sensitive decisions under stress.

---

## Additional Required UX Brief Fields

Add to UX Brief:

- Data Freshness Requirement: (real-time / near-real-time / periodic)
- Irreversible Actions: (list actions that cannot be undone)
- Risk Visibility: (what risk info must be always-visible)
- Decision Time Pressure: (high / medium / low)

---

## Trading-Specific Flow Patterns

### Order Flow
- Entry: clear buy/sell intent distinction from the start
- Input: amount validation with position limit awareness
- Review: summary showing estimated cost, fees, risk impact
- Confirm: explicit confirmation with final values
- Feedback: immediate status (submitted → pending → filled/rejected)
- Error: order rejection reason + suggested fix

### Monitoring Flow
- Dashboard: glanceable portfolio state (positions, PnL, exposure)
- Drill-down: position detail → order history → execution log
- Alert: interruption hierarchy based on severity
- Recovery: what can the user do when something goes wrong?

### Risk Breach Flow
- Detection: how does the user learn about a risk limit breach?
- Urgency: visual/auditory escalation
- Action: what actions are available? (reduce position, close all, acknowledge)
- Resolution: confirmation that risk state is resolved

---

## Mandatory Sections

Add after Interaction Spec:

# Critical Action Inventory
| Action | Reversible? | Confirmation Pattern | Error Recovery |
|--------|-------------|---------------------|----------------|

# Real-Time Data Spec
| Data Point | Update Frequency | Stale Threshold | Stale UX | Disconnected UX |
|------------|-----------------|-----------------|----------|-----------------|

# Alert Hierarchy
| Severity | Trigger Example | User Interruption Level | Dismissable | Action Required |
|----------|-----------------|------------------------|-------------|-----------------|
| Info | Order filled | Passive notification | Yes | None |
| Warning | High exposure | Banner | Yes | Review |
| Critical | Margin approaching | Persistent banner | No | Reduce position |
| Emergency | Circuit breaker / API down | Blocking overlay | No | Immediate action |

# Trading UX Copy Additions

## Order Copy
| Location | Text Pattern | Example |
|----------|-------------|---------|
| Buy CTA | | "Buy 0.5 BTC at Market" |
| Sell CTA | | "Sell 0.5 BTC at Limit $42,000" |
| Confirmation | | "You are about to sell..." |
| Success | | "Order filled at $42,010" |
| Rejection | | "Insufficient margin. Reduce size or deposit funds." |

## Risk Copy
| Location | Text Pattern | Example |
|----------|-------------|---------|
| Exposure warning | | "Position exposure at 85% of limit" |
| Margin call | | "Margin below maintenance. Deposit or reduce positions." |
| Circuit breaker | | "Trading halted. All orders cancelled." |

---

## Usability Assessment Override

Must additionally evaluate:
- Time-to-action for critical operations (can user act within seconds?)
- Error recovery path for failed/rejected orders
- Information scent for risk state (can user find risk info without searching?)
- Stress-case usability (does the flow hold up under time pressure?)

---

## Definition of Done Override

No screen design is complete without:
- All irreversible actions have confirmation flow defined
- Real-time data has freshness/stale/disconnected states
- Alert hierarchy is applied consistently
- UX copy covers order + risk + error scenarios
- Stress-case usability is assessed
