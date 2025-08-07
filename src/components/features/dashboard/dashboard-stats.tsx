import React from 'react'
import { Card } from '@/components/ui/card'
import type { DashboardStats as DashboardStatsType } from '@/types'

interface DashboardStatsProps {
  stats: DashboardStatsType
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total CVs',
      value: stats.total_cvs,
      change: '+12%',
      changeType: 'increase' as const,
      icon: 'FileText',
      color: 'primary',
    },
    {
      title: 'Processed CVs',
      value: stats.processed_cvs,
      change: '+8%',
      changeType: 'increase' as const,
      icon: 'CheckCircle',
      color: 'success',
    },
    {
      title: 'Total Websites',
      value: stats.total_websites,
      change: '+15%',
      changeType: 'increase' as const,
      icon: 'Globe',
      color: 'warning',
    },
    {
      title: 'Live Websites',
      value: stats.live_websites,
      change: '+5%',
      changeType: 'increase' as const,
      icon: 'Zap',
      color: 'success',
    },
  ]

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: string } = {
      FileText: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      CheckCircle: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      Globe: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      Zap: 'M13 10V3L4 14h7v7l9-11h-7z',
    }
    return icons[iconName] || icons['FileText']
  }

  const getColorClasses = (color: string) => {
    const colors = {
      primary: 'bg-primary-100 text-primary-600',
      success: 'bg-success-100 text-success-600',
      warning: 'bg-warning-100 text-warning-600',
      error: 'bg-error-100 text-error-600',
    }
    return colors[color as keyof typeof colors] || colors.primary
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
              <p className="text-3xl font-bold text-secondary-900 mt-2">{stat.value}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-success-600' : 'text-error-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-secondary-500 ml-1">from last month</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIcon(stat.icon)} />
              </svg>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default DashboardStats 