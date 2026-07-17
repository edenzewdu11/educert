"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShieldCheck, ShieldAlert, FileSearch, Upload, CheckCircle, XCircle, Info, Hash, Fingerprint, Loader2, ArrowLeft, Award } from "lucide-react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import VerificationBanner from "@/components/VerificationBanner"

interface VerificationResult {
    summary: {
        all: boolean
        documentStatus: boolean
        documentIntegrity: boolean
        issuerIdentity: boolean
        signature: boolean
        registryCheck: boolean
        contentIntegrity?: boolean
    }
    data: Array<{
        type: string
        name: string
        status: string
        data?: any
    }>
    certificate?: {
        student_name: string
        course_name: string
    }
}

export default function VerifyPage() {
    const { user } = useAuth()
    const [verifyId, setVerifyId] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<VerificationResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [activeMode, setActiveMode] = useState<"id" | "file">("id")
    const [dragActive, setDragActive] = useState(false)

    // Function to determine specific reason for unverified status
    const getUnverifiedReason = (result: VerificationResult): string => {
        if (!result.summary.documentIntegrity) {
            return "Document has been tampered with or corrupted."
        }
        if (!result.summary.documentStatus) {
            return "Certificate has been revoked or was never issued."
        }
        if (!result.summary.signature) {
            return "Digital signature is invalid or missing."
        }
        if (!result.summary.issuerIdentity) {
            return "Issuer identity could not be verified."
        }
        if (!result.summary.registryCheck) {
            return "Certificate not found in the official registry."
        }
        // Check for content integrity issues (PDF tampering)
        const contentCheck = result.data.find(d => d.type === "CONTENT_INTEGRITY")
        if (contentCheck && contentCheck.status === "INVALID") {
            return "PDF content has been modified after issuance."
        }
        return "Certificate verification failed for unknown reasons."
    }

    // Check for ID in URL params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const id = params.get("id")
        if (id) {
            setVerifyId(id)
            handleVerifyId(id)
        }
    }, [])

    const handleVerifyId = async (id?: string) => {
        const certId = (id || verifyId).trim().toLowerCase()
        if (!certId) return
        setLoading(true)
        setResult(null)
        setError(null)
        
        const timestamp = Date.now()
        console.log(`[${timestamp}] Starting ID verification for: ${certId}`)
        
        try {
            const res = await axios.post("http://localhost:8000/api/verify", {
                certificate_id: certId
            }, {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            })
            
            console.log(`[${timestamp}] ID verification response:`, res.data)
            console.log(`[${timestamp}] Overall valid:`, res.data.summary.all)
            console.log(`[${timestamp}] Content integrity:`, res.data.summary.contentIntegrity)
            
            setResult(res.data)
        } catch (err: any) {
            setResult(null)
            console.error(`[${timestamp}] ID verification error:`, err)
            
            if (err.response?.status === 404) {
                setError("Certificate not found. Please check the certificate ID and try again.")
            } else {
                setError("Verification failed. Please check your connection and try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (file: File) => {
        setLoading(true)
        setResult(null)
        setError(null)
        
        // Add cache-busting timestamp to prevent browser caching
        const timestamp = Date.now()
        console.log(`[${timestamp}] Starting verification for file: ${file.name}`)
        
        try {
            if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
                const formData = new FormData()
                formData.append("file", file)
                
                // Add cache-busting headers
                const res = await axios.post<VerificationResult>("http://localhost:8000/api/verify/pdf", formData, {
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                })
                
                console.log(`[${timestamp}] PDF verification response:`, res.data)
                console.log(`[${timestamp}] Overall valid:`, res.data.summary.all)
                console.log(`[${timestamp}] Content integrity:`, res.data.summary.contentIntegrity)
                
                setResult(res.data)
            } else {
                const text = await file.text()
                try {
                    const jsonData = JSON.parse(text)
                    const res = await axios.post<VerificationResult>("http://localhost:8000/api/verify", {
                        data_payload: jsonData
                    }, {
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache',
                            'Expires': '0'
                        }
                    })
                    
                    console.log(`[${timestamp}] JSON verification response:`, res.data)
                    setResult(res.data)
                } catch (e) {
                    setError("Invalid JSON document format.")
                }
            }
        } catch (err: any) {
            setResult(null)
            const errorMsg = err.response?.data?.detail || err.message || "Invalid document format."
            console.error(`[${timestamp}] Verification error:`, err)
            setError(`Verification failed: ${errorMsg}`)
        } finally {
            setLoading(false)
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0])
        }
    }

    const FragmentStatus = ({ label, isValid }: { label: string, isValid: boolean }) => (
        <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isValid ? "bg-emerald-500" : "bg-red-500"}`} />
                {label}
            </span>
            {isValid ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
        </div>
    )

    return (
        <>
            {/* Verification Banner - shows when certificate is verified */}
            {result && result.summary.all && result.certificate && (
                <VerificationBanner
                    certificateData={{
                        id: verifyId,
                        student_name: result.certificate.student_name,
                        course_name: result.certificate.course_name,
                        issued_at: new Date().toISOString().split('T')[0],
                        organization: 'EduCerts Academy',
                        signature: result.data.find(d => d.type === 'SIGNATURE_VERIFICATION')?.data?.signature
                    }}
                    onClose={() => setResult(null)}
                />
            )}
            
            <div className="p-8 max-w-4xl mx-auto space-y-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {user && !user.is_admin && (
                        <Link href="/student">
                            <Button variant="outline" size="icon" className="rounded-xl">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <Search className="w-8 h-8 text-sky-600" />
                            Verify Credential
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Verify the authenticity of any EduCerts credential
                        </p>
                    </div>
                </div>
                <Link
                    href="/verify-public"
                    target="_blank"
                    className="text-sm text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                >
                    Open Public Verifier
                    <Award className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Verification Inputs */}
                <div className="space-y-6">
                    <div className="flex gap-2 p-1 bg-slate-100 border border-slate-200 rounded-xl shadow-sm">
                        <button
                            onClick={() => { setActiveMode("id"); setError(null) }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeMode === "id" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            <Hash className="w-4 h-4" />
                            By ID
                        </button>
                        <button
                            onClick={() => { setActiveMode("file"); setError(null) }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeMode === "file" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            <Upload className="w-4 h-4" />
                            By Document
                        </button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl shadow-sm"
                        >
                            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-red-800 font-bold">Verification Error</p>
                                <p className="text-xs text-red-600 font-medium mt-0.5">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {activeMode === "id" ? (
                            <motion.div
                                key="id"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                            >
                                <Card className="bg-white border-slate-200 shadow-lg overflow-hidden rounded-2xl">
                                    <div className="h-1 bg-sky-600"></div>
                                    <CardHeader>
                                        <CardTitle className="text-md">Verify via Registry</CardTitle>
                                        <CardDescription>Enter the unique certificate UUID.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="relative">
                                            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Paste Certificate ID (full UUID or 8-char short ID)..."
                                                value={verifyId}
                                                onChange={(e) => { setVerifyId(e.target.value); setError(null) }}
                                                onKeyDown={(e) => e.key === "Enter" && handleVerifyId()}
                                                className="w-full bg-slate-50 border-slate-200 rounded-xl px-10 py-3 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-sky-600/20 outline-none border font-semibold"
                                            />
                                        </div>
                                        <Button onClick={() => handleVerifyId()} disabled={loading || !verifyId} className="w-full bg-sky-600 hover:bg-sky-700 h-11 rounded-xl font-bold">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Authenticity"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="file"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`h-[200px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all shadow-sm ${dragActive ? "border-sky-600 bg-sky-50 shadow-sky-600/10" : "border-slate-200 bg-white"}`}
                                >
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                        {loading ? (
                                            <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
                                        ) : (
                                            <FileSearch className="w-6 h-6 text-sky-600" />
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-900">
                                            {loading ? "Processing Document..." : "Drag Certificate PDF here"}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-wider uppercase">Accepts .pdf or .json</p>
                                    </div>
                                    {!loading && (
                                        <>
                                            <input
                                                type="file"
                                                accept=".json,.pdf"
                                                className="hidden"
                                                id="file-verify"
                                                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                                            />
                                            <label htmlFor="file-verify" className="text-xs text-sky-400 hover:underline cursor-pointer font-semibold">Or browse files</label>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex gap-3">
                        <Info className="w-5 h-5 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            Verification involves checking the document's Merkle proof matches the issued hash and validating the Ed25519 signature of the issuer.
                        </p>
                    </div>
                </div>

                {/* Column 2: Results */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center space-y-4 border border-slate-200 rounded-3xl bg-white border-dashed shadow-inner min-h-[300px]"
                            >
                                <ShieldCheck className="w-16 h-16 text-slate-100" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Awaiting Data...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-8 rounded-3xl border h-full flex flex-col shadow-xl ${result.summary.all ? "bg-white border-emerald-200" : "bg-white border-red-200"}`}
                            >
                                <div className={`h-1.5 -mx-8 -mt-8 mb-8 rounded-t-3xl ${result.summary.all ? "bg-emerald-500" : "bg-red-500"}`}></div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${result.summary.all ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-red-500 text-white shadow-lg shadow-red-500/20"}`}>
                                        {result.summary.all ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl font-bold ${result.summary.all ? "text-emerald-700" : "text-red-700"}`}>
                                            {result.summary.all ? "Verified" : "Unverified"}
                                        </h3>
                                        <p className={`text-sm font-medium ${result.summary.all ? "text-emerald-600" : "text-red-600"}`}>
                                            {result.summary.all 
                                                ? "This certificate is authentic and has not been tampered with." 
                                                : getUnverifiedReason(result)
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    {result.summary.all && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Student</p>
                                                <p className="text-sm font-bold text-slate-900">{result.certificate?.student_name || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Course</p>
                                                <p className="text-sm font-bold text-slate-900">{result.certificate?.course_name || "N/A"}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3 pt-6 border-t border-slate-100">
                                        <FragmentStatus label="Document Integrity" isValid={result.summary.documentIntegrity} />
                                        <FragmentStatus label="Issuance Status" isValid={result.summary.documentStatus} />
                                        <FragmentStatus label="Issuer Identity" isValid={result.summary.issuerIdentity} />
                                        <FragmentStatus label="Registry Verification" isValid={result.summary.registryCheck} />
                                        <FragmentStatus label="Cryptographic Signature" isValid={result.summary.signature} />
                                        {result.summary.contentIntegrity !== undefined && (
                                            <FragmentStatus 
                                                label="Content Integrity (PDF Hash)" 
                                                isValid={result.summary.contentIntegrity} 
                                            />
                                        )}
                                    </div>

                                    <div className="mt-auto pt-6">
                                        <button onClick={() => setResult(null)} className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 text-sm font-bold transition-all border border-slate-200 shadow-sm">
                                            Clear Result
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
        </>
    )
}
