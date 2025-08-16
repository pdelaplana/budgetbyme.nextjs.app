# React Query DevTools Setup

## What's Installed

✅ **@tanstack/react-query**: Core React Query library  
✅ **@tanstack/react-query-devtools**: Developer tools for debugging queries

## How to Use the DevTools

### 1. **Start Development Server**
```bash
npm run dev
```

### 2. **Find the DevTools Button**
- Look for a **React Query logo button** in the **bottom-left corner** of your browser
- The button only appears in development mode
- It's a floating circular button with the React Query logo

### 3. **Open DevTools**
- Click the React Query button to open the DevTools panel
- The panel will slide up from the bottom of the screen

### 4. **What You Can See**

#### **Queries Tab**
- All active queries and their status
- Query keys, data, error states
- Fresh/stale/inactive status
- Last updated timestamps

#### **Mutations Tab**
- All mutations (create, update, delete operations)
- Mutation status and results
- Error states and retry information

#### **Query Cache**
- Cached data structure
- Cache entry details
- Data freshness indicators

#### **Settings**
- Position preferences
- Theme settings
- Expanded/collapsed state

### 5. **Demo Features**

Visit `/profile` to see the demo component with:

- **Example Query**: Shows loading, error, and success states
- **Example Mutation**: Demonstrates mutations and cache invalidation
- **Real-time Status**: Watch query/mutation states change

### 6. **DevTools Features**

#### **Query Inspection**
- Click any query to see detailed information
- View query data, error messages, and metadata
- See query lifecycle and state transitions

#### **Manual Actions**
- **Refetch**: Force re-run queries
- **Invalidate**: Mark queries as stale
- **Remove**: Clear queries from cache
- **Reset**: Reset error states

#### **Cache Management**
- See what's cached and for how long
- Monitor memory usage
- Track cache hits/misses

### 7. **Useful Shortcuts**

- **Toggle DevTools**: Click the floating button
- **Minimize/Expand**: Click the header
- **Close**: Click the X button or press Escape

### 8. **Production Notes**

⚠️ **DevTools are automatically disabled in production builds**  
- The floating button won't appear
- No performance impact on production
- No bundle size increase in production

### 9. **Configuration**

The DevTools are configured in `src/components/providers/QueryClientProvider.tsx`:

```typescript
<ReactQueryDevtools 
  initialIsOpen={false}        // Start closed
  buttonPosition="bottom-left"  // Button placement
  position="bottom"            // Panel position
/>
```

### 10. **Custom Query Client Settings**

Default configuration includes:
- **Stale Time**: 1 minute
- **GC Time**: 5 minutes  
- **Retry**: 1 attempt
- **Window Focus Refetch**: Disabled

## Troubleshooting

### DevTools Button Not Showing
1. Make sure you're in development mode (`npm run dev`)
2. Check browser console for errors
3. Ensure React Query is properly set up

### Queries Not Appearing
1. Make sure queries are actually running
2. Check if queries have proper `queryKey`
3. Verify QueryClient is provided in component tree

### Performance Issues
1. DevTools only run in development
2. Close DevTools panel when not needed
3. Check query frequency and caching settings

## Next Steps

1. **Replace Demo**: Remove the demo component when done testing
2. **Add Real Queries**: Create actual API queries for your app
3. **Monitor Performance**: Use DevTools to optimize query behavior
4. **Cache Strategy**: Tune stale times and cache duration based on your needs
