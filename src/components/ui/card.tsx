import React from 'react'
import { CardProps } from '@/types'

const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  className = '',
  onClick,
  hover = false,
}) => {
  const baseClasses = 'bg-white rounded-xl border border-secondary-200 shadow-soft overflow-hidden'
  const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-medium hover:border-secondary-300 cursor-pointer' : ''
  const classes = `${baseClasses} ${hoverClasses} ${className}`
  
  return (
    <div className={classes} onClick={onClick}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-secondary-100">
          {title && (
            <h3 className="text-lg font-semibold text-secondary-900 mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-secondary-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

export default Card 