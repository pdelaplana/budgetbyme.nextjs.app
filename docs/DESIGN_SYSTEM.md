# BudgetByMe - UI/UX Design System

## 1. Design Philosophy

BudgetByMe embraces a **trust-first, clarity-focused** design approach that combines:
- **Financial confidence**: Professional, trustworthy aesthetics that instill user confidence
- **Celebratory optimism**: Warm, approachable elements that acknowledge life's special moments
- **Simplicity first**: Clean interfaces that reduce cognitive load during financial planning
- **Progressive disclosure**: Information architecture that reveals complexity gradually

## 2. Logo & Brand Identity

### Logo Design
The BudgetByMe logo consists of a circular emblem with the letter "B" and progress indicators, accompanied by the brand name:

#### Logo Components
- **Circle Background**: Primary mint green (`#059669`)
- **Letter "B"**: White (`#F0FDF4`) with professional serif-like curves
- **Progress Bars**: Three horizontal bars of varying lengths representing budget progress
- **Typography**: "Budget" in Inter Extra Bold (800), "By Me" in Inter Medium (500)

#### Logo Variants
```typescript
// Logo Component Usage
<Logo variant="full" size="lg" />     // Complete logo with text
<Logo variant="icon-only" size="md" /> // Just the circular emblem
```

#### Size Specifications
- **Small (sm)**: 32px height, suitable for favicons and compact spaces
- **Medium (md)**: 48px height, ideal for sidebar and navigation
- **Large (lg)**: 80px height, perfect for headers and authentication pages

#### Typography Specifications
- **"Budget" text**: Inter font family, 800 weight, tight letter spacing (-0.025em)
- **"By Me" text**: Inter font family, 500 weight, loose letter spacing (0.025em)
- **Color hierarchy**: Dark gray (#1F2937) for "Budget", medium gray (#6B7280) for "By Me"

#### Usage Guidelines
- Maintain clear space around the logo equal to the height of the letter "B"
- Never stretch or distort the logo proportions
- Use on light backgrounds only
- Minimum size: 24px height for digital applications

## 3. Color System

### Primary Color Palette
- **Primary Mint Green**: `#059669` (Tailwind emerald-600)
  - Trust, growth, financial success, brand identity
  - Used for: Primary CTAs, logo, navigation, key data points
- **Success Green**: `#059669` (Same as primary)
  - Achievement, on-budget status, positive indicators
- **Warning Amber**: `#D97706` (Tailwind amber-600)
  - Caution, approaching limits, attention needed
- **Error Red**: `#DC2626` (Tailwind red-600)
  - Over-budget, overdue, critical alerts

### Secondary Colors
- **Celebration Purple**: `#7C3AED` (Tailwind violet-600)
  - Special events, achievements, milestones
- **Neutral Gray Scale**:
  - `#111827` (gray-900) - Primary text
  - `#374151` (gray-700) - Secondary text
  - `#6B7280` (gray-500) - Muted text, placeholders
  - `#E5E7EB` (gray-200) - Borders, dividers
  - `#F9FAFB` (gray-50) - Background surfaces

### Background System
- **Primary Background**: `#FFFFFF` (White)
- **Secondary Background**: `#F8FAFC` (slate-50)
- **Card Backgrounds**: `#FFFFFF` with subtle shadows
- **Dashboard Background**: `#F1F5F9` (slate-100)

## 3. Typography System

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### Type Scale
- **Display Large**: 3.75rem (60px) - Hero headers, major milestones
- **Display Medium**: 3rem (48px) - Page headers, event titles
- **Heading XL**: 2.25rem (36px) - Section headers
- **Heading Large**: 1.875rem (30px) - Card headers, important metrics
- **Heading Medium**: 1.5rem (24px) - Subsection headers
- **Heading Small**: 1.25rem (20px) - Small headers, labels
- **Body Large**: 1.125rem (18px) - Important body text
- **Body Medium**: 1rem (16px) - Default body text
- **Body Small**: 0.875rem (14px) - Secondary text, captions
- **Caption**: 0.75rem (12px) - Micro text, timestamps

### Font Weights
- **Light**: 300 - Subtle information, large numbers
- **Regular**: 400 - Body text, descriptions
- **Medium**: 500 - Emphasized text, navigation
- **Semibold**: 600 - Headings, important labels
- **Bold**: 700 - Strong emphasis, key metrics

## 4. Spacing & Layout System

### Grid System
- **Mobile**: 4-column grid with 16px gutters
- **Tablet**: 8-column grid with 24px gutters  
- **Desktop**: 12-column grid with 32px gutters

### Spacing Scale (Tailwind-based)
- **xs**: 4px - Fine details, small gaps
- **sm**: 8px - Component internal spacing
- **md**: 16px - Standard component spacing
- **lg**: 24px - Section spacing
- **xl**: 32px - Major section breaks
- **2xl**: 48px - Page section breaks
- **3xl**: 64px - Hero spacing, major breaks

### Container Sizes
- **Mobile**: Full width with 16px side padding
- **Tablet**: Max 768px with 32px side padding
- **Desktop**: Max 1200px with 48px side padding
- **Wide**: Max 1400px for dashboard layouts

## 5. Component Design Patterns

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: #059669;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: #374151;
  border: 2px solid #E5E7EB;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 500;
}

/* Success Button */
.btn-success {
  background: #059669;
  color: white;
  /* Similar structure to primary */
}
```

### Cards
```css
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  padding: 24px;
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 16px;
  margin-bottom: 24px;
}
```

### Form Elements
```css
.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #2563EB;
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  display: block;
}
```

## 6. Navigation & Information Architecture

### Routing Structure
The application follows a nested route pattern that reflects the data hierarchy:

```
/                           → Landing/redirect page
/events                     → Event selection page
/events/[id]/dashboard      → Main event dashboard
/events/[id]/category/[id]  → Category detail page
/events/[id]/expense/[id]   → Expense detail page
/profile                    → Account settings
/signin                     → Authentication
/signup                     → Registration
```

### Breadcrumb Navigation
```typescript
// Breadcrumb Component Usage
<Breadcrumbs items={[
  { label: "Event Name", href: "/events/123/dashboard", icon: HomeIcon },
  { label: "Category Name", href: "/events/123/category/456" },
  { label: "Current Page", current: true }
]} />
```

#### Breadcrumb Patterns
- **Event Dashboard**: `Event Name`
- **Category Page**: `Event Name > Category Name`
- **Expense Page**: `Event Name > Category Name > Expense Name`
- **Home icon** always represents the event dashboard
- **Clickable breadcrumbs** for easy navigation up the hierarchy
- **Current page** shown in darker text, non-clickable

### Sidebar Navigation
- **Collapsible design** with hamburger menu on mobile
- **Logo placement** at the top with full branding
- **Event list** with visual indicators and easy switching
- **Account section** at bottom with sign-out functionality
- **Add event button** for quick event creation

### Layout Hierarchy
```typescript
// Layout Structure
RootLayout              // Sidebar + main content area
├── DashboardLayout     // Event-specific layouts
├── AccountLayout       // Profile/settings layouts
└── AuthLayout         // Sign in/up layouts (no sidebar)
```

## 7. Authentication Design

### Authentication Pages
- **Centered card layout** on gradient background
- **Logo prominence** with large brand display
- **Form validation** with real-time feedback
- **Loading states** with spinner animations
- **Error handling** with clear, actionable messages

### Form Design Patterns
#### Sign In Form
- Email and password fields
- Password visibility toggle
- "Forgot password?" link with modal
- Social sign-in options
- Link to sign up

#### Sign Up Form
- Progressive disclosure of requirements
- **Password strength indicator** with visual progress
- **Real-time validation** with checkmark/X indicators
- Terms of service checkbox
- Password confirmation matching

#### Forgot Password
- Modal-based workflow
- Email input with validation
- Success state with clear next steps
- Resend functionality

## 8. Interactive Component Patterns

### Expense Cards
Enhanced expense list items with comprehensive information display:

```typescript
// Expense Card Features
- Payment status indicators (paid, pending, due dates)
- Progress bars for payment schedules
- Hover effects with visual feedback
- Clickable areas with cursor pointer
- Remaining balance display
- Next due date information
```

#### Visual States
- **Fully Paid**: Green checkmark, success colors
- **Payment Pending**: Orange clock icon, warning colors
- **Payment Schedule**: Progress bar with completion percentage
- **Hover State**: Border color change, subtle shadow, background tint

### Action Dropdowns
Responsive dropdown menus with adaptive behavior:

```typescript
// ActionDropdown Variants
<ActionDropdown
  variant="mobile-only"     // Hamburger menu on small screens
  variant="desktop-split"   // Primary button + dropdown arrow
  primaryAction={{
    label: "Main Action",
    icon: PlusIcon,
    onClick: () => {}
  }}
  options={[...]}
/>
```

### Payment Schedule Display
Comprehensive payment tracking with visual progress:

- **Payment Summary**: Total amount, paid amount, remaining balance
- **Individual Payment Cards**: Status-based colors and icons
- **Progress Indicators**: Visual completion bars
- **Action Buttons**: Mark as paid, edit payment
- **Due Date Warnings**: Color-coded urgency indicators

### Modal Patterns
Consistent modal design across the application:

#### Standard Modal Structure
- **Header**: Title with close button
- **Body**: Content area with proper spacing
- **Footer**: Action buttons (primary + secondary)
- **Overlay**: Semi-transparent backdrop
- **Transitions**: Smooth enter/exit animations

#### Specialized Modals
- **Form Modals**: Multi-step forms with validation
- **Confirmation Modals**: Destructive action warnings
- **Success Modals**: Completion feedback with next steps
- **Loading Modals**: Progress indicators for async operations

## 9. Data Visualization Guidelines

### Chart Color Palette
- **Budget vs Actual Gauge**: Blue (#2563EB) for budget, green (#059669) for under-budget, amber (#D97706) for approaching, red (#DC2626) for over-budget
- **Category Pie Charts**: Rotating palette: Blue, Purple, Emerald, Amber, Rose, Cyan, Orange
- **Line Charts**: Primary blue with gradient fill, secondary lines in gray

### Chart Design Principles
- **Minimalist axes**: Light gray, non-intrusive
- **Clear data labels**: Dark text, adequate contrast
- **Hover interactions**: Subtle animations, informative tooltips
- **Responsive scaling**: Maintain readability across devices
- **Accessibility**: Pattern fills for color-blind users

## 7. Icon System

### Icon Library: Heroicons (outline and solid variants)
- **Navigation**: home, chart-bar, calendar, settings, user-circle
- **Financial**: currency-dollar, credit-card, receipt-tax, trending-up
- **Actions**: plus, pencil, trash, download, upload
- **Status**: check-circle, exclamation-triangle, x-circle
- **UI**: chevron-down, x-mark, bars-3, magnifying-glass

### Icon Guidelines
- **Size Scale**: 16px, 20px, 24px, 32px
- **Stroke Width**: 1.5px for outline icons
- **Colors**: Follow text color hierarchy
- **Spacing**: Minimum 8px from text

## 8. Animation & Micro-interactions

### Transition Standards
```css
/* Standard easing */
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

/* Bounce for success states */
transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Smooth for data changes */
transition: all 0.4s ease-out;
```

### Interaction Patterns
- **Hover States**: Subtle elevation, color shifts
- **Loading States**: Skeleton screens, progressive loading
- **Success Feedback**: Green checkmarks, gentle bounce
- **Error States**: Red highlighting, shake animation
- **Data Updates**: Smooth transitions, highlighting changes

## 9. Responsive Design Breakpoints

```css
/* Mobile First Approach */
:root {
  /* Mobile: 320px - 768px */
}

@media (min-width: 768px) {
  /* Tablet: 768px - 1024px */
}

@media (min-width: 1024px) {
  /* Desktop: 1024px - 1440px */
}

@media (min-width: 1440px) {
  /* Large Desktop: 1440px+ */
}
```

### Responsive Patterns
- **Navigation**: Mobile hamburger → tablet icons → desktop full nav
- **Charts**: Stacked mobile → side-by-side tablet → dashboard grid desktop
- **Forms**: Single column → two-column on desktop
- **Cards**: Full width mobile → grid layout desktop

## 10. Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: Full tab order, focus indicators
- **Screen Readers**: Proper ARIA labels, semantic HTML
- **Color Independence**: Information not conveyed by color alone

### Focus Management
```css
.focus-ring {
  outline: 2px solid #059669;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove default focus, add custom */
*:focus {
  outline: none;
}

*:focus-visible {
  @apply focus-ring;
}
```

### Accessibility Features
- **High contrast mode support**
- **Reduced motion preferences**
- **Screen reader optimized**
- **Keyboard shortcuts for power users**
- **Clear error messaging**
- **Descriptive alt text for charts**

This design system provides the foundation for creating a cohesive, accessible, and trustworthy financial planning application that works seamlessly across all devices and user needs.