import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface DashboardErrorStateProps {
  error: string;
  onRetry?: () => void;
  backButtonText?: string;
  onBack: () => void;
}

export default function DashboardErrorState({
  error,
  onRetry,
  backButtonText = 'Back to Events',
  onBack,
}: DashboardErrorStateProps) {
  return (
    <DashboardLayout>
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Error Loading Event
          </h2>
          <p className='text-gray-600 mb-4'>{error}</p>
          <div className='flex gap-3 justify-center'>
            {onRetry && (
              <button type='button' onClick={onRetry} className='btn-secondary'>
                Try Again
              </button>
            )}
            <button type='button' onClick={onBack} className='btn-primary'>
              {backButtonText}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
