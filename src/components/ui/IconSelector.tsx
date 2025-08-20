'use client';

const AVAILABLE_ICONS = [
  '🏛️', '🍰', '📸', '👗', '💐', '🎵', '🚗', '✉️', 
  '🎂', '🍾', '💎', '🎁', '📋', '🏨', '💒', '🎉', 
  '💄', '🌟', '🎊', '🎭', '🎪', '🎨', '🎯', '⭐'
];

interface IconSelectorProps {
  value: string;
  onChange: (icon: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function IconSelector({
  value,
  onChange,
  disabled = false,
  error,
}: IconSelectorProps) {
  const handleSelect = (icon: string) => {
    onChange(icon);
  };

  return (
    <div>
      <div className='grid grid-cols-6 sm:grid-cols-8 gap-3 mt-2'>
        {AVAILABLE_ICONS.map((icon) => (
          <button
            key={icon}
            type='button'
            onClick={() => handleSelect(icon)}
            disabled={disabled}
            className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
              value === icon
                ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} flex items-center justify-center`}
            aria-label={`Select icon ${icon}`}
          >
            <span className="text-xl">{icon}</span>
          </button>
        ))}
      </div>
      {error && (
        <p className='mt-1 text-sm text-red-600'>{error}</p>
      )}
    </div>
  );
}