# Utility Libraries

This directory contains reusable utility functions used throughout the BudgetByMe application.

## Formatters (`formatters.ts`)

Centralized formatting utilities for consistent data display across the application.

### Currency Formatting

#### `formatCurrency(amount: number): string`
Formats currency amounts without cents for clean display.

```typescript
import { formatCurrency } from '@/lib/formatters';

formatCurrency(1234.56)  // "$1,235"
formatCurrency(0)        // "$0" 
formatCurrency(-100.50)  // "-$100"
```

**Use cases:**
- Budget summaries
- Category totals
- Dashboard widgets
- Quick stats

#### `formatCurrencyWithCents(amount: number): string`
Formats currency amounts with cents for precise display.

```typescript
import { formatCurrencyWithCents } from '@/lib/formatters';

formatCurrencyWithCents(1234.56)  // "$1,234.56"
formatCurrencyWithCents(100)      // "$100.00"
formatCurrencyWithCents(-50.25)   // "-$50.25"
```

**Use cases:**
- Payment amounts
- Transaction details
- Invoice line items
- Precise calculations

#### `sanitizeCurrencyInput(value: string): number`
Cleans user input by removing non-numeric characters except decimal points.

```typescript
import { sanitizeCurrencyInput } from '@/lib/formatters';

sanitizeCurrencyInput('$1,234.56')     // 1234.56
sanitizeCurrencyInput('USD 500.00')    // 500
sanitizeCurrencyInput('abc')           // 0
sanitizeCurrencyInput('')              // 0
```

**Use cases:**
- Form input processing
- Copy/paste handling
- Data validation
- User input cleanup

### Date Formatting

#### `formatDate(dateValue: Date): string`
Formats dates in short, readable format.

```typescript
import { formatDate } from '@/lib/formatters';

formatDate(new Date('2024-03-15'))  // "Mar 15, 2024"
formatDate(new Date('2024-12-25'))  // "Dec 25, 2024"
```

**Use cases:**
- Expense dates
- Payment due dates
- Event dates
- Timeline displays

#### `formatDateLong(dateValue: Date): string`
Formats dates in long format with day of week.

```typescript
import { formatDateLong } from '@/lib/formatters';

formatDateLong(new Date('2024-03-15'))  // "Friday, March 15, 2024"
formatDateLong(new Date('2024-12-25'))  // "Wednesday, December 25, 2024"
```

**Use cases:**
- Detailed views
- Profile information
- Important dates
- Event details

#### `formatDateTime(dateValue: Date): string`
Formats dates with time information.

```typescript
import { formatDateTime } from '@/lib/formatters';

formatDateTime(new Date('2024-03-15T14:30:00'))  // "Mar 15, 2024, 2:30 PM"
formatDateTime(new Date('2024-12-25T09:00:00'))  // "Dec 25, 2024, 9:00 AM"
```

**Use cases:**
- Created/updated timestamps
- Payment timestamps
- Activity logs
- Audit trails

### Percentage Formatting

#### `formatPercentage(value: number): string`
Formats percentage values rounded to the nearest integer.

```typescript
import { formatPercentage } from '@/lib/formatters';

formatPercentage(45.1)   // "45%"
formatPercentage(45.5)   // "46%"
formatPercentage(99.8)   // "100%"
formatPercentage(0)      // "0%"
```

**Use cases:**
- Budget vs actual percentages
- Category breakdown displays
- Progress indicators
- Spending statistics

## Usage Guidelines

### Import Pattern
Always import from the centralized utility library:

```typescript
// ✅ Correct
import { formatCurrency, formatDate, formatPercentage } from '@/lib/formatters';

// ❌ Avoid creating local formatting functions
const formatCurrency = (amount) => { /* ... */ };
```

### Error Handling
All formatter functions handle edge cases gracefully:

```typescript
formatCurrency(NaN)        // "$0"
formatCurrency(null)       // "$0"
formatCurrency(undefined)  // "$0"
formatPercentage(NaN)      // "0%"
sanitizeCurrencyInput('')  // 0
```

### Type Safety
All functions are fully typed and accept the correct parameter types:

```typescript
// Date functions expect Date objects
formatDate(new Date('2024-03-15'))        // ✅ Correct
formatDate('2024-03-15')                  // ❌ TypeScript error

// String functions for user input processing
sanitizeCurrencyInput('$100.00')          // ✅ Correct
sanitizeCurrencyInput(100)                // ❌ TypeScript error
```

### Testing
All formatters have comprehensive unit tests covering:
- Normal use cases
- Edge cases and invalid inputs
- Boundary conditions
- Integration scenarios

Run the tests with:
```bash
npm test formatters
```

## Contributing

When adding new utility functions:

1. Add the function to the appropriate file (or create a new one)
2. Export it from the main module
3. Add comprehensive unit tests
4. Update this documentation
5. Follow existing naming conventions
6. Handle edge cases gracefully
7. Use TypeScript for full type safety

## Future Enhancements

Planned utility additions:
- Number formatting (decimals, thousands separators)
- Validation utilities (email, phone, etc.)
- Text processing utilities
- Array/object manipulation helpers
- Date calculation utilities