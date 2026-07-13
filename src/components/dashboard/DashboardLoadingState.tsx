import { LoadingSpinner } from '@budgetbyme/ui';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface DashboardLoadingStateProps {
  title?: string;
  message?: string;
}

export default function DashboardLoadingState({
  title = 'Loading Event...',
  message = 'Please wait while we load your event data',
}: DashboardLoadingStateProps) {
  return (
    <DashboardLayout>
      <LoadingSpinner title={title} message={message} />
    </DashboardLayout>
  );
}
