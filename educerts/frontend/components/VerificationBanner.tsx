'use client'

import { CheckCircle, Info, X } from 'lucide-react'
import { useState } from 'react'

interface VerificationBannerProps {
  certificateData?: {
    id: string
    student_name: string
    course_name: string
    issued_at: string
    organization: string
    signature?: string
  }
  onClose?: () => void
}

export default function VerificationBanner({ certificateData, onClose }: VerificationBannerProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (!certificateData) return null

  return (
    <>
      {/* Banner - similar to "Upgrade to unlock" style */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">Certificate Verified</span>
              <span className="hidden sm:inline text-indigo-100">•</span>
              <span className="text-sm text-indigo-100">
                EduCerts Secure Platform
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">View Details</span>
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close banner"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Side Panel */}
      {showDetails && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          
          {/* Side Panel - slides from right */}
          <div 
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto z-[70]"
            style={{ 
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '400px',
              maxWidth: '90vw',
              height: '100vh',
              zIndex: 9999
            }}
          >
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Certificate Details</h2>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Certificate Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Certificate Information
                </h3>
                <div className="space-y-3">
                  <InfoRow label="Certificate ID" value={certificateData.id} />
                  <InfoRow label="Student Name" value={certificateData.student_name} />
                  <InfoRow label="Course Name" value={certificateData.course_name} />
                  <InfoRow label="Issue Date" value={certificateData.issued_at} />
                  <InfoRow label="Issued By" value={certificateData.organization} />
                </div>
              </div>

              {/* Verification Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Verification Information
                </h3>
                <div className="space-y-3">
                  <InfoRow 
                    label="Verified By" 
                    value="EduCerts Secure Platform"
                  />
                  <InfoRow 
                    label="Verification Status" 
                    value={
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        VERIFIED
                      </span>
                    } 
                  />
                  <InfoRow 
                    label="Verification Date" 
                    value={new Date().toLocaleDateString()}
                  />
                  <InfoRow 
                    label="Security" 
                    value="Cryptographically Signed & Blockchain Anchored"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-sm font-medium text-slate-700 sm:w-40 flex-shrink-0">{label}:</span>
      <span className="text-sm text-slate-900">{value}</span>
    </div>
  )
}

function StatusItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-700">
      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
      <span>{text}</span>
    </div>
  )
}
