# BudgetByMe - Dashboard & Charts Design

## 1. Chart Design Philosophy

### Core Principles
- **Clarity over complexity**: Simple, immediately understandable visualizations
- **Actionable insights**: Charts that drive user decisions and actions
- **Trust through transparency**: No hidden data, clear methodologies
- **Accessibility first**: Color-blind friendly, screen reader compatible
- **Progressive disclosure**: Summary views with drill-down capabilities

### Visual Hierarchy
1. **Critical alerts** (red) - Overdue payments, budget overruns
2. **Important metrics** (blue/amber) - Due soon, approaching limits
3. **Positive progress** (green) - On track, completed payments
4. **Contextual information** (gray) - Historical data, reference lines

## 2. Primary Dashboard Charts

### Budget vs Actual Gauge Chart
```
Purpose: Immediate visual status of overall budget health
Type: Semi-circular gauge with color-coded zones

Design Specifications:
┌─────────────────────────────────┐
│        Budget Health            │
│                                 │
│         ╭─────────╮             │
│       ╱     71%    ╲            │
│      ╱   ON TRACK   ╲           │
│     │                │          │
│      ╲              ╱           │
│       ╲____________╱            │
│                                 │
│     $8,500 of $12,000          │
│     $3,500 remaining           │
│                                 │
│ ┌─┐ Under Budget (0-80%)        │
│ ├─┤ On Track (80-100%)          │
│ └─┘ Over Budget (100%+)         │
└─────────────────────────────────┘

Color Zones:
- 0-80%: Green (#059669) - Under budget, doing well
- 80-100%: Blue (#2563EB) - On track, normal progress  
- 100-110%: Amber (#D97706) - Approaching limit, caution
- 110%+: Red (#DC2626) - Over budget, needs attention

Interactive Features:
- Hover: Show exact percentages and amounts
- Click: Navigate to detailed budget breakdown
- Mobile: Tap for breakdown modal
```

### Payment Forecast Line Chart
```
Purpose: Show upcoming payment obligations over time
Type: Multi-line chart with area fills

Design Layout:
┌─────────────────────────────────────────────────────┐
│              Payment Timeline                       │
│                                                     │
│ $4K ┐                                              │
│     │    ●●●                                       │
│ $3K ┤      ●●●                                     │
│     │        ●●●                                   │
│ $2K ┤          ●●●                                 │
│     │            ●●●                               │
│ $1K ┤              ●●●                             │
│     │                ●●●                           │
│  $0 └────────────────────────────────────────────  │
│     Mar  Apr  May  Jun  Jul  Aug                   │
│                                                     │
│ ● Scheduled Payments                                │
│ ● Actual Payments                                   │
│ ─ Payment Deadlines                                 │
└─────────────────────────────────────────────────────┘

Features:
- Scheduled vs actual payment tracking
- Critical payment deadlines marked
- Area fill shows cumulative spend
- Tooltip shows payment details
- Zoom/pan for longer timelines
```

### Category Breakdown Pie Chart
```
Purpose: Visual distribution of budget across categories
Type: Donut chart with category legends

Layout Design:
┌─────────────────────────────────┐
│        Expenses by Category     │
│                                 │
│           ╭─────────╮           │
│         ╱     40%    ╲          │
│        ╱   $4,800     ╲         │
│       │                │        │
│        ╲              ╱         │
│         ╲____________╱          │
│                                 │
│ 🏛️ Venue (40%) - $4,800        │
│ 🍰 Catering (30%) - $3,600     │
│ 📸 Photography (10%) - $1,200  │
│ 👗 Attire (8%) - $960          │
│ 💐 Flowers (7%) - $840         │
│ 🎵 Music (5%) - $600           │
└─────────────────────────────────┘

Color System:
- Venue: Blue (#2563EB)
- Catering: Green (#059669)  
- Photography: Purple (#7C3AED)
- Attire: Pink (#EC4899)
- Flowers: Emerald (#10B981)
- Music: Orange (#EA580C)

Interactive Elements:
- Hover: Highlight segment, show exact amounts
- Click: Navigate to category details
- Legend toggle: Show/hide categories
- Mobile: Touch to select, double-tap for details
```

## 3. Secondary Dashboard Elements

### Category Progress Bars
```
Vertical List with Horizontal Progress Bars:

┌─────────────────────────────────────────────────┐
│ 🏛️ Venue & Reception          $4,000 / $4,800   │
│    ████████████████████░░░░ 83%                 │
│                                                 │
│ 🍰 Catering & Beverages       $2,800 / $3,600   │
│    ████████████████████░░░░ 78%                 │
│                                                 │
│ 📸 Photography & Video        $900 / $1,200     │
│    ███████████████████░░░░░ 75%                 │
│                                                 │
│ 💐 Flowers & Decorations      $200 / $600       │
│    ██████░░░░░░░░░░░░░░░░░░ 33%                 │
└─────────────────────────────────────────────────┘

Color Logic:
- Green: 0-80% (under budget)
- Blue: 80-95% (on track)  
- Amber: 95-100% (approaching limit)
- Red: 100%+ (over budget)

Visual Enhancements:
- Animated progress on load
- Hover effects show exact amounts
- Click expands to show expense breakdown
```

### Upcoming Payments Widget
```
┌─────────────────────────────────┐
│        Due Soon (5)             │
│                                 │
│ 🏛️ Venue Balance      $2,500    │
│    Due: March 15 (3 days)       │
│    [Mark Paid] [Postpone]       │
│                                 │
│ 🍰 Catering Deposit   $1,800    │
│    Due: March 20 (8 days)       │
│    [Mark Paid] [Postpone]       │
│                                 │
│ 📸 Photo Session      $500      │
│    Due: March 25 (13 days)      │
│    [Mark Paid] [Postpone]       │
│                                 │
│ ⚠️ 2 payments overdue           │
│    [View Overdue]               │
└─────────────────────────────────┘

Priority Indicators:
- Red: Overdue (immediate attention)
- Amber: Due within 7 days
- Blue: Due within 30 days
- Gray: Due later than 30 days
```

## 4. Advanced Analytics Views

### Cash Flow Projection
```
Purpose: Show expected vs actual spending over time
Type: Combination line and bar chart

┌─────────────────────────────────────────────────────┐
│                Cash Flow Analysis                   │
│                                                     │
│ $5K ┐ ████                                         │
│     │ ████ ──●                                      │
│ $4K ┤ ████   ●──●                                   │
│     │        ●    ●──●                             │
│ $3K ┤            ●    ●──●                         │
│     │                ●    ●──●                     │
│ $2K ┤                    ●    ●                    │
│     │                            ●                 │
│ $1K ┤                                              │
│     │                                              │
│  $0 └──────────────────────────────────────────────│
│     Jan Feb Mar Apr May Jun Jul Aug Sep Oct        │
│                                                     │
│ ████ Budgeted Spending                             │
│ ●──● Actual Spending                               │
│ ╱╱╱╱ Projected Based on Trends                     │
└─────────────────────────────────────────────────────┘

Features:
- Variance analysis between planned and actual
- Trend-based projections for remaining periods
- Seasonal adjustment capabilities
- Export to financial planning tools
```

### Vendor Comparison Matrix
```
Purpose: Compare costs and timeline across vendors
Type: Bubble chart or scatter plot

┌─────────────────────────────────────────────────────┐
│              Vendor Analysis                        │
│                                                     │
│Cost │                                               │
│$5K  │    ●Photography A                             │
│     │                                               │
│$4K  │         ●Venue B                              │
│     │                                               │
│$3K  │              ●Catering C   ●Photography B     │
│     │                                               │
│$2K  │                     ●Venue A                  │
│     │                                               │
│$1K  │                              ●Flowers A       │
│     └─────────────────────────────────────────────  │
│     1wk    2wk    1mo    2mo    3mo                 │
│                    Lead Time                        │
│                                                     │
│ Bubble size = Service quality rating                │
│ Color = Category type                               │
└─────────────────────────────────────────────────────┘
```

## 5. Mobile Chart Adaptations

### Responsive Chart Behavior
```
Desktop → Mobile Transformations:

Gauge Chart:
┌─────────────────┐    ┌───────────────┐
│   ╭─────────╮   │ => │      71%      │
│ ╱     71%    ╲  │    │   ON TRACK    │
││   ON TRACK   │ │    │ $8,500 spent  │
│ ╲____________╱  │    │ $3,500 left   │
│ $8,500/$12,000  │    └───────────────┘
└─────────────────┘

Line Chart:
┌─────────────────┐    ┌───────────────┐
│ Complex timeline│ => │ Simplified    │
│ with multiple   │    │ key points    │
│ data series     │    │ tap to expand │
└─────────────────┘    └───────────────┘

Pie Chart:
┌─────────────────┐    ┌───────────────┐
│ Full pie with   │ => │ Top 3 slices  │
│ all categories  │    │ + "Other"     │
│                 │    │ tap for full  │
└─────────────────┘    └───────────────┘
```

### Touch Interactions
- **Single tap**: Select data point, show tooltip
- **Double tap**: Drill down to details
- **Long press**: Context menu with actions
- **Pinch zoom**: Scale timeline charts
- **Swipe**: Navigate between chart views

## 6. Data Visualization Best Practices

### Color Accessibility
```css
/* Primary palette with accessibility considerations */
:root {
  /* High contrast ratios (4.5:1 minimum) */
  --success-green: #059669;    /* WCAG AA compliant */
  --warning-amber: #D97706;    /* WCAG AA compliant */
  --danger-red: #DC2626;       /* WCAG AA compliant */
  --primary-blue: #2563EB;     /* WCAG AA compliant */
  
  /* Pattern fills for color-blind users */
  --pattern-dots: url('#dots-pattern');
  --pattern-lines: url('#lines-pattern');
  --pattern-crosses: url('#cross-pattern');
}

/* SVG patterns for accessibility */
<defs>
  <pattern id="dots-pattern" patternUnits="userSpaceOnUse" width="4" height="4">
    <circle cx="2" cy="2" r="1" fill="currentColor"/>
  </pattern>
</defs>
```

### Screen Reader Support
```html
<!-- Chart accessibility structure -->
<div role="img" aria-labelledby="chart-title" aria-describedby="chart-desc">
  <h3 id="chart-title">Budget vs Actual Progress</h3>
  <p id="chart-desc">
    You have spent $8,500 of your $12,000 budget, which is 71% of your total. 
    You are currently on track with $3,500 remaining.
  </p>
  
  <!-- Visual chart content -->
  <svg><!-- Chart visualization --></svg>
  
  <!-- Data table fallback -->
  <table class="sr-only">
    <caption>Budget breakdown by category</caption>
    <thead>
      <tr>
        <th>Category</th>
        <th>Budgeted</th>
        <th>Spent</th>
        <th>Percentage</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Venue & Reception</td>
        <td>$4,800</td>
        <td>$4,000</td>
        <td>83%</td>
      </tr>
      <!-- Additional rows -->
    </tbody>
  </table>
</div>
```

## 7. Chart Animation & Transitions

### Loading States
```css
/* Skeleton loading for charts */
.chart-skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Chart entry animations */
.gauge-enter {
  animation: gaugeGrow 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes gaugeGrow {
  from { 
    transform: scale(0.8);
    opacity: 0;
  }
  to { 
    transform: scale(1);
    opacity: 1;
  }
}
```

### Data Update Transitions
```javascript
// Smooth value changes
const animateValue = (element, start, end, duration) => {
  const range = end - start;
  let current = start;
  const increment = range / (duration / 16);
  
  const timer = setInterval(() => {
    current += increment;
    element.textContent = Math.round(current);
    
    if ((increment > 0 && current >= end) || 
        (increment < 0 && current <= end)) {
      current = end;
      element.textContent = current;
      clearInterval(timer);
    }
  }, 16);
};
```

## 8. Export & Sharing Features

### Chart Export Options
```
┌─────────────────────────────────┐
│         Export Options          │
│                                 │
│ Format:                         │
│ ● PNG (High Quality)            │
│ ○ PDF (Print Ready)             │
│ ○ SVG (Scalable)                │
│ ○ Excel Data                    │
│                                 │
│ Size:                           │
│ ● Standard (800x600)            │
│ ○ Large (1200x900)              │
│ ○ Custom (W x H)                │
│                                 │
│ Include:                        │
│ ☑ Chart Title                   │
│ ☑ Data Labels                   │
│ ☑ Legend                        │
│ ☑ Date Range                    │
│                                 │
│ [Cancel] [Export]               │
└─────────────────────────────────┘
```

### Sharing Features
- **Email reports**: Automated weekly/monthly summaries
- **Print optimization**: Black & white friendly versions
- **Social sharing**: Achievement milestones (optional)
- **Collaborative viewing**: Share-only links for partners

This comprehensive chart design system ensures that financial data is presented clearly, accessibly, and actionably across all devices and user contexts, helping users make informed decisions about their event budgets.