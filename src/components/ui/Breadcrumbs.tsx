'use client'

import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import type React from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({
  items,
  className = '',
}: BreadcrumbsProps) {
  const router = useRouter()

  const handleClick = (href: string) => {
    router.push(href)
  }

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const IconComponent = item.icon

          return (
            <li key={index} className="flex items-center">
              {/* Separator (except for first item) */}
              {index > 0 && (
                <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" />
              )}

              {/* Breadcrumb Item */}
              <div className="flex items-center">
                {IconComponent && (
                  <IconComponent className="h-4 w-4 text-gray-500 mr-1.5 flex-shrink-0" />
                )}

                {item.href && !isLast ? (
                  <button
                    onClick={() => handleClick(item.href!)}
                    className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors duration-200 truncate max-w-32 sm:max-w-none"
                    title={item.label}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span
                    className={`text-sm font-medium truncate max-w-32 sm:max-w-none ${
                      isLast ? 'text-gray-900' : 'text-gray-600'
                    }`}
                    title={item.label}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
