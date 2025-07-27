import React from 'react'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
  className?: string
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  const variantClasses = {
    default: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    info: 'bg-primary-100 text-primary-800',
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`
  
  return (
    <span className={classes}>
      {children}
    </span>
  )
}

export default Badge 