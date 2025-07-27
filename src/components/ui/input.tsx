import React from 'react'

interface InputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'url'
  disabled?: boolean
  error?: string
  required?: boolean
  className?: string
  name?: string
  id?: string
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error,
  required = false,
  className = '',
  name,
  id,
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`
  
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0'
  const stateClasses = error 
    ? 'border-error-300 focus:ring-error-500 focus:border-error-500' 
    : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500'
  const disabledClasses = disabled ? 'bg-secondary-50 cursor-not-allowed' : 'bg-white'
  const classes = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={classes}
      />
      {error && (
        <p className="text-sm text-error-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input 