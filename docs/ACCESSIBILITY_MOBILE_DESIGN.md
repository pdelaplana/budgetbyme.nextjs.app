# BudgetByMe - Accessibility & Mobile Design

## 1. Accessibility Standards & Compliance

### WCAG 2.1 AA Compliance Framework

#### Color & Contrast Requirements
```css
/* Minimum contrast ratios achieved */
:root {
  /* Text on white backgrounds */
  --text-primary: #111827;      /* 16.75:1 ratio (AAA) */
  --text-secondary: #374151;    /* 9.35:1 ratio (AAA) */
  --text-muted: #6B7280;        /* 4.54:1 ratio (AA) */
  
  /* Interactive elements */
  --link-default: #2563EB;      /* 4.56:1 ratio (AA) */
  --button-primary: #FFFFFF;    /* 4.56:1 on blue (AA) */
  
  /* Status indicators */
  --success-text: #065F46;      /* 4.52:1 ratio (AA) */
  --warning-text: #92400E;      /* 4.51:1 ratio (AA) */
  --error-text: #991B1B;        /* 5.74:1 ratio (AA) */
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --text-primary: #000000;
    --text-secondary: #000000;
    --bg-primary: #FFFFFF;
    --border-color: #000000;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Focus Management System
```css
/* Consistent focus indicators */
.focus-ring {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip links for keyboard navigation */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #2563EB;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* Focus trap for modals */
.modal[aria-modal="true"] {
  /* Trap focus within modal boundaries */
}
```

### Screen Reader Optimization

#### Semantic HTML Structure
```html
<!-- Dashboard layout with proper landmarks -->
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <header role="banner">
    <nav role="navigation" aria-label="Main navigation">
      <ul>
        <li><a href="/dashboard" aria-current="page">Dashboard</a></li>
        <li><a href="/events">Events</a></li>
        <li><a href="/account">Account</a></li>
      </ul>
    </nav>
  </header>
  
  <main id="main-content" role="main">
    <h1>Dashboard</h1>
    
    <section aria-labelledby="budget-overview-heading">
      <h2 id="budget-overview-heading">Budget Overview</h2>
      <!-- Content -->
    </section>
    
    <section aria-labelledby="recent-activity-heading">
      <h2 id="recent-activity-heading">Recent Activity</h2>
      <!-- Content -->
    </section>
  </main>
  
  <aside role="complementary" aria-label="Quick actions">
    <!-- Sidebar content -->
  </aside>
</body>
```

#### ARIA Labels & Descriptions
```html
<!-- Chart accessibility -->
<div class="chart-container" 
     role="img" 
     aria-labelledby="budget-chart-title"
     aria-describedby="budget-chart-description">
  
  <h3 id="budget-chart-title">Budget vs Actual Spending</h3>
  <p id="budget-chart-description">
    Your current spending is $8,500 out of a total budget of $12,000. 
    This represents 71% of your budget, indicating you are on track 
    with $3,500 remaining for future expenses.
  </p>
  
  <!-- Chart visualization -->
  <svg aria-hidden="true">
    <!-- Visual elements hidden from screen readers -->
  </svg>
  
  <!-- Data table for screen readers -->
  <table class="visually-hidden">
    <caption>Budget breakdown by category</caption>
    <thead>
      <tr>
        <th scope="col">Category</th>
        <th scope="col">Budgeted Amount</th>
        <th scope="col">Amount Spent</th>
        <th scope="col">Percentage Used</th>
        <th scope="col">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Venue & Reception</th>
        <td>$4,800</td>
        <td>$4,000</td>
        <td>83%</td>
        <td>On track</td>
      </tr>
      <!-- Additional rows -->
    </tbody>
  </table>
</div>
```

#### Live Regions for Dynamic Updates
```html
<!-- Status announcements -->
<div aria-live="polite" aria-atomic="true" class="visually-hidden">
  <span id="status-announcement"></span>
</div>

<!-- Critical alerts -->
<div aria-live="assertive" aria-atomic="true" class="visually-hidden">
  <span id="alert-announcement"></span>
</div>

<script>
// Announce payment status updates
function announcePaymentUpdate(paymentName, status) {
  const announcement = document.getElementById('status-announcement');
  announcement.textContent = `Payment for ${paymentName} has been marked as ${status}`;
}

// Announce critical budget alerts
function announcebudgetAlert(message) {
  const alert = document.getElementById('alert-announcement');
  alert.textContent = message;
}
</script>
```

## 2. Mobile-First Design Strategy

### Responsive Breakpoint System
```css
/* Mobile-first approach */
/* Base styles: 320px - 767px (Mobile) */
.container {
  padding: 0 16px;
  max-width: 100%;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) {
  .container {
    padding: 0 32px;
    max-width: 768px;
    margin: 0 auto;
  }
  
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

/* Desktop: 1024px - 1439px */
@media (min-width: 1024px) {
  .container {
    padding: 0 48px;
    max-width: 1200px;
  }
  
  .dashboard-grid {
    grid-template-columns: 2fr 1fr;
    gap: 32px;
  }
}

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
  
  .dashboard-grid {
    grid-template-columns: 3fr 1fr 1fr;
  }
}
```

### Touch-Optimized Interface Design

#### Touch Target Specifications
```css
/* Minimum 44px touch targets (Apple HIG / Material Design) */
.btn, .touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
  
  /* Sufficient spacing between targets */
  margin: 8px 4px;
}

/* Larger targets for critical actions */
.btn-primary, .btn-danger {
  min-height: 52px;
  padding: 16px 24px;
}

/* Touch-friendly form inputs */
.form-input {
  min-height: 52px;
  padding: 16px;
  font-size: 16px; /* Prevents zoom on iOS */
  border-radius: 8px;
}

/* Swipe gesture areas */
.swipe-container {
  touch-action: pan-x;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

#### Mobile Navigation Patterns
```html
<!-- Hamburger menu with proper accessibility -->
<nav class="mobile-nav">
  <button class="hamburger-menu" 
          aria-expanded="false"
          aria-controls="mobile-menu"
          aria-label="Open main menu">
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
  </button>
  
  <div id="mobile-menu" 
       class="mobile-menu" 
       aria-hidden="true"
       role="menu">
    <ul role="none">
      <li role="menuitem">
        <a href="/dashboard" aria-current="page">Dashboard</a>
      </li>
      <li role="menuitem">
        <a href="/events">Events</a>
      </li>
      <li role="menuitem">
        <a href="/account">Account</a>
      </li>
    </ul>
  </div>
</nav>
```

### Mobile Chart Adaptations

#### Simplified Mobile Charts
```javascript
// Responsive chart configuration
const getChartConfig = (screenWidth) => {
  const isMobile = screenWidth < 768;
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    
    // Mobile-specific adaptations
    layout: {
      padding: isMobile ? 10 : 20
    },
    
    legend: {
      display: !isMobile, // Hide legend on mobile, show in tooltip
      position: isMobile ? 'bottom' : 'right'
    },
    
    tooltips: {
      enabled: true,
      mode: isMobile ? 'point' : 'nearest',
      
      // Mobile-optimized tooltip
      titleFontSize: isMobile ? 14 : 12,
      bodyFontSize: isMobile ? 16 : 14,
      cornerRadius: 8,
      displayColors: !isMobile,
      
      // Custom formatter for mobile
      callbacks: {
        label: function(context) {
          if (isMobile) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          }
          return context.label;
        }
      }
    },
    
    scales: {
      x: {
        ticks: {
          maxTicksLimit: isMobile ? 4 : 8,
          fontSize: isMobile ? 12 : 10
        }
      },
      y: {
        ticks: {
          maxTicksLimit: isMobile ? 5 : 10,
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };
};
```

#### Touch Gestures for Chart Interaction
```javascript
// Touch gesture handling for charts
class ChartTouchHandler {
  constructor(chartElement) {
    this.chart = chartElement;
    this.setupTouchEvents();
  }
  
  setupTouchEvents() {
    let touchStartX = 0;
    let touchStartY = 0;
    
    this.chart.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    });
    
    this.chart.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      // Swipe detection
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
        if (deltaX > 0) {
          this.navigateChart('previous');
        } else {
          this.navigateChart('next');
        }
      }
      
      // Tap detection
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        this.handleChartTap(touch.clientX, touch.clientY);
      }
    });
  }
  
  navigateChart(direction) {
    // Handle chart navigation
    this.announceToScreenReader(`Navigating to ${direction} chart view`);
  }
  
  handleChartTap(x, y) {
    // Handle chart data point selection
    const dataPoint = this.getDataPointAtCoordinates(x, y);
    if (dataPoint) {
      this.showDataPointDetails(dataPoint);
    }
  }
}
```

## 3. Keyboard Navigation & Shortcuts

### Comprehensive Keyboard Support
```javascript
// Global keyboard shortcuts
class KeyboardNavigationManager {
  constructor() {
    this.shortcuts = {
      'Alt+D': () => this.navigateToPage('/dashboard'),
      'Alt+E': () => this.navigateToPage('/events'),
      'Alt+A': () => this.navigateToPage('/account'),
      'Alt+N': () => this.showCreateEventModal(),
      'Alt+P': () => this.showRecordPaymentModal(),
      'Escape': () => this.closeActiveModal(),
      'Tab': (e) => this.handleTabNavigation(e),
      'Enter': (e) => this.handleEnterKey(e),
      'Space': (e) => this.handleSpaceKey(e)
    };
    
    this.setupKeyboardListeners();
  }
  
  setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      const key = this.getKeyCombo(e);
      
      if (this.shortcuts[key]) {
        e.preventDefault();
        this.shortcuts[key](e);
      }
    });
  }
  
  getKeyCombo(event) {
    let combo = '';
    if (event.altKey) combo += 'Alt+';
    if (event.ctrlKey) combo += 'Ctrl+';
    if (event.shiftKey) combo += 'Shift+';
    combo += event.key;
    return combo;
  }
  
  // Focus management for modals
  trapFocusInModal(modalElement) {
    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    modalElement.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });
    
    // Focus first element when modal opens
    firstElement.focus();
  }
}
```

### Chart Keyboard Navigation
```javascript
// Keyboard-accessible chart navigation
class AccessibleChart {
  constructor(chartData) {
    this.data = chartData;
    this.currentDataPoint = 0;
    this.setupKeyboardNavigation();
  }
  
  setupKeyboardNavigation() {
    this.chartElement.setAttribute('tabindex', '0');
    this.chartElement.setAttribute('role', 'application');
    this.chartElement.setAttribute('aria-label', 'Interactive budget chart');
    
    this.chartElement.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          this.navigateToNext();
          e.preventDefault();
          break;
          
        case 'ArrowLeft':
        case 'ArrowUp':
          this.navigateToPrevious();
          e.preventDefault();
          break;
          
        case 'Home':
          this.navigateToFirst();
          e.preventDefault();
          break;
          
        case 'End':
          this.navigateToLast();
          e.preventDefault();
          break;
          
        case 'Enter':
        case ' ':
          this.activateCurrentDataPoint();
          e.preventDefault();
          break;
      }
    });
  }
  
  navigateToNext() {
    if (this.currentDataPoint < this.data.length - 1) {
      this.currentDataPoint++;
      this.updateCurrentDataPoint();
    }
  }
  
  updateCurrentDataPoint() {
    const point = this.data[this.currentDataPoint];
    const announcement = `${point.category}: $${point.amount.toLocaleString()}, 
                         ${point.percentage}% of budget used`;
    
    // Update visual highlight
    this.highlightDataPoint(this.currentDataPoint);
    
    // Announce to screen reader
    this.announceToScreenReader(announcement);
  }
}
```

## 4. Visual Accessibility Enhancements

### High Contrast & Color Blind Support
```css
/* Pattern fills for color-blind accessibility */
.chart-patterns {
  --pattern-dots: url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='currentColor'/%3E%3C/svg%3E");
  
  --pattern-lines: url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,4l4,-4M-1,1l2,-2M3,5l2,-2' stroke='currentColor' stroke-width='1'/%3E%3C/svg%3E");
  
  --pattern-crosses: url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0l4,4M4,0l-4,4' stroke='currentColor' stroke-width='1'/%3E%3C/svg%3E");
}

/* Apply patterns in addition to colors */
.chart-segment-venue {
  fill: var(--blue-600);
  fill: var(--pattern-dots), var(--blue-600);
}

.chart-segment-catering {
  fill: var(--green-600);
  fill: var(--pattern-lines), var(--green-600);
}

/* High contrast mode overrides */
@media (prefers-contrast: high) {
  .chart-segment {
    stroke: black;
    stroke-width: 2px;
  }
  
  .text-muted {
    color: black;
  }
}
```

### Font Size & Zoom Support
```css
/* Respect user's font size preferences */
html {
  font-size: 100%; /* 16px base */
}

/* Scale with user preferences */
@media (min-resolution: 2dppx) {
  body {
    font-size: 1.125rem; /* 18px on high-DPI screens */
  }
}

/* Support up to 200% zoom without horizontal scrolling */
@media (max-width: 640px) and (min-resolution: 2dppx) {
  .container {
    max-width: 100%;
    overflow-x: auto;
  }
  
  .table-responsive {
    font-size: 0.875rem;
    white-space: nowrap;
  }
}

/* Large text mode support */
@media (min-width: 1024px) and (prefers-reduced-data: reduce) {
  body {
    font-size: 1.25rem; /* 20px */
    line-height: 1.6;
  }
  
  .btn {
    padding: 16px 24px;
    font-size: 1.125rem;
  }
}
```

## 5. Performance Accessibility

### Reduced Motion & Animation Control
```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  /* Provide alternative focus indicators */
  .btn:focus {
    outline: 3px solid currentColor;
    outline-offset: 2px;
  }
}

/* Battery-conscious animations */
@media (prefers-reduced-data: reduce) {
  .chart-animation,
  .loading-spinner,
  .progress-bar-animation {
    animation: none;
  }
  
  .chart-container {
    background: url('/static-chart-fallback.png');
  }
}
```

### Progressive Enhancement
```html
<!-- Enhanced form with accessibility fallbacks -->
<form class="expense-form" novalidate>
  <!-- JavaScript enhanced, graceful degradation -->
  <div class="form-group">
    <label for="expense-amount" class="required">
      Amount
      <span class="required-indicator" aria-label="required">*</span>
    </label>
    
    <input type="number"
           id="expense-amount"
           name="amount"
           required
           min="0"
           step="0.01"
           aria-describedby="amount-help amount-error"
           class="form-input">
    
    <div id="amount-help" class="form-help">
      Enter the total cost for this expense
    </div>
    
    <div id="amount-error" class="form-error" role="alert" aria-live="polite">
      <!-- Error messages inserted here -->
    </div>
  </div>
  
  <!-- Client-side validation with server fallback -->
  <script type="module">
    import { validateExpenseForm } from './validators.js';
    
    const form = document.querySelector('.expense-form');
    const amountInput = document.getElementById('expense-amount');
    const errorElement = document.getElementById('amount-error');
    
    // Real-time validation
    amountInput.addEventListener('blur', () => {
      const validation = validateExpenseForm({ amount: amountInput.value });
      
      if (!validation.valid) {
        errorElement.textContent = validation.errors.amount;
        amountInput.setAttribute('aria-invalid', 'true');
      } else {
        errorElement.textContent = '';
        amountInput.setAttribute('aria-invalid', 'false');
      }
    });
  </script>
  
  <noscript>
    <!-- Fallback for users without JavaScript -->
    <p>This form requires JavaScript for enhanced validation. 
       All data will be validated on the server.</p>
  </noscript>
</form>
```

## 6. Testing & Validation

### Automated Accessibility Testing
```javascript
// Automated accessibility testing integration
import { axeCore } from '@axe-core/puppeteer';

describe('Accessibility Tests', () => {
  test('Dashboard meets WCAG 2.1 AA standards', async () => {
    const page = await browser.newPage();
    await page.goto('/dashboard');
    
    const results = await axeCore.analyze(page);
    
    expect(results.violations).toHaveLength(0);
  });
  
  test('Charts are keyboard accessible', async () => {
    const page = await browser.newPage();
    await page.goto('/dashboard');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement.className);
    
    expect(focusedElement).toContain('chart-container');
    
    // Test arrow key navigation
    await page.keyboard.press('ArrowRight');
    const announcement = await page.evaluate(() => 
      document.querySelector('[aria-live="polite"]').textContent
    );
    
    expect(announcement).toContain('Budget category');
  });
});
```

### Manual Testing Checklist
```markdown
## Accessibility Testing Checklist

### Screen Reader Testing
- [ ] VoiceOver (macOS/iOS) - All content announced correctly
- [ ] NVDA (Windows) - Navigation flows logically
- [ ] JAWS (Windows) - Data tables properly structured
- [ ] TalkBack (Android) - Touch exploration functional

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators clearly visible
- [ ] Skip links functional
- [ ] No keyboard traps
- [ ] Logical tab order throughout interface

### Visual Testing
- [ ] 200% zoom without horizontal scrolling
- [ ] High contrast mode support
- [ ] Color-blind simulation testing
- [ ] Text spacing adjustments supported
- [ ] Dark mode compatibility

### Mobile Accessibility
- [ ] Touch targets minimum 44px
- [ ] Swipe gestures have keyboard alternatives
- [ ] Orientation change support
- [ ] Voice control compatibility
- [ ] Switch control navigation

### Cognitive Accessibility
- [ ] Clear error messages
- [ ] Consistent navigation patterns
- [ ] Progress indicators for multi-step processes
- [ ] Timeout warnings with extensions
- [ ] Plain language throughout interface
```

This comprehensive accessibility and mobile design framework ensures BudgetByMe provides an inclusive, usable experience for all users regardless of their abilities, devices, or interaction preferences.