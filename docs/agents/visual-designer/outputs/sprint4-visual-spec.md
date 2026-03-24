# Sprint 4: Visual Spec - 백테스팅 결과 UI

## Design Tokens

### Colors
```
background:    #0D1117  (dark background)
surface:       #161B22  (card background)
surfaceLight:  #21262D  (input background)
textPrimary:   #F0F6FC
textSecondary: #8B949E
profit:        #3FB950  (green - 수익)
loss:          #F85149  (red - 손실)
accent:        #58A6FF  (blue - 버튼, 강조)
border:        #30363D
```

### Typography
```
heading:      18px, bold
bodyLarge:    16px, regular
body:         14px, regular
caption:      12px, regular
number:       16px, monospace (tabular-nums)
numberLarge:  24px, bold, monospace
```

### Spacing
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
```

### Border Radius
```
card: 12px
button: 8px
input: 8px
```

## Component Specs

### ResultCard (2x2 grid)
- Background: surface
- Padding: lg
- Border radius: card
- Label: caption, textSecondary
- Value: numberLarge
  - 수익률 양수: profit color
  - 수익률 음수: loss color
  - 승률/거래수: textPrimary

### TradeItem (리스트 행)
- Padding: md vertical, lg horizontal
- Border bottom: 1px border color
- Left: action badge (BUY=accent, SELL=profit/loss)
- Center: 가격 (number), 수량 (caption)
- Right: PnL (profit/loss color, SELL만)

### RunButton
- Background: accent
- Text: white, bodyLarge, bold
- Height: 48px
- Full width
- Disabled state: opacity 0.5
- Loading state: ActivityIndicator

## Dark Theme Only
트레이딩 앱 특성상 다크 테마만 지원.
