'use client';

import ActionDropdown from './ActionDropdown';

interface DropdownItem {
  id: string;
  label: string;
  icon: string;
}

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  dropdownItems: DropdownItem[];
  isDropdownOpen: boolean;
  onDropdownToggle: () => void;
  onDropdownClose: () => void;
  onDropdownAction: (actionId: string) => void;
  isRecalculatingTotals?: boolean;
}

export default function DashboardHeader({
  title = 'Dashboard',
  subtitle = 'Track your progress and manage your budget',
  dropdownItems,
  isDropdownOpen,
  onDropdownToggle,
  onDropdownClose,
  onDropdownAction,
  isRecalculatingTotals = false,
}: DashboardHeaderProps) {
  return (
    <div className="bg-slate-100 border-b border-gray-200 mb-4">
      <div className="py-4">
        <div className="flex items-start justify-between">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">{subtitle}</p>
          </div>

          <ActionDropdown
            isOpen={isDropdownOpen}
            onToggle={onDropdownToggle}
            onClose={onDropdownClose}
            onActionSelect={onDropdownAction}
            items={dropdownItems}
            isRecalculatingTotals={isRecalculatingTotals}
          />
        </div>
      </div>
    </div>
  );
}