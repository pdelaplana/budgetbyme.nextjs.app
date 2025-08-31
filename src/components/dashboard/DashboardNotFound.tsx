import DashboardLayout from '@/components/dashboard/DashboardLayout';
import NotFoundState from '@/components/ui/NotFoundState';

interface DashboardNotFoundProps {
  entityType: string; // 'Event', 'Category', 'Expense', etc.
  onBack: () => void;
  backButtonText?: string;
  icon?: string;
  customMessage?: string;
}

export default function DashboardNotFound({
  entityType,
  onBack,
  backButtonText = `Back to ${entityType === 'Event' ? 'Events' : 'Dashboard'}`,
  icon = entityType === 'Event' ? '📅' : '📋',
  customMessage,
}: DashboardNotFoundProps) {
  const defaultMessage =
    customMessage ||
    `The ${entityType.toLowerCase()} you're looking for doesn't exist or you don't have access to it.`;

  return (
    <DashboardLayout>
      <NotFoundState
        title={`${entityType} Not Found`}
        message={defaultMessage}
        buttonText={backButtonText}
        onButtonClick={onBack}
        icon={icon}
        className='flex items-center justify-center'
      />
    </DashboardLayout>
  );
}
