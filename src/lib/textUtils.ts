// Moved to @budgetbyme/ui — re-exported here so existing app call sites
// (`@/lib/textUtils`) keep working unchanged. See packages/ui/src/utils/textUtils.ts.
export type { TruncateOptions } from '@budgetbyme/ui';
export {
  truncateForBreadcrumb,
  truncateForMobile,
  truncateText,
} from '@budgetbyme/ui';
