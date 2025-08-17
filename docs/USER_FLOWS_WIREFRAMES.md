# BudgetByMe - User Flows & Wireframes

## 1. Authentication Flow

### Sign Up Process
```
Step 1: Landing Page
┌─────────────────────────────────┐
│        BudgetByMe Logo          │
│                                 │
│   Plan Life's Special Moments   │
│      with Confidence            │
│                                 │
│   [Sign Up Free] [Sign In]      │
│                                 │
│   ✓ Unlimited Events            │
│   ✓ Budget Tracking             │
│   ✓ Payment Scheduling          │
└─────────────────────────────────┘

Step 2: Registration Form
┌─────────────────────────────────┐
│     Create Your Account         │
│                                 │
│   Full Name: [____________]     │
│   Email: [________________]     │
│   Password: [______________]    │
│   Confirm: [_______________]    │
│                                 │
│   □ I agree to Terms of Service │
│                                 │
│   [Create Account]              │
│   Already have account? Sign in │
└─────────────────────────────────┘

Step 3: Email Verification
┌─────────────────────────────────┐
│      Check Your Email          │
│                                 │
│   📧 We sent a verification     │
│      link to:                  │
│      sarah@example.com         │
│                                 │
│   [Resend Email]               │
│   [Change Email Address]        │
└─────────────────────────────────┘
```

### Sign In Process
```
┌─────────────────────────────────┐
│      Welcome Back!             │
│                                 │
│   Email: [________________]     │
│   Password: [______________]    │
│                                 │
│   □ Remember me                 │
│   Forgot password?             │
│                                 │
│   [Sign In]                    │
│   Don't have account? Sign up   │
└─────────────────────────────────┘
```

## 2. Event Creation Flow

### Step 1: Event Type Selection
```
┌─────────────────────────────────┐
│     Create New Event            │
│                                 │
│   What are you planning?        │
│                                 │
│   💒 [Wedding]                  │
│   🎓 [Graduation]               │
│   🎂 [Birthday Party]           │
│   🏖️ [Vacation/Honeymoon]       │
│   🎉 [Other Celebration]        │
│                                 │
│   [Continue]                    │
└─────────────────────────────────┘
```

### Step 2: Event Details
```
┌─────────────────────────────────┐
│     Event Details               │
│                                 │
│   Event Name:                   │
│   [Sarah & John's Wedding]      │
│                                 │
│   Description: (optional)       │
│   [A beautiful outdoor...]      │
│                                 │
│   Event Date:                   │
│   [📅 June 15, 2024]           │
│                                 │
│   Planning Deadline:            │
│   [📅 May 1, 2024]             │
│                                 │
│   [Back] [Continue]             │
└─────────────────────────────────┘
```

### Step 3: Initial Budget Setup
```
┌─────────────────────────────────┐
│     Set Your Budget             │
│                                 │
│   What's your total budget?     │
│   💰 $[12,000]                  │
│                                 │
│   We'll help you allocate this  │
│   across different categories   │
│                                 │
│   📊 Suggested Breakdown:       │
│   Venue (40%): $4,800          │
│   Catering (30%): $3,600       │
│   Photography (10%): $1,200    │
│   Other (20%): $2,400          │
│                                 │
│   [Customize] [Use Suggestions] │
└─────────────────────────────────┘
```

## 3. Dashboard Layout Wireframes

### Desktop Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ BudgetByMe    Dashboard  Events  Account           👤 Sarah ▼   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Welcome back, Sarah! 👋                                        │
│                                                                 │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│ │ Active Events   │ │ Total Budget    │ │ Payments Due    │    │
│ │       3         │ │   $28,500       │ │       5         │    │
│ │                 │ │                 │ │                 │    │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                 │
│ ┌─────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ Recent Activity             │ │ Upcoming Payments          │ │
│ │ ────────────────────────── │ │ ────────────────────────── │ │
│ │ 📸 Photography deposit paid │ │ 🏛️ Venue: $2,500          │ │
│ │ 💐 Florist quote received   │ │    Due: March 15           │ │
│ │ 🎵 DJ contract signed       │ │ 🍰 Caterer: $1,800        │ │
│ │                            │ │    Due: March 20           │ │
│ │ [View All Activity]        │ │ [View All Payments]        │ │
│ └─────────────────────────────┘ └─────────────────────────────┘ │
│                                                                 │
│ Your Events                                                     │
│ ─────────────────────────────────────────────────────────────  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 💒 Sarah & John's Wedding          📅 June 15, 2024        │ │
│ │    $8,500 of $12,000 spent                                 │ │
│ │    ████████░░░░ 71%                                        │ │
│ │                                            [View Details] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [+ Create New Event]                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Dashboard
```
┌─────────────────────────┐
│ ☰ BudgetByMe      👤    │
├─────────────────────────┤
│                         │
│ Welcome back, Sarah! 👋  │
│                         │
│ ┌─────────────────────┐ │
│ │ 💒 Wedding Planning  │ │
│ │ $8,500 / $12,000    │ │
│ │ ████████░░░░ 71%    │ │
│ │ 📅 June 15, 2024    │ │
│ └─────────────────────┘ │
│                         │
│ Payments Due Soon (3)   │
│ ─────────────────────── │
│ 🏛️ Venue Balance        │
│ $2,500 • Due Mar 15     │
│                         │
│ 🍰 Catering Deposit     │
│ $1,800 • Due Mar 20     │
│                         │
│ 📸 Photo Session        │
│ $500 • Due Mar 25       │
│                         │
│ Quick Actions           │
│ ─────────────────────── │
│ [💰 Add Expense]        │
│ [💳 Record Payment]     │
│                         │
│ Recent Activity         │
│ ─────────────────────── │
│ DJ deposit paid         │
│ Florist quote added     │
│ [View All]              │
└─────────────────────────┘
```

## 4. Event Detail Dashboard

### Desktop Event Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard > Events > Sarah & John's Wedding                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 💒 Sarah & John's Wedding                    📅 June 15, 2024  │
│ A beautiful outdoor celebration with family and friends         │
│                                                                 │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│ │ Total Budget    │ │ Amount Spent    │ │ Remaining       │    │
│ │   $12,000       │ │    $8,500       │ │   $3,500        │    │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                 │
│ ┌─────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ Budget vs Actual            │ │ Payment Timeline           │ │
│ │                             │ │                            │ │
│ │      [GAUGE CHART]          │ │     [LINE CHART]           │ │
│ │         71%                 │ │                            │ │
│ │       ON TRACK              │ │                            │ │
│ └─────────────────────────────┘ └─────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Category Breakdown                    [PIE CHART]          │ │
│ │ ─────────────────────────────────────────────────────────  │ │
│ │ 🏛️ Venue & Reception    $4,000 / $4,800  ████████░░ 83%   │ │
│ │ 🍰 Catering & Drinks    $2,800 / $3,600  ████████░░ 78%   │ │
│ │ 📸 Photography & Video  $900 / $1,200    ███████░░░ 75%   │ │
│ │ 👗 Attire & Beauty      $600 / $800      ███████░░░ 75%   │ │
│ │ 💐 Flowers & Décor      $200 / $600      ██░░░░░░░░ 33%   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [+ Add Expense] [💳 Record Payment] [📊 Full Analytics]        │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Expense Management Flow

### Add New Expense
```
Step 1: Category Selection
┌─────────────────────────────────┐
│     Add New Expense             │
│                                 │
│   Select Category:              │
│                                 │
│   🏛️ ○ Venue & Reception        │
│   🍰 ○ Catering & Beverages     │
│   📸 ● Photography & Video      │
│   👗 ○ Attire & Beauty          │
│   💐 ○ Flowers & Decorations    │
│   🎵 ○ Entertainment & Music    │
│   🚗 ○ Transportation           │
│   📝 ○ Invitations & Stationery │
│   ➕ ○ Create New Category      │
│                                 │
│   [Continue]                    │
└─────────────────────────────────┘

Step 2: Expense Details
┌─────────────────────────────────┐
│     Photography & Video         │
│                                 │
│   Expense Name:                 │
│   [Wedding Photography]         │
│                                 │
│   Amount:                       │
│   $[2,500]                      │
│                                 │
│   Vendor Name:                  │
│   [Smith Photography Studio]    │
│                                 │
│   Vendor Contact:               │
│   [info@smithphoto.com]         │
│                                 │
│   Description: (optional)       │
│   [Full day coverage...]        │
│                                 │
│   [Back] [Continue]             │
└─────────────────────────────────┘

Step 3: Payment Schedule
┌─────────────────────────────────┐
│     Payment Schedule            │
│                                 │
│   When do you need to pay?      │
│                                 │
│   ● ASAP (Immediate)            │
│   ○ Specific Date               │
│   ○ On the Event Day            │
│   ○ Flexible / TBD              │
│                                 │
│   Payment Breakdown:            │
│   ┌─────────────────────────┐   │
│   │ Deposit: $500           │   │
│   │ Due: March 1, 2024      │   │
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │ Balance: $2,000         │   │
│   │ Due: June 1, 2024       │   │
│   └─────────────────────────┘   │
│                                 │
│   [+ Add Payment] [Back] [Save] │
└─────────────────────────────────┘
```

## 6. Payment Recording Flow

### Record Payment Interface
```
┌─────────────────────────────────┐
│     Record Payment              │
│                                 │
│   For: Wedding Photography      │
│   Smith Photography Studio      │
│                                 │
│   Payment Type:                 │
│   ● Deposit ($500 due)          │
│   ○ Balance Payment             │
│   ○ Full Payment                │
│                                 │
│   Amount Paid:                  │
│   $[500]                        │
│                                 │
│   Payment Date:                 │
│   [📅 March 1, 2024]           │
│                                 │
│   Payment Method:               │
│   ● Credit Card ○ Check         │
│   ○ Cash ○ Bank Transfer        │
│                                 │
│   Upload Receipt: (optional)    │
│   [📎 Choose File] [📷 Camera]  │
│                                 │
│   Notes: (optional)             │
│   [Paid deposit via Visa...]    │
│                                 │
│   [Cancel] [Record Payment]     │
└─────────────────────────────────┘
```

## 7. Analytics Dashboard Layout

### Full Analytics View
```
┌─────────────────────────────────────────────────────────────────┐
│ Sarah & John's Wedding > Analytics                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────┐ ┌─────────────────────────────────────┐ │
│ │ Budget Health       │ │ Spending Over Time                  │ │
│ │                     │ │                                     │ │
│ │   [GAUGE CHART]     │ │        [LINE CHART]                 │ │
│ │      $8,500         │ │                                     │ │
│ │     $12,000         │ │                                     │ │
│ │     ON TRACK        │ │                                     │ │
│ └─────────────────────┘ └─────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────┐ ┌─────────────────────────────────────┐ │
│ │ Category Breakdown  │ │ Payment Forecast                    │ │
│ │                     │ │                                     │ │
│ │   [PIE CHART]       │ │        [BAR CHART]                  │ │
│ │                     │ │                                     │ │
│ │                     │ │   March: $3,200                     │ │
│ │                     │ │   April: $1,800                     │ │
│ │                     │ │   May: $2,500                       │ │
│ └─────────────────────┘ └─────────────────────────────────────┘ │
│                                                                 │
│ Detailed Breakdown                                              │
│ ─────────────────────────────────────────────────────────────  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🏛️ Venue & Reception              Budget: $4,800            │ │
│ │    ████████████████████░░░░ 83%   Spent: $4,000             │ │
│ │    ├ Venue Rental: $3,500 ✓ Paid                           │ │
│ │    └ Setup/Cleanup: $500 ⏰ Due Mar 15                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [📊 Export Data] [📧 Email Report] [🖨️ Print]                  │
└─────────────────────────────────────────────────────────────────┘
```

## 8. Mobile-Optimized Flows

### Mobile Expense Entry
```
Step 1: Quick Add
┌─────────────────────────┐
│ ← Add Expense           │
├─────────────────────────┤
│                         │
│ Amount                  │
│ $[_____]                │
│                         │
│ What's this for?        │
│ [________________]      │
│                         │
│ Category                │
│ [Venue & Reception ▼]   │
│                         │
│ When is payment due?    │
│ ● ASAP                  │
│ ○ Specific date         │
│ ○ Event day             │
│ ○ Flexible              │
│                         │
│                         │
│ [Cancel] [Save & More]  │
│         [Quick Save]    │
└─────────────────────────┘

Step 2: Additional Details (Optional)
┌─────────────────────────┐
│ ← Expense Details       │
├─────────────────────────┤
│                         │
│ Vendor                  │
│ [Smith Photography]     │
│                         │
│ Contact                 │
│ [info@smithphoto.com]   │
│                         │
│ Description             │
│ [________________]      │
│                         │
│ Upload Documents        │
│ [📷 Camera] [📎 Files]  │
│                         │
│ Tags (comma separated)  │
│ [outdoor, professional] │
│                         │
│                         │
│ [Skip] [Save Expense]   │
└─────────────────────────┘
```

## 9. Responsive Breakpoint Considerations

### Key Responsive Patterns

**Mobile (320px - 767px)**
- Single column layouts
- Stacked navigation
- Touch-optimized buttons (44px minimum)
- Simplified charts with drill-down
- Swipe gestures for actions

**Tablet (768px - 1023px)**
- Two-column layouts for forms
- Tab navigation for sections  
- Medium-sized charts with labels
- Hybrid touch/mouse interactions

**Desktop (1024px+)**
- Multi-column dashboard grids
- Sidebar navigation with breadcrumbs
- Full-featured charts with interactions
- Keyboard shortcuts and hover states
- Multiple simultaneous views

### Progressive Enhancement
- Core functionality available on mobile
- Enhanced interactions on larger screens
- Keyboard navigation for desktop users
- Print-optimized layouts for reports

This comprehensive wireframe system ensures consistent user experiences across all device types while maintaining the financial planning focus that users need for successful event management.