'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import CVUploader from '../cv-upload/cv-uploader'
import CVList from '../cv-upload/cv-list'
import StyleSelector, { WebsiteStyle } from '../style-selector/style-selector'
import WebsiteGenerator from '../website-generator/website-generator'
import WebsitePreview from '../website-preview/website-preview'

interface WorkflowProps {
  userId: string
}

type WorkflowStep = 'upload' | 'style' | 'generate' | 'preview'

export default function Workflow({ userId }: WorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload')
  const [cvData, setCvData] = useState<any>(null)
  const [selectedStyle, setSelectedStyle] = useState<WebsiteStyle | undefined>(undefined)
  const [generatedWebsite, setGeneratedWebsite] = useState<any>(null)
  const [tempStyle, setTempStyle] = useState<WebsiteStyle | undefined>(undefined)

  const steps = [
    { id: 'upload', title: 'Upload CV', description: 'Upload your CV file' },
    { id: 'style', title: 'Choose Style', description: 'Select your preferred design' },
    { id: 'generate', title: 'Generate', description: 'Create your website' },
    { id: 'preview', title: 'Preview', description: 'Review and deploy' }
  ]

  const handleCVUploaded = (documentId: string) => {
    setCvData({ documentId })
    setCurrentStep('style')
  }

  const handleCVSelected = (documentId: string) => {
    if (documentId) {
      setCvData({ documentId })
      setCurrentStep('style')
    }
  }

  const handleStyleChange = (style: WebsiteStyle) => {
    setTempStyle(style)
  }

  const handleStyleContinue = (style: WebsiteStyle) => {
    setSelectedStyle(style)
    setCurrentStep('generate')
  }

  const handleWebsiteGenerated = (website: any) => {
    setGeneratedWebsite(website)
    setCurrentStep('preview')
  }

  const getStepIndex = (step: WorkflowStep) => {
    return steps.findIndex(s => s.id === step)
  }

  return (
    <div className="w-full">
      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = getStepIndex(step.id as WorkflowStep) < getStepIndex(currentStep)
            const isUpcoming = getStepIndex(step.id as WorkflowStep) > getStepIndex(currentStep)

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500
                    ${isActive ? 'bg-blue-600 text-white scale-110 shadow-lg' : ''}
                    ${isCompleted ? 'bg-gray-100 text-gray-600' : ''}
                    ${isUpcoming ? 'bg-gray-50 text-gray-400' : ''}
                  `}>
                    {isCompleted ? (
                      <span className="text-xl">✓</span>
                    ) : (
                      <span className="text-lg font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className={`font-semibold mb-1 transition-colors duration-300
                      ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-8 transition-all duration-500
                    ${isCompleted ? 'bg-gray-300' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[600px]">
        {currentStep === 'upload' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-2xl">📄</span>
              </div>
              <h2 className="text-headline-1 mb-4 text-gray-900">Upload Your CV</h2>
              <p className="text-body-1 text-gray-600 max-w-2xl mx-auto text-balance">
                Start by uploading your CV or selecting a previously uploaded one. We'll extract all the information and prepare it for your website.
              </p>
            </div>
            
            <div className="space-y-8">
              {/* Previously Uploaded CVs */}
              <div className="card card-elevated p-8">
                <CVList 
                  userId={userId} 
                  onSelectCV={handleCVSelected}
                  selectedCVId={cvData?.documentId}
                />
              </div>

              {/* Upload New CV */}
              <div className="card card-elevated p-8">
                <div className="text-center mb-6">
                  <h3 className="text-headline-3 mb-2 text-gray-900">Upload New CV</h3>
                  <p className="text-body-2 text-gray-600">Or upload a new CV file</p>
                </div>
                <CVUploader onUploaded={handleCVUploaded} userId={userId} />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'style' && (
          <div className="animate-slide-up">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-2xl">🎨</span>
              </div>
              <h2 className="text-headline-1 mb-4 text-gray-900">Choose Your Style</h2>
              <p className="text-body-1 text-gray-600 max-w-2xl mx-auto text-balance">
                Select from our curated collection of professional website templates.
              </p>
            </div>
            <div className="card card-elevated p-8">
              <StyleSelector 
                onStyleChange={handleStyleChange} 
                onContinue={handleStyleContinue}
              />
            </div>
          </div>
        )}

        {currentStep === 'generate' && (
          <div className="animate-scale-in">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-2xl">🚀</span>
              </div>
              <h2 className="text-headline-1 mb-4 text-gray-900">Generate Your Website</h2>
              <p className="text-body-1 text-gray-600 max-w-2xl mx-auto text-balance">
                Our AI will create a stunning website from your CV and selected style.
              </p>
            </div>
            <div className="card card-elevated p-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-4xl">⚡</span>
                </div>
                <h3 className="text-headline-3 mb-4 text-gray-900">Processing Your CV</h3>
                <p className="text-body-2 text-gray-600">
                  We're analyzing your CV and generating your website...
                </p>
              </div>
              <WebsiteGenerator 
                cvDocumentId={cvData?.documentId}
                selectedStyle={selectedStyle}
              />
            </div>
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-2xl">✨</span>
              </div>
              <h2 className="text-headline-1 mb-4 text-gray-900">Your Website is Ready!</h2>
              <p className="text-body-1 text-gray-600 max-w-2xl mx-auto text-balance">
                Preview your website and deploy it to make it live on the internet.
              </p>
            </div>
            <div className="card card-elevated p-8">
              <WebsitePreview userId={userId} />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {currentStep !== 'upload' && (
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => {
              const currentIndex = getStepIndex(currentStep)
              if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1].id as WorkflowStep)
              }
            }}
            className="btn btn-outline"
          >
            ← Previous
          </Button>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Step {getStepIndex(currentStep) + 1} of {steps.length}
            </span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${((getStepIndex(currentStep) + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 