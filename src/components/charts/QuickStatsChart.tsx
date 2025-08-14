'use client'

import React from 'react'

interface QuickStatsData {
  totalBudget: number
  totalSpent: number
  categories: number
  paymentsDue: number
  eventDate: string
}

interface QuickStatsChartProps {
  data: QuickStatsData
}

export default function QuickStatsChart({ data }: QuickStatsChartProps) {
  const budgetUsedPercentage = Math.round(
    (data.totalSpent / data.totalBudget) * 100,
  )

  const calculateDaysToEvent = (eventDate: string) => {
    const today = new Date()
    const event = new Date(eventDate)
    const diffTime = event.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const daysToEvent = calculateDaysToEvent(data.eventDate)

  const stats = [
    {
      id: 'budget-used',
      label: 'Budget Used',
      value: `${budgetUsedPercentage}%`,
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      icon: '💰',
    },
    {
      id: 'categories',
      label: 'Categories',
      value: data.categories,
      bgColor: 'bg-success-50',
      textColor: 'text-success-600',
      icon: '📊',
    },
    {
      id: 'due-soon',
      label: 'Due Soon',
      value: data.paymentsDue,
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-600',
      icon: '⏰',
    },
    {
      id: 'days-to-event',
      label: 'Days to Event',
      value: daysToEvent,
      bgColor: 'bg-celebration-50',
      textColor: 'text-celebration-600',
      icon: '🎉',
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="py-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`${stat.bgColor} rounded-xl p-4 sm:p-6 text-center transition-transform duration-200 hover:scale-105`}
          >
            <div className="text-2xl sm:text-3xl mb-2">{stat.icon}</div>
            <div
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.textColor} mb-1`}
            >
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Budget Summary */}
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Budget Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.totalBudget)}
            </div>
            <div className="text-sm text-gray-600">Total Budget</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">
              {formatCurrency(data.totalSpent)}
            </div>
            <div className="text-sm text-gray-600">Amount Spent</div>
          </div>
          <div>
            <div
              className={`text-2xl font-bold ${
                (data.totalBudget - data.totalSpent) >= 0
                  ? 'text-success-600'
                  : 'text-danger-600'
              }`}
            >
              {formatCurrency(Math.abs(data.totalBudget - data.totalSpent))}
            </div>
            <div className="text-sm text-gray-600">
              {data.totalBudget - data.totalSpent >= 0
                ? 'Remaining'
                : 'Over Budget'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {budgetUsedPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                budgetUsedPercentage <= 80
                  ? 'bg-success-500'
                  : budgetUsedPercentage <= 100
                    ? 'bg-primary-500'
                    : 'bg-danger-500'
              }`}
              style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Key Insights
        </h3>
        <div className="space-y-3">
          {budgetUsedPercentage > 100 && (
            <div className="flex items-center p-3 bg-danger-50 rounded-lg">
              <span className="text-lg mr-3">⚠️</span>
              <div>
                <div className="font-medium text-danger-800">
                  Over Budget Alert
                </div>
                <div className="text-sm text-danger-600">
                  You've exceeded your budget by{' '}
                  {formatCurrency(data.totalSpent - data.totalBudget)}
                </div>
              </div>
            </div>
          )}

          {data.paymentsDue > 0 && (
            <div className="flex items-center p-3 bg-warning-50 rounded-lg">
              <span className="text-lg mr-3">💸</span>
              <div>
                <div className="font-medium text-warning-800">
                  Upcoming Payments
                </div>
                <div className="text-sm text-warning-600">
                  {data.paymentsDue} payment{data.paymentsDue > 1 ? 's' : ''}{' '}
                  due soon
                </div>
              </div>
            </div>
          )}

          {daysToEvent <= 30 && daysToEvent > 0 && (
            <div className="flex items-center p-3 bg-celebration-50 rounded-lg">
              <span className="text-lg mr-3">🗓️</span>
              <div>
                <div className="font-medium text-celebration-800">
                  Event Approaching
                </div>
                <div className="text-sm text-celebration-600">
                  Only {daysToEvent} day{daysToEvent > 1 ? 's' : ''} until your
                  event!
                </div>
              </div>
            </div>
          )}

          {budgetUsedPercentage <= 80 && daysToEvent > 30 && (
            <div className="flex items-center p-3 bg-success-50 rounded-lg">
              <span className="text-lg mr-3">✅</span>
              <div>
                <div className="font-medium text-success-800">On Track</div>
                <div className="text-sm text-success-600">
                  You're managing your budget well and have plenty of time!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
