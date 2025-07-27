'use client'

import { useState } from 'react'

interface StyleSelectorProps {
  onStyleChange?: (style: WebsiteStyle) => void
}

export interface WebsiteStyle {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    fontSize: 'small' | 'medium' | 'large'
  }
  layout: {
    style: 'minimal' | 'modern' | 'creative' | 'professional'
    spacing: 'compact' | 'comfortable' | 'spacious'
  }
  visuals: {
    illustrations: 'none' | 'minimal' | 'detailed'
    icons: 'outlined' | 'filled' | 'duotone'
    shadows: 'none' | 'subtle' | 'prominent'
  }
}

const colorSchemes = [
  {
    name: 'Professional Blue',
    colors: {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937'
    }
  },
  {
    name: 'Creative Purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#5b21b6',
      accent: '#a855f7',
      background: '#ffffff',
      text: '#1f2937'
    }
  },
  {
    name: 'Modern Green',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#ffffff',
      text: '#1f2937'
    }
  },
  {
    name: 'Warm Orange',
    colors: {
      primary: '#ea580c',
      secondary: '#c2410c',
      accent: '#f97316',
      background: '#ffffff',
      text: '#1f2937'
    }
  }
]

const fontOptions = [
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Montserrat', value: 'Montserrat' }
]

const layoutStyles = [
  { name: 'Minimal', value: 'minimal', description: 'Clean and simple design' },
  { name: 'Modern', value: 'modern', description: 'Contemporary with subtle effects' },
  { name: 'Creative', value: 'creative', description: 'Bold and artistic layout' },
  { name: 'Professional', value: 'professional', description: 'Corporate and formal style' }
]

export default function StyleSelector({ onStyleChange }: StyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<WebsiteStyle>({
    colors: colorSchemes[0].colors,
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      fontSize: 'medium'
    },
    layout: {
      style: 'modern',
      spacing: 'comfortable'
    },
    visuals: {
      illustrations: 'minimal',
      icons: 'outlined',
      shadows: 'subtle'
    }
  })

  const handleStyleChange = (updates: Partial<WebsiteStyle>) => {
    const newStyle = { ...selectedStyle, ...updates }
    setSelectedStyle(newStyle)
    onStyleChange?.(newStyle)
  }

  return (
    <div className="space-y-8">
      {/* Color Scheme */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.name}
              onClick={() => handleStyleChange({ colors: scheme.colors })}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedStyle.colors.primary === scheme.colors.primary
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex space-x-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: scheme.colors.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: scheme.colors.secondary }}
                />
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: scheme.colors.accent }}
                />
              </div>
              <p className="text-sm font-medium text-gray-900">{scheme.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heading Font
            </label>
            <select
              value={selectedStyle.typography.headingFont}
              onChange={(e) =>
                handleStyleChange({
                  typography: { ...selectedStyle.typography, headingFont: e.target.value }
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Font
            </label>
            <select
              value={selectedStyle.typography.bodyFont}
              onChange={(e) =>
                handleStyleChange({
                  typography: { ...selectedStyle.typography, bodyFont: e.target.value }
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Layout Style */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Style</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {layoutStyles.map((layout) => (
            <button
              key={layout.value}
              onClick={() =>
                handleStyleChange({
                  layout: { ...selectedStyle.layout, style: layout.value as any }
                })
              }
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedStyle.layout.style === layout.value
                  ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{layout.name}</p>
              <p className="text-sm text-gray-600 mt-1">{layout.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Elements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Elements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Illustrations
            </label>
            <select
              value={selectedStyle.visuals.illustrations}
              onChange={(e) =>
                handleStyleChange({
                  visuals: { ...selectedStyle.visuals, illustrations: e.target.value as any }
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">None</option>
              <option value="minimal">Minimal</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icons Style
            </label>
            <select
              value={selectedStyle.visuals.icons}
              onChange={(e) =>
                handleStyleChange({
                  visuals: { ...selectedStyle.visuals, icons: e.target.value as any }
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="outlined">Outlined</option>
              <option value="filled">Filled</option>
              <option value="duotone">Duotone</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shadows
            </label>
            <select
              value={selectedStyle.visuals.shadows}
              onChange={(e) =>
                handleStyleChange({
                  visuals: { ...selectedStyle.visuals, shadows: e.target.value as any }
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">None</option>
              <option value="subtle">Subtle</option>
              <option value="prominent">Prominent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Style Preview</h3>
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: selectedStyle.colors.background,
            color: selectedStyle.colors.text,
            fontFamily: selectedStyle.typography.bodyFont
          }}
        >
          <h4
            className="text-xl font-bold mb-2"
            style={{
              color: selectedStyle.colors.primary,
              fontFamily: selectedStyle.typography.headingFont
            }}
          >
            Sample Heading
          </h4>
          <p className="mb-4">
            This is how your website will look with the selected style. The colors, fonts, and
            visual elements will be applied to create your professional website.
          </p>
          <button
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: selectedStyle.colors.primary,
              color: 'white'
            }}
          >
            Sample Button
          </button>
        </div>
      </div>
    </div>
  )
} 