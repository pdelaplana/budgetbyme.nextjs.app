'use client';

import { ActionDropdown, type ActionDropdownOption } from '@budgetbyme/ui';
import type { DashboardAction } from '@/constants/dashboardActions';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  dropdownItems: DashboardAction[];
  onDropdownAction: (actionId: string) => void;
  isRecalculatingTotals?: boolean;
}

export default function DashboardHeader({
  title = 'Dashboard',
  subtitle = 'Track your progress and manage your budget',
  dropdownItems,
  onDropdownAction,
  isRecalculatingTotals = false,
}: DashboardHeaderProps) {
  const options: ActionDropdownOption[] = dropdownItems.map((item) => {
    const isRecalculate = item.id === 'recalculate-totals';
    return {
      id: item.id,
      label: item.label,
      icon: item.icon,
      onClick: () => onDropdownAction(item.id),
      loading: isRecalculate ? isRecalculatingTotals : undefined,
      loadingLabel: isRecalculate ? 'Recalculating...' : undefined,
    };
  });

  return (
    <div className='bg-slate-100 border-b border-gray-200 mb-4'>
      <div className='py-4'>
        <div className='flex items-start justify-between'>
          <div className='text-left'>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2'>
              {title}
            </h1>
            <p className='text-sm sm:text-base text-gray-600'>{subtitle}</p>
          </div>

          <ActionDropdown
            variant='single'
            triggerLabel='Actions'
            options={options}
          />
        </div>
      </div>
    </div>
  );
}
