# Charts Documentation

This document explains how the dashboard charts work in the BudgetByMe application, including the Payment Timeline chart functionality.

## Overview

The application uses a tabbed chart interface (`TabbedCharts.tsx`) that displays four different visualizations to help users understand their event budget and spending patterns. All charts are built using **Recharts** library and follow responsive design principles.

## Chart Types

### 1. Budget Health Gauge (`BudgetGaugeChart.tsx`)

**Purpose**: Displays overall budget status as a circular progress gauge.

**Data Structure**:
```typescript
interface BudgetGaugeChartProps {
  totalBudget: number;
  totalSpent: number;
  totalScheduled: number;
  percentage: number;
  status: 'under-budget' | 'on-track' | 'approaching-limit' | 'over-budget';
}
```

**Key Features**:
- SVG-based circular gauge showing budget utilization percentage
- Color-coded status indicators:
  - **Green** (Under Budget): 0-80% of budget used
  - **Mint** (On Track): 80-100% of budget used
  - **Amber** (Approaching Limit): 100-110% of budget used
  - **Red** (Over Budget): 110%+ of budget used
- Summary table showing Total Budget, Total Scheduled, Total Spent, and Remaining amounts
- Accessibility features with ARIA labels and screen reader table
- Responsive design adapting to different screen sizes

### 2. Payment Timeline Chart (`PaymentTimelineChart.tsx`)

**Purpose**: Shows spending patterns over time, comparing budgeted vs actual spending by month.

**Data Structure**:
```typescript
interface TimelineDataPoint {
  date: string;        // Format: "YYYY-MM"
  budgeted: number;    // Budgeted amount for this month
  actual: number;      // Actual spending for this month
}
```

**How It Works**:

1. **Chart Type**: ComposedChart (combines bar and line chart)
   - **Bars**: Show budgeted spending by month (light green bars with opacity)
   - **Line**: Shows actual spending progression (solid green line with dots)

2. **Data Processing**:
   - Takes monthly data points with budgeted vs actual amounts
   - Formats dates using `formatMonth()` helper (e.g., "2024-03" → "Mar")
   - Uses `formatCurrency()` for consistent money formatting

3. **Monthly Budget Calculation** (`BudgetOverview.tsx:13-34`):
   
   **Current Implementation**:
   - Calculates months until event date
   - Divides total event budget evenly across time (minimum 6 months)
   - Shows **cumulative budgeted amounts** (not monthly allocations)
   - Formula: `monthlyBudget = totalBudget / max(monthsUntilEvent, 6)`
   - Each month shows: `budgeted = monthlyBudget × (monthIndex + 1)`
   
   **Example**: 
   - $12,000 budget, 4 months until event
   - Monthly allocation: $12,000 ÷ 6 = $2,000/month
   - Timeline: Jan $2,000, Feb $4,000, Mar $6,000, Apr $8,000
   
   **Current Limitations**:
   - Uses simplified even distribution (doesn't consider actual expense schedules)
   - Doesn't account for vendor payment timing or deposit schedules
   - Ignores seasonal spending patterns or expense priorities
   
   **Future Enhancement Opportunity**:
   The application has payment scheduling infrastructure that could be leveraged to create more realistic monthly budgets based on actual expense payment schedules and due dates.

4. **Visual Elements**:
   - **Budgeted Bars**: Light green (#d1fae5) with green border (#059669)
   - **Actual Line**: Solid green (#10b981) with white-bordered dots
   - **Grid**: Subtle dashed grid lines for easier reading
   - **Hover Effects**: Interactive dots that enlarge on hover

5. **Tooltips**: Custom tooltip showing:
   - Month name
   - Budgeted amount
   - Actual spending amount
   - Visual indicators with matching colors

6. **Legend**: Shows what bars and lines represent
   - Visual squares/lines matching chart colors
   - Clear labels for "Budgeted Spending" and "Actual Spending"

7. **Accessibility Features**:
   - Screen reader table with complete data
   - Proper ARIA labels and descriptions
   - Semantic HTML structure

**Use Cases**:
- Track spending patterns over time
- Compare planned vs actual expenses
- Identify months with higher spending
- Monitor budget adherence across the event planning timeline

### 3. Category Breakdown Chart (`CategoryBreakdownChart.tsx`)

**Purpose**: Shows budget allocation across different expense categories as a pie chart.

**Data Structure**:
```typescript
interface CategoryData {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  percentage: number;
  color: string;
}
```

**Key Features**:
- Interactive pie chart with hover effects
- Category icons (🏛️ for Venue, 📸 for Photography, etc.)
- Detailed legend showing budgeted amounts and percentages
- Summary statistics for total budget and spending
- Mouse interactions with segment highlighting

### 4. Quick Stats Chart (`QuickStatsChart.tsx`)

**Purpose**: Displays key metrics and insights in a dashboard format.

**Data Structure**:
```typescript
interface QuickStatsData {
  totalBudget: number;
  totalSpent: number;
  categories: number;
  paymentsDue: number;
  eventDate: string;
}
```

**Key Features**:
- Grid of key statistics with icons and colors
- Budget progress bar with color-coded status
- Dynamic insights based on budget status and timeline
- Days-to-event calculation with countdown

## Tabbed Interface (`TabbedCharts.tsx`)

The main container component that orchestrates all charts:

**Features**:
- Responsive tab navigation with icons and descriptions
- Mobile-optimized with swipe indicators
- Smooth transitions between charts
- Keyboard navigation support
- Screen size adaptations (different layouts for mobile/tablet/desktop)

**Tab Structure**:
1. **Budget Health** (📊) - Overall budget status
2. **Payment Timeline** (📅) - Spending over time  
3. **Categories** (🥧) - Budget breakdown
4. **Quick Stats** (📈) - Key metrics

## Technical Implementation

### Libraries Used
- **Recharts**: For all chart rendering
- **Heroicons**: For tab navigation icons
- **Tailwind CSS**: For responsive styling and theming

### Key Utilities
- `formatCurrency()` from `@/lib/formatters` - Consistent money formatting
- Responsive design patterns with Tailwind breakpoints
- Accessibility-first approach with ARIA labels and semantic HTML

### Data Flow
1. Parent component gathers chart data from Firebase/APIs
2. Data is passed to `TabbedCharts` component
3. Each chart receives its specific data structure
4. Charts render with real-time interactivity and responsiveness

### Performance Considerations
- Charts use `ResponsiveContainer` for efficient resizing
- Smooth animations and transitions (300ms duration)
- Optimized SVG rendering for gauge chart
- Lazy rendering - only active chart is fully rendered

## Usage Guidelines

### For Developers
1. **Data Preparation**: Ensure data matches expected interfaces
2. **Responsive Design**: Test charts across different screen sizes
3. **Accessibility**: Maintain ARIA labels and screen reader support
4. **Performance**: Monitor chart re-rendering with data updates

### For Users
1. **Navigation**: Use tabs or swipe on mobile to switch between views
2. **Interactivity**: Hover over chart elements for detailed information
3. **Insights**: Check the insights section in Quick Stats for recommendations
4. **Timeline**: Use Payment Timeline to plan future spending patterns

## Future Enhancements

Potential improvements to the chart system:
- Export functionality for chart data
- Date range filtering for Payment Timeline
- Budget forecasting features
- Integration with calendar events
- Real-time data updates
- Additional chart types (funnel, scatter plots)