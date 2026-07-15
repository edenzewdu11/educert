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

      {/* Details Side Panel - Exactly like web app properties panel */}
      {showDetails && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 9999 }}>
          {/* Backdrop */}
          <div 
            onClick={() => setShowDetails(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)'
            }}
          />
          
          {/* Side Panel */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '400px',
              maxWidth: '90vw',
              backgroundColor: 'white',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.2)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(to right, rgb(79, 70, 229), rgb(147, 51, 234))',
              color: 'white',
              padding: '24px',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle style={{ width: '24px', height: '24px' }} />
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Certificate Properties</h2>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  style={{
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', flex: 1 }}>
              {/* Certificate Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '12px'
                }}>
                  Certificate Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <PropertyRow label="Certificate ID" value={certificateData.id} />
                  <PropertyRow label="Student Name" value={certificateData.student_name} />
                  <PropertyRow label="Course Name" value={certificateData.course_name} />
                  <PropertyRow label="Issue Date" value={certificateData.issued_at} />
                  <PropertyRow label="Issued By" value={certificateData.organization} />
                </div>
              </div>

              {/* Verification Information */}
              <div style={{ paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                <h3 style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '12px'
                }}>
                  Verification Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <PropertyRow label="Verified By" value="EduCerts Secure Platform" />
                  <PropertyRow 
                    label="Status" 
                    value={
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        <CheckCircle style={{ width: '14px', height: '14px' }} />
                        VERIFIED
                      </span>
                    } 
                  />
                  <PropertyRow label="Verification Date" value={new Date().toLocaleDateString()} />
                  <PropertyRow label="Security" value="Cryptographically Signed" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function PropertyRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ fontSize: '12px' }}>
      <div style={{ color: '#64748b', fontWeight: '500', marginBottom: '2px' }}>{label}</div>
      <div style={{ color: '#0f172a', fontWeight: '600' }}>{typeof value === 'string' ? value : value}</div>
    </div>
  )
}
