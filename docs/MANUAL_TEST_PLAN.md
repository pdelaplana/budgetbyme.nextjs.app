# BudgetByMe - Comprehensive Manual Test Plan

## Overview
This document provides a comprehensive manual testing plan for the BudgetByMe application, including detailed test scenarios, test data, and expected results.

**Version**: 1.0
**Last Updated**: 2025-01-17
**Application**: BudgetByMe - Event Budget Management System

---

## Table of Contents
1. [Test Environment Setup](#test-environment-setup)
2. [Test Data Sets](#test-data-sets)
3. [Test Scenarios by Feature](#test-scenarios-by-feature)
4. [Regression Testing Checklist](#regression-testing-checklist)
5. [Cross-Browser & Device Testing](#cross-browser--device-testing)

---

## Test Environment Setup

### Prerequisites
- **Browser**: Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
- **Devices**: Desktop (1920x1080), Tablet (768px), Mobile (375px)
- **Network**: Test on both fast and slow connections
- **Test Account**: Create fresh test accounts for each major test run

### Environment URL
- **Development**: http://localhost:3000
- **Staging**: [TBD]
- **Production**: [TBD]

---

## Test Data Sets

### Test User Accounts

#### User 1 - New User (First-time Experience)
```
Email: newuser.test@example.com
Password: TestPassword123!
Name: Alex Johnson
```

#### User 2 - Active User (Multiple Events)
```
Email: active.user@example.com
Password: TestPassword123!
Name: Sarah Martinez
```

#### User 3 - Edge Case User
```
Email: edge.case@example.com
Password: TestPassword123!
Name: Test User 123 (special chars: äöü)
```

### Test Event Data

#### Event 1 - Wedding (Large Budget)
```yaml
Event Name: Sarah & Mike's Wedding
Event Type: Wedding
Event Date: 2025-06-15
Location: Napa Valley, CA
Total Budget: $50,000
Description: Dream wedding in wine country
```

**Expense Categories:**
1. Venue & Catering - $20,000
2. Photography & Video - $5,000
3. Flowers & Decorations - $4,000
4. Music & Entertainment - $3,000
5. Attire & Beauty - $4,000
6. Invitations & Stationery - $1,000
7. Transportation - $2,000
8. Favors & Gifts - $1,500
9. Cake & Desserts - $1,200
10. Miscellaneous - $8,300

#### Event 2 - Graduation Party (Medium Budget)
```yaml
Event Name: Emma's Graduation Celebration
Event Type: Graduation
Event Date: 2025-05-20
Location: Austin, TX
Total Budget: $5,000
Description: College graduation party
```

**Expense Categories:**
1. Venue Rental - $1,500
2. Catering - $2,000
3. Decorations - $500
4. Entertainment - $600
5. Invitations - $200
6. Miscellaneous - $200

#### Event 3 - Honeymoon (Small Budget)
```yaml
Event Name: Bali Honeymoon Adventure
Event Type: Honeymoon
Event Date: 2025-07-01 to 2025-07-14
Location: Bali, Indonesia
Total Budget: $8,000
Description: Two-week tropical honeymoon
```

**Expense Categories:**
1. Flights - $2,500
2. Accommodation - $3,000
3. Activities & Tours - $1,200
4. Dining - $800
5. Transportation - $300
6. Miscellaneous - $200

### Test Expense Data

#### Sample Expenses for Wedding Event

**Expense 1 - Paid in Full**
```yaml
Name: Venue Deposit & Final Payment
Category: Venue & Catering
Vendor: Napa Valley Estate
Budgeted Amount: $15,000
Payment Schedule: Two Payments
  - Deposit: $7,500 (Due: 2025-01-15) - PAID
  - Final Payment: $7,500 (Due: 2025-06-01) - PAID
Status: Fully Paid
Tags: venue, catering, essential
Notes: Includes tables, chairs, linens
```

**Expense 2 - Partially Paid**
```yaml
Name: Photography Package
Category: Photography & Video
Vendor: Capture Moments Photography
Budgeted Amount: $3,500
Payment Schedule: Three Payments
  - Booking Fee: $1,000 (Due: 2025-02-01) - PAID
  - Pre-wedding Shoot: $1,250 (Due: 2025-05-15) - PAID
  - Final Payment: $1,250 (Due: 2025-06-15) - UNPAID
Status: Partially Paid ($2,250 paid, $1,250 remaining)
Tags: photography, memories
```

**Expense 3 - Not Yet Paid**
```yaml
Name: Wedding Flowers
Category: Flowers & Decorations
Vendor: Blooming Designs
Budgeted Amount: $2,500
Payment Schedule: On The Day
  - Full Payment: $2,500 (Due: 2025-06-15) - UNPAID
Status: Not Paid
Tags: flowers, decorations, ceremony
```

**Expense 4 - Unplanned Expense (Over Budget)**
```yaml
Name: Emergency Tent Rental (Rain Backup)
Category: Miscellaneous
Vendor: Party Rentals Plus
Budgeted Amount: $0 (Unplanned)
Actual Cost: $1,200
Payment Schedule: ASAP
  - Full Payment: $1,200 (Paid: 2025-05-28)
Status: Paid
Tags: unplanned, weather, tent
Notes: Added due to weather forecast
```

**Expense 5 - Multiple Vendors**
```yaml
Name: Wedding Cake & Dessert Bar
Category: Cake & Desserts
Vendor: Sweet Sensations Bakery
Budgeted Amount: $1,200
Payment Schedule: Two Payments
  - Deposit: $400 (Due: 2025-04-01) - UNPAID
  - Final Payment: $800 (Due: 2025-06-10) - UNPAID
Status: Not Paid
Tags: cake, desserts, sweets
```

### Test Payment Data

#### Payment Records
```yaml
Payment 1:
  Expense: Venue Deposit
  Amount: $7,500
  Date: 2025-01-15
  Method: Credit Card
  Confirmation: #CC-12345678
  Receipt: venue_deposit_receipt.pdf

Payment 2:
  Expense: Photography Booking
  Amount: $1,000
  Date: 2025-02-01
  Method: Check
  Check Number: #2048
  Receipt: photo_booking.jpg

Payment 3:
  Expense: Photography Pre-wedding
  Amount: $1,250
  Date: 2025-05-15
  Method: Bank Transfer
  Reference: WIRE-987654
  Receipt: None

Payment 4:
  Expense: Emergency Tent (Unplanned)
  Amount: $1,200
  Date: 2025-05-28
  Method: Credit Card
  Confirmation: #CC-87654321
  Receipt: tent_rental_invoice.pdf
  Notes: Rush order - 2-week notice
```

### Edge Case Test Data

#### Special Characters & Formatting
```yaml
Event Name: "Marie's "Special" Event & Celebration!"
Vendor Name: A&B Events, LLC (c/o Smith)
Amount: $1,234.56
Amount: $0.01 (minimum)
Amount: $999,999.99 (maximum)
Description: Line 1
Line 2
Line 3 (multi-line)
```

#### Boundary Values
```yaml
Event Date: Today
Event Date: Tomorrow
Event Date: 5 years in future
Event Date: Past date (should error)
Budget: $0
Budget: $1
Budget: $999,999,999
Expense Name: "A" (1 character)
Expense Name: "This is a very long expense name that goes on and on and on..." (100+ chars)
```

---

## Test Scenarios by Feature

### 1. Authentication & User Management

#### Test Case 1.1: New User Registration
**Priority**: P0 (Critical)

**Steps:**
1. Navigate to application home page
2. Click "Sign Up" or "Create Account"
3. Enter test email: `newuser.test@example.com`
4. Enter password: `TestPassword123!`
5. Confirm password: `TestPassword123!`
6. Enter name: `Alex Johnson`
7. Click "Create Account"

**Expected Results:**
- ✅ Account created successfully
- ✅ User redirected to dashboard/onboarding
- ✅ Welcome message displayed
- ✅ Email verification sent (if implemented)

**Test Data Variations:**
- Invalid email format: `notanemail`
- Weak password: `123`
- Mismatched passwords
- Already registered email

---

#### Test Case 1.2: User Sign In
**Priority**: P0 (Critical)

**Steps:**
1. Navigate to sign-in page
2. Enter email: `active.user@example.com`
3. Enter password: `TestPassword123!`
4. Click "Sign In"

**Expected Results:**
- ✅ User authenticated successfully
- ✅ Redirected to dashboard
- ✅ User's events displayed

**Negative Tests:**
- Wrong password → Error message displayed
- Non-existent email → Error message displayed
- Empty fields → Validation errors shown

---

#### Test Case 1.3: Password Reset
**Priority**: P1 (High)

**Steps:**
1. Click "Forgot Password?" on sign-in page
2. Enter email: `active.user@example.com`
3. Click "Send Reset Email"
4. Check email inbox
5. Click reset link
6. Enter new password
7. Confirm new password
8. Sign in with new password

**Expected Results:**
- ✅ Reset email sent
- ✅ Reset link works
- ✅ Password updated successfully
- ✅ Can sign in with new password

---

#### Test Case 1.4: Sign Out
**Priority**: P1 (High)

**Steps:**
1. Sign in to application
2. Click user profile/menu
3. Click "Sign Out"

**Expected Results:**
- ✅ User signed out
- ✅ Redirected to sign-in page
- ✅ Cannot access protected pages without signing in again

---

### 2. Workspace & Event Management

#### Test Case 2.1: Create First Event (Onboarding)
**Priority**: P0 (Critical)

**Test Data**: Use "Sarah & Mike's Wedding" from test data

**Steps:**
1. Sign in as new user
2. Click "Create Event" or "Get Started"
3. Enter event name: `Sarah & Mike's Wedding`
4. Select event type: `Wedding`
5. Enter event date: `06/15/2025`
6. Enter location: `Napa Valley, CA`
7. Enter description: `Dream wedding in wine country`
8. Click "Create Event"

**Expected Results:**
- ✅ Event created successfully
- ✅ Redirected to event dashboard
- ✅ Event details displayed correctly
- ✅ Empty state shown for expenses (no expenses yet)

---

#### Test Case 2.2: Create Multiple Events
**Priority**: P1 (High)

**Steps:**
1. Create first event (Wedding)
2. Navigate to events list
3. Click "Create New Event"
4. Create second event (Graduation Party)
5. Create third event (Honeymoon)

**Expected Results:**
- ✅ All three events created
- ✅ Events list shows all events
- ✅ Can switch between events
- ✅ Each event maintains separate data

---

#### Test Case 2.3: Edit Event Details
**Priority**: P1 (High)

**Steps:**
1. Open existing event
2. Click "Edit Event" or settings icon
3. Change event name to: `Sarah & Mike's Dream Wedding`
4. Change date to: `06/20/2025`
5. Update description
6. Click "Save Changes"

**Expected Results:**
- ✅ Event updated successfully
- ✅ New details displayed immediately
- ✅ All related expenses still associated correctly
- ✅ Confirmation message shown

---

#### Test Case 2.4: Delete Event
**Priority**: P1 (High)

**Steps:**
1. Open event to delete
2. Click "Delete Event" or trash icon
3. Confirm deletion in modal
4. Observe behavior

**Expected Results:**
- ✅ Confirmation modal appears
- ✅ Warning about deleting all expenses shown
- ✅ Event deleted after confirmation
- ✅ Redirected to events list or dashboard
- ✅ Event no longer appears in list
- ✅ All associated expenses deleted

**Test Cancellation:**
- Click "Cancel" → Event not deleted

---

### 3. Expense Management

#### Test Case 3.1: Create Expense - Simple (ASAP Payment)
**Priority**: P0 (Critical)

**Test Data**: Photography Booking

**Steps:**
1. Open "Sarah & Mike's Wedding" event
2. Click "Add Expense"
3. Enter expense name: `Photography Package`
4. Select category: `Photography & Video`
5. Enter vendor: `Capture Moments Photography`
6. Enter budgeted amount: `$3,500`
7. Select payment schedule: `ASAP`
8. Add tags: `photography, memories`
9. Click "Create Expense"

**Expected Results:**
- ✅ Expense created successfully
- ✅ Appears in expense list
- ✅ Budget calculations updated
- ✅ Shows as "Not Paid"
- ✅ ASAP payment schedule created

---

#### Test Case 3.2: Create Expense - Scheduled Payments
**Priority**: P0 (Critical)

**Test Data**: Venue with deposit and final payment

**Steps:**
1. Click "Add Expense"
2. Enter expense name: `Venue Deposit & Final Payment`
3. Select category: `Venue & Catering`
4. Enter vendor: `Napa Valley Estate`
5. Enter budgeted amount: `$15,000`
6. Select payment schedule: `Custom Schedule`
7. Add first payment: `$7,500` due `01/15/2025` - Label: `Deposit`
8. Add second payment: `$7,500` due `06/01/2025` - Label: `Final Payment`
9. Add notes: `Includes tables, chairs, linens`
10. Click "Create Expense"

**Expected Results:**
- ✅ Expense created with 2 payment schedules
- ✅ Both payments show as "Unpaid"
- ✅ Payment due dates displayed correctly
- ✅ Total matches budgeted amount ($15,000)

---

#### Test Case 3.3: Create Expense - On The Day Payment
**Priority**: P1 (High)

**Test Data**: Wedding Flowers

**Steps:**
1. Click "Add Expense"
2. Enter name: `Wedding Flowers`
3. Select category: `Flowers & Decorations`
4. Enter vendor: `Blooming Designs`
5. Enter amount: `$2,500`
6. Select payment schedule: `On The Day` (event day: 06/15/2025)
7. Click "Create Expense"

**Expected Results:**
- ✅ Expense created
- ✅ Payment due date = event date
- ✅ Marked appropriately in payment timeline

---

#### Test Case 3.4: Create Unplanned Expense
**Priority**: P1 (High)

**Test Data**: Emergency tent rental

**Steps:**
1. Click "Add Expense"
2. Enter name: `Emergency Tent Rental (Rain Backup)`
3. Mark as "Unplanned Expense" (checkbox or toggle)
4. Select category: `Miscellaneous`
5. Enter vendor: `Party Rentals Plus`
6. Budgeted amount: `$0` or leave blank
7. Actual cost: `$1,200`
8. Add note: `Added due to weather forecast`
9. Click "Create Expense"

**Expected Results:**
- ✅ Expense marked as unplanned
- ✅ Shows impact on budget (over budget indicator)
- ✅ Highlighted differently in expense list
- ✅ Dashboard reflects over-budget status

---

#### Test Case 3.5: Edit Expense
**Priority**: P1 (High)

**Steps:**
1. Open existing expense
2. Click "Edit"
3. Change vendor name
4. Update budgeted amount from `$3,500` to `$4,000`
5. Add new tag
6. Click "Save Changes"

**Expected Results:**
- ✅ Expense updated
- ✅ Budget totals recalculated
- ✅ Payment schedules adjusted if needed
- ✅ Changes reflected immediately

---

#### Test Case 3.6: Delete Expense
**Priority**: P1 (High)

**Steps:**
1. Open expense
2. Click "Delete Expense"
3. Confirm deletion

**Expected Results:**
- ✅ Confirmation modal appears
- ✅ Warning if payments exist
- ✅ Expense deleted
- ✅ Budget totals updated
- ✅ Associated payments removed

---

#### Test Case 3.7: Upload Documents/Receipts to Expense
**Priority**: P2 (Medium)

**Steps:**
1. Open expense
2. Click "Upload Document" or "Add Receipt"
3. Select file: `venue_contract.pdf`
4. Add description: `Signed venue contract`
5. Click "Upload"

**Expected Results:**
- ✅ File uploaded successfully
- ✅ File appears in expense documents list
- ✅ Can download file
- ✅ Can delete file

**File Types to Test:**
- PDF files
- JPG/PNG images
- Large files (test size limits)
- Invalid file types (should reject)

---

### 4. Payment Management

#### Test Case 4.1: Record Single Payment (Full Amount)
**Priority**: P0 (Critical)

**Test Data**: Venue Deposit payment

**Steps:**
1. Open expense: `Venue Deposit & Final Payment`
2. Locate payment schedule item: `Deposit - $7,500`
3. Click "Record Payment" or "Mark as Paid"
4. Enter payment date: `01/15/2025`
5. Enter amount: `$7,500`
6. Select payment method: `Credit Card`
7. Enter confirmation number: `#CC-12345678`
8. Upload receipt: `venue_deposit_receipt.pdf`
9. Click "Save Payment"

**Expected Results:**
- ✅ Payment recorded successfully
- ✅ Payment marked as "Paid"
- ✅ Payment date displayed
- ✅ Receipt attached and visible
- ✅ Budget calculations updated
- ✅ Dashboard charts updated

---

#### Test Case 4.2: Record Partial Payment
**Priority**: P1 (High)

**Steps:**
1. Open expense with scheduled payment of `$1,000`
2. Click "Record Payment"
3. Enter amount: `$500` (partial)
4. Add note: `First installment - balance due next month`
5. Click "Save Payment"

**Expected Results:**
- ✅ Partial payment recorded
- ✅ Shows remaining balance: `$500`
- ✅ Payment status shows "Partially Paid"
- ✅ Can record additional payments later

---

#### Test Case 4.3: Record Multiple Payments for One Expense
**Priority**: P1 (High)

**Steps:**
1. Open expense: `Photography Package` (3 payments)
2. Record first payment: `$1,000` on `02/01/2025`
3. Record second payment: `$1,250` on `05/15/2025`
4. Leave third payment unpaid

**Expected Results:**
- ✅ Both payments recorded
- ✅ Shows 2/3 payments made
- ✅ Shows remaining amount: `$1,250`
- ✅ Progress indicator shows 66% paid
- ✅ Charts reflect partial payment status

---

#### Test Case 4.4: Edit Payment
**Priority**: P2 (Medium)

**Steps:**
1. Open existing payment
2. Click "Edit Payment"
3. Change amount from `$1,000` to `$1,100`
4. Update payment date
5. Add payment method: `Check #2048`
6. Click "Save Changes"

**Expected Results:**
- ✅ Payment updated
- ✅ Budget calculations adjusted
- ✅ Payment history shows edit (if audit trail exists)

---

#### Test Case 4.5: Delete Payment
**Priority**: P2 (Medium)

**Steps:**
1. Open payment
2. Click "Delete Payment"
3. Confirm deletion

**Expected Results:**
- ✅ Payment deleted
- ✅ Expense returns to "Unpaid" or "Partially Paid" status
- ✅ Budget calculations updated
- ✅ Charts updated

---

#### Test Case 4.6: Upload Receipt to Payment
**Priority**: P2 (Medium)

**Steps:**
1. Record payment
2. Upload receipt image: `photo_booking.jpg`
3. Verify upload
4. Download receipt
5. Delete receipt

**Expected Results:**
- ✅ Receipt uploaded and attached
- ✅ Receipt preview shown
- ✅ Can download receipt
- ✅ Can delete and replace receipt

---

### 5. Categories & Tags

#### Test Case 5.1: Create Custom Category
**Priority**: P2 (Medium)

**Steps:**
1. Navigate to categories settings
2. Click "Add Category"
3. Enter name: `Hotel Accommodations`
4. Select color: Blue
5. Set budget allocation: `$3,000`
6. Click "Save"

**Expected Results:**
- ✅ Category created
- ✅ Available in expense creation dropdown
- ✅ Appears in category breakdown charts

---

#### Test Case 5.2: Edit Category
**Priority**: P2 (Medium)

**Steps:**
1. Open existing category
2. Change name
3. Change color
4. Update budget allocation
5. Save changes

**Expected Results:**
- ✅ Category updated
- ✅ All expenses using this category reflect changes
- ✅ Charts updated with new color/data

---

#### Test Case 5.3: Delete Category
**Priority**: P2 (Medium)

**Steps:**
1. Select category to delete
2. Click "Delete"
3. Handle expenses in this category (reassign or keep orphaned)
4. Confirm deletion

**Expected Results:**
- ✅ Warning shown if expenses exist
- ✅ Category deleted
- ✅ Expenses reassigned or marked as uncategorized

---

#### Test Case 5.4: Use Tags for Expense Organization
**Priority**: P2 (Medium)

**Steps:**
1. Create expense with tags: `essential, venue, outdoor`
2. Create another expense with overlapping tags: `venue, indoor`
3. Filter expenses by tag: `venue`
4. Observe results

**Expected Results:**
- ✅ Tags saved to expenses
- ✅ Tag filtering shows both expenses
- ✅ Can filter by multiple tags

---

### 6. Dashboard & Charts

#### Test Case 6.1: View Budget vs Actual Gauge Chart
**Priority**: P1 (High)

**Prerequisite**: Create event with $50,000 budget and record $25,000 in payments

**Steps:**
1. Navigate to event dashboard
2. Locate "Budget vs Actual" gauge chart
3. Verify data accuracy

**Expected Results:**
- ✅ Chart displays correctly
- ✅ Shows 50% spent (25k of 50k)
- ✅ Color coding appropriate (green/yellow/red zones)
- ✅ Tooltips show exact amounts
- ✅ Responsive on mobile

---

#### Test Case 6.2: View Payment Forecast Line Chart
**Priority**: P1 (High)

**Prerequisite**: Create expenses with various due dates

**Steps:**
1. View dashboard
2. Locate "Payment Forecast" chart
3. Verify timeline shows:
   - Past payments (marked as paid)
   - Upcoming payments (by due date)
   - Event day payment

**Expected Results:**
- ✅ Timeline accurate
- ✅ Past payments marked differently
- ✅ Future payments shown
- ✅ Cumulative total line displayed
- ✅ Interactive tooltips work

---

#### Test Case 6.3: View Category Breakdown Pie Chart
**Priority**: P1 (High)

**Steps:**
1. View dashboard
2. Locate "Category Breakdown" pie chart
3. Verify all categories represented

**Expected Results:**
- ✅ All expense categories shown
- ✅ Percentages add up to 100%
- ✅ Click category to filter expenses
- ✅ Legend shows category names
- ✅ Colors match category settings

---

#### Test Case 6.4: View Quick Stats Dashboard
**Priority**: P1 (High)

**Steps:**
1. View dashboard stats section
2. Verify statistics:
   - Total Budget
   - Total Spent
   - Remaining Budget
   - Number of Expenses
   - Paid Expenses Count
   - Unpaid Expenses Count
   - Overdue Payments

**Expected Results:**
- ✅ All stats accurate
- ✅ Real-time updates when data changes
- ✅ Appropriate formatting (currency, numbers)
- ✅ Color coding for warnings (over budget, overdue)

---

### 7. Data Export

#### Test Case 7.1: Export Event Data (CSV)
**Priority**: P2 (Medium)

**Steps:**
1. Open event
2. Click "Export" or "Download"
3. Select format: CSV
4. Select data to export: All expenses and payments
5. Click "Export"

**Expected Results:**
- ✅ CSV file downloads
- ✅ File contains all expense data
- ✅ File contains payment records
- ✅ Data formatted correctly
- ✅ Can open in Excel/Google Sheets

---

#### Test Case 7.2: Export Event Data (PDF)
**Priority**: P2 (Medium)

**Steps:**
1. Click "Export as PDF"
2. Select report type: Detailed Report
3. Include charts: Yes
4. Click "Generate PDF"

**Expected Results:**
- ✅ PDF generated (may use background job)
- ✅ PDF includes event summary
- ✅ PDF includes expense list
- ✅ PDF includes charts
- ✅ Professional formatting

---

### 8. Account Management

#### Test Case 8.1: Update Profile Information
**Priority**: P2 (Medium)

**Steps:**
1. Navigate to account settings
2. Update display name
3. Update email (if allowed)
4. Update profile photo (if supported)
5. Save changes

**Expected Results:**
- ✅ Profile updated
- ✅ Changes reflected throughout app
- ✅ Confirmation message shown

---

#### Test Case 8.2: Change Password
**Priority**: P2 (Medium)

**Steps:**
1. Navigate to account security
2. Enter current password
3. Enter new password: `NewTestPassword456!`
4. Confirm new password
5. Click "Update Password"

**Expected Results:**
- ✅ Password changed
- ✅ Can sign in with new password
- ✅ Cannot use old password

---

#### Test Case 8.3: Delete Account
**Priority**: P2 (Medium)

**⚠️ Warning**: This is destructive - use test account only

**Steps:**
1. Navigate to account settings
2. Click "Delete Account"
3. Read warning about data deletion
4. Confirm by typing account email
5. Click "Permanently Delete Account"

**Expected Results:**
- ✅ Strong confirmation required
- ✅ All user data deleted
- ✅ All events deleted
- ✅ All expenses and payments deleted
- ✅ Account cannot sign in anymore
- ✅ Email may be reused for new account

---

### 9. Mobile & Responsive Testing

#### Test Case 9.1: Mobile Navigation
**Priority**: P1 (High)

**Device**: iPhone 12 (375x667) or similar

**Steps:**
1. Access app on mobile device
2. Test hamburger menu
3. Navigate between sections
4. Create expense on mobile
5. Record payment on mobile

**Expected Results:**
- ✅ Mobile-friendly navigation
- ✅ All features accessible
- ✅ Text readable (not too small)
- ✅ Buttons tapable (not too small)
- ✅ Forms usable on mobile keyboard

---

#### Test Case 9.2: Tablet Experience
**Priority**: P2 (Medium)

**Device**: iPad (768x1024) or similar

**Steps:**
1. Access app on tablet
2. Test both portrait and landscape
3. Verify chart rendering
4. Test form inputs

**Expected Results:**
- ✅ Optimized layout for tablet
- ✅ Charts render correctly
- ✅ No awkward spacing or overflow

---

#### Test Case 9.3: Text Truncation on Mobile
**Priority**: P2 (Medium)

**Steps:**
1. Create expense with very long name
2. View on mobile device
3. Check breadcrumbs
4. Check expense list

**Expected Results:**
- ✅ Long text truncated with "..."
- ✅ Full text visible on tap/hover
- ✅ Layout doesn't break
- ✅ Tooltip shows full text

---

### 10. Error Handling & Edge Cases

#### Test Case 10.1: Network Error Handling
**Priority**: P1 (High)

**Steps:**
1. Disconnect from internet
2. Try to create expense
3. Observe error handling
4. Reconnect internet
5. Verify data sync

**Expected Results:**
- ✅ Friendly error message shown
- ✅ User notified of network issue
- ✅ No data lost when connection restored
- ✅ Retry mechanism works

---

#### Test Case 10.2: Invalid Data Entry
**Priority**: P1 (High)

**Test invalid inputs:**

| Field | Invalid Input | Expected Result |
|-------|---------------|-----------------|
| Event Date | 01/01/2020 (past) | Error: Date must be in future |
| Expense Amount | -$100 | Error: Amount must be positive |
| Expense Amount | $abc | Error: Invalid number format |
| Email | notanemail | Error: Invalid email format |
| Payment Date | 13/45/2025 | Error: Invalid date |

**Expected Results:**
- ✅ Validation errors shown
- ✅ Form submission blocked
- ✅ Specific error messages
- ✅ Fields highlighted in red

---

#### Test Case 10.3: Concurrent User Actions
**Priority**: P2 (Medium)

**Steps:**
1. Open app in two browser tabs (same account)
2. Edit same expense in both tabs
3. Save changes in tab 1
4. Save different changes in tab 2
5. Observe behavior

**Expected Results:**
- ✅ Conflict detected or last-write wins
- ✅ No data corruption
- ✅ User notified of conflict (ideal)

---

#### Test Case 10.4: Maximum Limits
**Priority**: P2 (Medium)

**Test limits:**
1. Create 100+ expenses in one event
2. Create 50+ events in one account
3. Upload large file (10MB+)
4. Create expense with 50+ payments

**Expected Results:**
- ✅ App handles large datasets
- ✅ Performance acceptable
- ✅ Limits enforced gracefully
- ✅ User notified of limits

---

#### Test Case 10.5: Special Characters & Internationalization
**Priority**: P2 (Medium)

**Test with:**
- Event name: `Émilie's Wedding & Reception!`
- Vendor: `Café "Français" & Co.`
- Amount: `€1.234,56` (European format)
- Notes: `Line 1<br>Line 2` (HTML injection attempt)

**Expected Results:**
- ✅ Special characters handled correctly
- ✅ No encoding issues
- ✅ HTML sanitized (no injection)
- ✅ Unicode characters supported

---

## Regression Testing Checklist

Run this checklist before each release:

### Critical Paths (Must Pass)
- [ ] User can sign up
- [ ] User can sign in
- [ ] User can create event
- [ ] User can create expense
- [ ] User can record payment
- [ ] Dashboard displays correctly
- [ ] Budget calculations accurate
- [ ] Charts render correctly

### Core Features
- [ ] Edit event
- [ ] Delete event
- [ ] Edit expense
- [ ] Delete expense
- [ ] Upload receipt
- [ ] View payment history
- [ ] Export data
- [ ] Sign out

### Data Integrity
- [ ] Budget totals accurate
- [ ] Payment totals accurate
- [ ] No data loss on refresh
- [ ] Concurrent edits handled
- [ ] File uploads work

### UI/UX
- [ ] Mobile responsive
- [ ] Forms validate correctly
- [ ] Error messages clear
- [ ] Loading states shown
- [ ] Success confirmations shown

---

## Cross-Browser & Device Testing

### Desktop Browsers
Test on latest versions:
- [ ] Chrome (Windows)
- [ ] Firefox (Windows)
- [ ] Edge (Windows)
- [ ] Safari (macOS)

### Mobile Devices
- [ ] iPhone Safari (iOS 16+)
- [ ] Chrome Android (latest)
- [ ] Samsung Internet

### Screen Sizes
- [ ] Desktop: 1920x1080
- [ ] Laptop: 1366x768
- [ ] Tablet: 768x1024 (portrait & landscape)
- [ ] Mobile: 375x667
- [ ] Mobile: 414x896

---

## Performance Testing

### Load Time Targets
- [ ] Initial page load: < 3 seconds
- [ ] Dashboard with 50 expenses: < 2 seconds
- [ ] Chart rendering: < 1 second
- [ ] Form submission response: < 1 second

### Network Conditions
Test on:
- [ ] Fast 4G
- [ ] Slow 3G
- [ ] Offline (with proper error handling)

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all forms
- [ ] Submit forms with Enter key
- [ ] Escape closes modals
- [ ] Arrow keys navigate lists (if applicable)

### Screen Reader
- [ ] Form labels read correctly
- [ ] Error messages announced
- [ ] Charts have text alternatives
- [ ] Buttons have descriptive labels

### Visual
- [ ] Color contrast meets WCAG AA
- [ ] Text readable at 200% zoom
- [ ] Focus indicators visible

---

## Test Execution Log Template

Use this template to track test runs:

```
Test Run: [Date]
Tester: [Name]
Environment: [Dev/Staging/Prod]
Browser: [Chrome 120]
Device: [Desktop/Mobile]

Test Results:
- Test Case 1.1: ✅ Pass
- Test Case 1.2: ✅ Pass
- Test Case 2.1: ❌ Fail - Event name validation not working
  - Bug ID: BUG-123
  - Severity: Medium
- Test Case 2.2: ⚠️ Partial - Works on desktop, fails on mobile
  - Bug ID: BUG-124
  - Severity: High

Summary:
- Total Tests: 50
- Passed: 45
- Failed: 3
- Blocked: 2
- Pass Rate: 90%

Blocker Issues:
1. BUG-124 - Mobile event creation fails
2. BUG-126 - Payment recording causes crash on Safari

Notes:
- Performance is slower than expected on slow 3G
- Consider adding loading indicators for chart rendering
```

---

## Bug Report Template

```markdown
**Bug ID**: BUG-XXX
**Title**: [Brief description]
**Severity**: Critical / High / Medium / Low
**Priority**: P0 / P1 / P2 / P3

**Environment**:
- URL: [Environment URL]
- Browser: Chrome 120.0.6099.109
- OS: Windows 11
- Device: Desktop

**Steps to Reproduce**:
1. Navigate to...
2. Click on...
3. Enter...
4. Observe...

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots/Videos**:
[Attach visual evidence]

**Console Errors**:
```
[Paste any console errors]
```

**Additional Notes**:
- Only occurs on mobile
- Intermittent - happens 50% of the time
- Data is not lost, only UI issue
```

---

## Notes for Testers

1. **Always use test data** - Don't use personal or production data
2. **Clear browser cache** between test runs if issues occur
3. **Take screenshots** of any bugs or unexpected behavior
4. **Test on clean accounts** - Create fresh test accounts periodically
5. **Check console errors** - Open browser DevTools to catch JavaScript errors
6. **Test data cleanup** - Delete test events/expenses after testing if needed
7. **Report blockers immediately** - Don't wait if critical bugs found
8. **Test incrementally** - Don't try to test everything at once
9. **Verify fixes** - Re-test bug fixes before marking as resolved
10. **Document workarounds** - If bugs exist, document temporary workarounds

---

## Success Criteria

A test run is considered successful when:
- ✅ All P0 (Critical) tests pass
- ✅ All P1 (High) tests pass
- ✅ 90%+ of P2 (Medium) tests pass
- ✅ No critical or high severity bugs
- ✅ Core user flows work end-to-end
- ✅ Application usable on mobile and desktop
- ✅ Data integrity maintained
- ✅ Performance within acceptable limits

---

**End of Manual Test Plan**

For questions or issues with this test plan, contact the development team.
