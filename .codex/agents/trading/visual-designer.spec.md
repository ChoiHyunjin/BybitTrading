# Trading Domain Overlay – Visual Designer Agent

This file extends ../common/visual-designer.spec.md.

Overlay rules override common rules if conflict exists.

---

## Domain Objective

Produce visual specs for trading interfaces where readability, data density, and urgency signaling directly affect financial outcomes.

Primary priorities:
- Numerical readability at high density
- Instant visual parsing of positive/negative/neutral states
- Clear urgency escalation through visual treatment
- Extended-use ergonomics (traders stare at screens for hours)
- Consistent precision and formatting for all financial values

---

## Additional Operating Rules

1. Financial numbers use tabular-numeric / monospace font variants — digits must align vertically.
2. Positive/negative encoding requires dual-channel: color + secondary signal (icon, direction arrow, background tint).
3. Color palette must pass colorblind simulation (protanopia, deuteranopia, tritanopia).
4. Alert severity must escalate visually: subtle → prominent → dominant → blocking.
5. Dark theme is primary — light theme is secondary. Traders prefer dark backgrounds for extended use.
6. Data tables must define: row height, column alignment (right-align numbers), alternating row treatment, hover/selected row states.
7. Charts must define: axis labels, grid lines, tooltip style, crosshair, empty/loading/error states.

---

## Additional Required Visual Brief Fields

Add to Visual Design Brief:

- Data Density: (compact / standard / comfortable)
- Theme Priority: (dark-first / light-first)
- Numerical Font: (tabular-numeric variant name)
- Update Animation: (flash-on-change behavior for price/PnL)

---

## Trading-Specific Visual Patterns

### Price & PnL Display
| State | Text Color Token | Background Token | Icon | Animation |
|-------|-----------------|-----------------|------|-----------|
| Positive | | | ▲ or + | Flash green (300ms) |
| Negative | | | ▼ or - | Flash red (300ms) |
| Neutral/Unchanged | | | — | None |
| Stale data | | | ⚠ | Fade to muted |

### Order Action Buttons
| Action | Primary Color | Hover | Active | Disabled |
|--------|--------------|-------|--------|----------|
| Buy/Long | | | | |
| Sell/Short | | | | |
| Cancel | | | | |
| Emergency Close | | | | |

Buy and Sell must be visually distinct enough to prevent misclick under stress.

### Alert Banner Visual Escalation
| Severity | Background | Text | Border | Icon | Behavior |
|----------|-----------|------|--------|------|----------|
| Info | Subtle/muted | Default | None | ℹ | Auto-dismiss |
| Warning | Yellow/amber tint | Dark | Left accent | ⚠ | Persistent, dismissable |
| Critical | Red tint | White/light | Full border | 🔴 | Persistent, not dismissable |
| Emergency | Red solid | White | None | ⛔ | Full overlay, blocks interaction |

### Data Table Spec
- Row height: compact (32px) / standard (40px)
- Number alignment: right-aligned, decimal-aligned
- Header: sticky, sortable indicator
- Row states: default, hover, selected, alert-highlight
- Alternating rows: subtle background difference
- Scrolling: virtual scroll for large datasets

---

## Mandatory Sections

Add after Visual State Spec:

# Financial Number Formatting
| Data Type | Precision | Alignment | Font Variant | Example |
|-----------|-----------|-----------|-------------|---------|
| Price | asset-dependent | Right | Tabular-numeric | $42,010.50 |
| PnL ($) | 2 decimal | Right | Tabular-numeric | +$1,234.56 |
| PnL (%) | 2 decimal | Right | Tabular-numeric | +2.45% |
| Quantity | asset-dependent | Right | Tabular-numeric | 0.5000 |
| Percentage | 2 decimal | Right | Tabular-numeric | 85.00% |

# Animation & Transition Spec
| Trigger | Animation | Duration | Easing | Reduced Motion Fallback |
|---------|-----------|----------|--------|------------------------|
| Price change | Background flash | 300ms | ease-out | Instant color change |
| New row | Slide in | 200ms | ease-out | Instant appear |
| Alert appear | Slide down | 250ms | ease-out | Instant appear |
| Order status change | Status badge pulse | 500ms | ease-in-out | Instant change |

# Dark Theme Token Overrides
| Token | Light Value | Dark Value | Notes |
|-------|-----------|-----------|-------|
| background-primary | | | Extended-use comfort |
| text-primary | | | Reduce eye strain |
| positive | | | Readable on dark bg |
| negative | | | Readable on dark bg |
| surface-table-row-alt | | | Subtle alternation |

---

## Accessibility Override

Must additionally ensure:
- Positive/negative passes colorblind simulation for all three types
- Contrast ratio ≥ 4.5:1 in both dark and light themes
- Flash animations respect prefers-reduced-motion
- Data tables are navigable by keyboard with visible focus
- Touch targets ≥ 48x48px for order actions (higher than standard 44px due to financial risk)

---

## Definition of Done Override

No visual spec is complete without:
- Tabular-numeric font verified for number alignment
- Positive/negative dual-channel encoding (color + icon) defined
- All alert severities visually specified
- Dark theme as primary, light theme verified
- Animation spec with reduced-motion fallback
- Colorblind simulation check noted
- Financial number formatting table completed
