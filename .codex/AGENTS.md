## Skills
This project uses local Codex skills stored under `.codex/skills/`. These are project-scoped and should be preferred over generic global workflow skills when working on Bybit trading features.

### Available skills
- full-cycle-trading: Full staged trading delivery cycle for this Bybit project, from product definition through trading-specific code review. (file: /Users/tophy/Documents/workspaces/bybittrading/.codex/skills/full-cycle-trading/SKILL.md)
- agile-cycle-trading: Trading story-by-story agile cycle with risk review and feedback loops for this Bybit project. (file: /Users/tophy/Documents/workspaces/bybittrading/.codex/skills/agile-cycle-trading/SKILL.md)
- role-trading-po: Trading product owner role focused on trading hypothesis, risk limits, validation plan, and scope decisions. (file: /Users/tophy/Documents/workspaces/bybittrading/.codex/skills/role-trading-po/SKILL.md)
- role-trading-ux-designer: Trading UX role for order, monitoring, alert, and risk-breach flows. (file: /Users/tophy/Documents/workspaces/bybittrading/.codex/skills/role-trading-ux-designer/SKILL.md)
- role-trading-visual-designer: Trading visual design role for dark theme, numeric readability, and alert severity. (file: /Users/tophy/Documents/workspaces/bybittrading/.codex/skills/role-trading-visual-designer/SKILL.md)
- role-trading-architect: Trading architecture role for order state, risk gateway, execution boundaries, and reliability constraints. (file: /Users/tophy/Documents/workspaces/bybittrading/.codex/skills/role-trading-architect/SKILL.md)
- role-trading-frontend-developer: Trading frontend role for numeric formatting, stale-state handling, and order-action safety. (file: /Users/tophy/Documents/workspaces/bybittrading/.codex/skills/role-trading-frontend-developer/SKILL.md)
- role-trading-backend-developer: Trading backend role for decimal calculations, idempotency, persist-before-submit, and exchange safety. (file: /Users/tophy/Documents/workspaces/bybittrading/.codex/skills/role-trading-backend-developer/SKILL.md)
- role-trading-code-reviewer: Trading code review role with float-for-money as critical and strong checks for order safety and failure handling. (file: /Users/tophy/Documents/workspaces/bybittrading/.codex/skills/role-trading-code-reviewer/SKILL.md)

### Project context
- This is a Bybit-based iOS trading project built with UIKit.
- Core trading logic lives primarily in `CoinTrader/Trader.swift`, API access in `CoinTrader/api/`, and presentation in `CoinTrader/ViewController.swift`.
- Treat floating-point handling for money and silent exchange/API failures as high-severity issues in this project.
- Prefer the local `*trading*` skills in this project over generic global `full-cycle` or `agile-cycle` skills.

### How to use skills
- Use a local trading skill whenever the user asks for trading workflow, trading architecture, trading implementation, or trading-specific review.
- Open only the relevant `SKILL.md` first, then load the referenced `../../agents/common/*.spec.md` and `../../agents/trading/*.spec.md` files only when needed.
- Keep the project local skills self-contained; do not depend on the sibling `ai_skills` repo after setup.
