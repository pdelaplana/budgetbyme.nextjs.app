'use client';

import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({
  variant = 'full',
  size = 'md',
  className = '',
}: LogoProps) {
  const sizeConfig = {
    sm: {
      circle: 16,
      circleRadius: 14,
      pathScale: 0.8,
      textSize: 12,
      subtextSize: 8,
      width: variant === 'full' ? 90 : 32,
      height: 32,
    },
    md: {
      circle: 24,
      circleRadius: 22,
      pathScale: 1.2,
      textSize: 20,
      subtextSize: 13,
      width: variant === 'full' ? 140 : 48,
      height: 48,
    },
    lg: {
      circle: 40,
      circleRadius: 38,
      pathScale: 2,
      textSize: 30,
      subtextSize: 20,
      width: variant === 'full' ? 220 : 80,
      height: 80,
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        className='flex-shrink-0'
      >
        {/* Green circle background */}
        <circle
          cx={config.circle}
          cy={config.circle}
          r={config.circleRadius}
          fill='#059669'
        />

        {/* Letter "B" */}
        <path
          d={`M${14 * config.pathScale} ${12 * config.pathScale} 
              L${14 * config.pathScale} ${28 * config.pathScale} 
              L${20 * config.pathScale} ${28 * config.pathScale} 
              Q${24 * config.pathScale} ${28 * config.pathScale} ${24 * config.pathScale} ${24 * config.pathScale} 
              Q${24 * config.pathScale} ${20 * config.pathScale} ${20 * config.pathScale} ${20 * config.pathScale} 
              L${14 * config.pathScale} ${20 * config.pathScale} 
              M${14 * config.pathScale} ${20 * config.pathScale} 
              L${19 * config.pathScale} ${20 * config.pathScale} 
              Q${22 * config.pathScale} ${20 * config.pathScale} ${22 * config.pathScale} ${16 * config.pathScale} 
              Q${22 * config.pathScale} ${12 * config.pathScale} ${19 * config.pathScale} ${12 * config.pathScale} 
              L${14 * config.pathScale} ${12 * config.pathScale}`}
          fill='#F0FDF4'
          stroke='none'
        />

        {variant === 'full' && (
          <>
            {/* Progress bars */}
            <rect
              x={26 * config.pathScale}
              y={16 * config.pathScale}
              width={4 * config.pathScale}
              height={2 * config.pathScale}
              fill='#F0FDF4'
              rx={1 * config.pathScale}
            />
            <rect
              x={26 * config.pathScale}
              y={20 * config.pathScale}
              width={6 * config.pathScale}
              height={2 * config.pathScale}
              fill='#F0FDF4'
              rx={1 * config.pathScale}
            />
            <rect
              x={26 * config.pathScale}
              y={24 * config.pathScale}
              width={3 * config.pathScale}
              height={2 * config.pathScale}
              fill='#F0FDF4'
              rx={1 * config.pathScale}
            />

            {/* Text */}
            <text
              x={45 * config.pathScale}
              y={16 * config.pathScale}
              fontFamily='Inter, system-ui, -apple-system, sans-serif'
              fontSize={config.textSize}
              fontWeight='800'
              fill='#1F2937'
              letterSpacing='-0.025em'
            >
              Budget
            </text>
            <text
              x={45 * config.pathScale}
              y={30 * config.pathScale}
              fontFamily='Inter, system-ui, -apple-system, sans-serif'
              fontSize={config.subtextSize}
              fontWeight='500'
              fill='#6B7280'
              letterSpacing='0.025em'
            >
              By Me
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
