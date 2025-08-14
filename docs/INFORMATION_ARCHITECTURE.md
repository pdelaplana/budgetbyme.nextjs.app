# BudgetByMe - Information Architecture & Navigation

## 1. User Journey Overview

### Primary User Goals
1. **Plan major life events** with confidence and clarity
2. **Track spending** against established budgets
3. **Monitor financial progress** through visual dashboards
4. **Manage payments** and deadlines efficiently
5. **Export data** for external use or record-keeping

### User Personas
- **The Meticulous Planner**: Wants detailed tracking, multiple categories, precise scheduling
- **The Budget-Conscious Celebrant**: Focuses on staying within limits, needs clear overage alerts
- **The Collaborative Organizer**: Shares planning with partners, needs accessible interfaces
- **The Mobile Manager**: Frequently updates on-the-go, needs streamlined mobile experience

## 2. Site Map & Navigation Structure

```
BudgetByMe/
├── Authentication
│   ├── Sign In
│   ├── Sign Up
│   └── Password Recovery
│
├── Dashboard (Default Landing)
│   ├── Events Overview
│   ├── Quick Actions
│   ├── Recent Activity
│   └── Financial Summary
│
├── Events
│   ├── All Events (List View)
│   ├── Create New Event
│   └── Event Detail
│       ├── Event Overview
│       ├── Budget Management
│       │   ├── Expense Categories
│       │   ├── Add/Edit Expenses
│       │   └── Payment Scheduling
│       ├── Payment Tracking
│       │   ├── Payment History
│       │   ├── Upload Receipts
│       │   └── Mark Payments
│       ├── Analytics Dashboard
│       │   ├── Budget vs Actual
│       │   ├── Payment Forecast
│       │   ├── Category Breakdown
│       │   └── Timeline View
│       └── Event Settings
│
├── Account
│   ├── Profile Settings
│   ├── Notification Preferences
│   ├── Data Export
│   └── Delete Account
│
└── Help & Support
    ├── Getting Started Guide
    ├── FAQ
    └── Contact Support
```

## 3. Primary Navigation Design

### Desktop Navigation
```
[Logo] BudgetByMe    Dashboard    Events    Account    [Profile Avatar ↓]
                                                       ├─ Settings
                                                       ├─ Export Data  
                                                       ├─ Help
                                                       └─ Sign Out
```

### Mobile Navigation
```
[☰ Menu]  BudgetByMe                           [👤 Profile]

Hamburger Menu:
├─ Dashboard
├─ Events
├─ Account Settings
├─ Help & Support
└─ Sign Out
```

### Breadcrumb Pattern
```
Dashboard > Events > Wedding Planning > Budget Management > Venue & Reception
```

## 4. Event-Centric Information Architecture

### Event Dashboard Structure
```
Event: "Sarah & John's Wedding"
├── Header Section
│   ├── Event Name & Description
│   ├── Date & Countdown
│   ├── Total Budget vs Spent
│   └── Quick Actions (Add Expense, Record Payment)
│
├── Financial Overview (Top Row)
│   ├── Budget vs Actual Gauge
│   ├── Payment Timeline
│   └── Category Summary
│
├── Management Sections
│   ├── Upcoming Payments (Due Soon)
│   ├── Recent Activity Feed
│   └── Expense Categories Grid
│
└── Action Areas
    ├── Add New Expense
    ├── Record Payment
    ├── Upload Receipt
    └── View Full Analytics
```

## 5. Data Hierarchy & Categorization

### Expense Organization
```
Event
├── Categories (User-defined + Defaults)
│   ├── Venue & Reception
│   ├── Catering & Beverages  
│   ├── Photography & Video
│   ├── Attire & Beauty
│   ├── Flowers & Decorations
│   ├── Entertainment & Music
│   ├── Transportation
│   ├── Invitations & Stationery
│   └── Miscellaneous
│
├── Payment Schedules
│   ├── ASAP (Immediate)
│   ├── On The Day
│   ├── Specific Dates
│   └── Flexible/TBD
│
└── Status Tracking
    ├── Budget Set
    ├── Vendor Contacted
    ├── Contract Signed
    ├── Deposit Paid
    ├── Balance Due
    └── Complete
```

### Information Priority Levels
1. **Critical**: Overdue payments, budget overruns, approaching deadlines
2. **High**: Upcoming payments (within 7 days), incomplete required expenses
3. **Medium**: Progress updates, recent activity, category totals
4. **Low**: Historical data, detailed breakdowns, export options

## 6. User Flow Diagrams

### New User Onboarding Flow
```
Sign Up → Email Verification → Profile Setup → Create First Event → 
Budget Setup Tutorial → Add Sample Expenses → Dashboard Tour → Complete
```

### Event Creation Flow
```
Events Page → "Create New Event" → 
Event Details (Name, Type, Dates) → 
Initial Budget Setup → 
Category Selection → 
First Expense Entry → 
Event Dashboard
```

### Expense Management Flow
```
Event Dashboard → "Add Expense" → 
Category Selection → 
Expense Details (Amount, Vendor, Notes) → 
Payment Schedule → 
Document Upload (Optional) → 
Confirmation → 
Updated Dashboard
```

### Payment Recording Flow
```
Dashboard/Payment Alert → "Record Payment" → 
Expense Selection → 
Payment Details (Amount, Date, Method) → 
Receipt Upload → 
Payment Confirmation → 
Updated Progress View
```

## 7. Content Strategy

### Microcopy Guidelines
- **Encouraging tone**: "You're doing great! 85% of budget remaining"
- **Clear actions**: "Record Payment" not "Update Status"  
- **Helpful context**: "Due in 3 days" rather than just "Due 03/15"
- **Progressive guidance**: "Next: Add vendor contact information"

### Error & Empty States
- **Budget overrun**: "You're $500 over budget in Catering. Consider adjusting other categories."
- **No events**: "Ready to plan something special? Create your first event to get started."
- **No expenses**: "Start by adding your major expenses like venue and catering."
- **Payment overdue**: "This payment was due 2 days ago. Contact your vendor to confirm."

### Success States
- **Payment recorded**: "Payment saved! Your venue deposit is now complete."
- **Budget milestone**: "Halfway there! You've allocated 50% of your total budget."
- **Event completion**: "Congratulations! All payments complete for this event."

## 8. Search & Filtering

### Event List Filtering
- **Status**: Active, Completed, Archived
- **Date Range**: Upcoming (next 30 days), This Year, All Time
- **Event Type**: Wedding, Graduation, Birthday, Other
- **Budget Size**: Under $1K, $1K-$5K, $5K-$15K, $15K+

### Expense Search & Sort
- **Search**: By vendor name, expense description, category
- **Sort Options**: Amount (high/low), Date created, Due date, Status
- **Filter Options**: Category, Payment status, Date range, Amount range

### Payment History
- **Date Ranges**: Last 30 days, Last 6 months, All time
- **Status**: Paid, Pending, Overdue
- **Payment Method**: Cash, Check, Credit Card, Bank Transfer
- **Amount Ranges**: Custom ranges with presets

## 9. Mobile-First Navigation Patterns

### Mobile Dashboard Layout
```
┌─────────────────────────┐
│ Welcome back, Sarah!    │
├─────────────────────────┤
│ Wedding Planning        │
│ $8,500 / $12,000       │
│ [Progress Bar]         │
├─────────────────────────┤
│ Upcoming Payments (3)   │
│ ├ Photographer: $500    │
│ ├ Florist: $300        │
│ └ DJ: $400             │
├─────────────────────────┤
│ Quick Actions           │
│ [Add Expense] [Pay Bill]│
├─────────────────────────┤
│ Recent Activity         │
│ ├ Venue deposit paid    │
│ └ Catering quote added  │
└─────────────────────────┘
```

### Gesture & Touch Patterns
- **Swipe left**: Quick access to payment recording
- **Swipe right**: Mark expense as complete
- **Long press**: Context menu with additional actions
- **Pull to refresh**: Update payment status and data
- **Pinch to zoom**: Chart interactions on mobile

## 10. Progressive Disclosure Strategy

### Information Layering
1. **Dashboard Level**: High-level metrics, critical alerts
2. **Event Level**: Category totals, payment timeline, recent activity
3. **Category Level**: Individual expense list, vendor details
4. **Expense Level**: Full details, documents, payment history
5. **Analytics Level**: Detailed charts, export options, trends

### Contextual Assistance
- **Tooltips**: For complex financial terms or calculations
- **Progressive hints**: "Pro tip: Set payment schedules to avoid last-minute rushes"
- **Contextual help**: Inline help text for first-time users
- **Guided tours**: Optional walkthroughs for major features

This information architecture ensures users can efficiently navigate from high-level planning to detailed expense management while maintaining clarity and reducing cognitive load at each step of their financial planning journey.