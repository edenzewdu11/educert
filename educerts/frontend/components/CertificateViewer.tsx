'use client'

import { X, CheckCircle, Info } from 'lucide-react'
import { useState } from 'react'

interface CertificateViewerProps {
  certificateData: {
    id: string
    student_name: string
    course_name: string
    issued_at: string
    organization: string
    signature?: string
  }
  pdfUrl: string
  onClose: () => void
}

export default function CertificateViewer({ certificateData, pdfUrl, onClose }: CertificateViewerProps) {
  const [showProperties, setShowProperties] = useState(true)

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">Certificate Verified</h3>
            <p className="text-xs text-indigo-100">{certificateData.student_name} - {certificateData.course_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProperties(!showProperties)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
          >
            <Info className="w-4 h-4" />
            {showProperties ? 'Hide' : 'Show'} Properties
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 relative bg-slate-800 flex items-center justify-center">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="absolute inset-0 w-full h-full"
          >
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="absolute inset-0 w-full h-full border-0"
              title="Certificate PDF"
              style={{ border: 'none' }}
            />
          </object>
        </div>
        
        {/* Properties Panel */}
        {showProperties && (
          <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto flex-shrink-0">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Certificate Properties</h3>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Certificate Information */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Certificate Information
                </h4>
                <div className="space-y-2">
                  <PropertyRow label="Certificate ID" value={certificateData.id} />
                  <PropertyRow label="Student Name" value={certificateData.student_name} />
                  <PropertyRow label="Course Name" value={certificateData.course_name} />
                  <PropertyRow label="Issue Date" value={certificateData.issued_at} />
                  <PropertyRow label="Issued By" value={certificateData.organization} />
                </div>
              </div>

              {/* Verification Information */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Verification Information
                </h4>
                <div className="space-y-2">
                  <PropertyRow label="Verified By" value="EduCerts Secure Platform" />
                  <PropertyRow 
                    label="Status" 
                    value={
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
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
        )}
      </div>
    </div>
  )
}

function PropertyRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-xs">
      <div className="text-slate-500 font-medium mb-0.5">{label}</div>
      <div className="text-slate-900 font-semibold">{typeof value === 'string' ? value : value}</div>
    </div>
  )
}
