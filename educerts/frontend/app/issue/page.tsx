"use client"

import React, { useState, useRef, useCallback, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import {
    Shield, Upload, Loader2, Sparkles, Download, FilePlus,
    Check, ArrowRight, X, Tag, Eye, LayoutTemplate, RefreshCw,
    GraduationCap, Award, BookOpen, Briefcase, Star, Users, FileText,
    AlertCircle, Table2, FileSpreadsheet, CheckCircle2, PenLine,
    Stamp, UserCheck, ChevronRight, FileSearch, Signature, Lock,
    ClipboardCheck, SquarePen, PenTool, ChevronDown
} from "lucide-react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { API_BASE_URL } from "@/lib/api-config"

const API = API_BASE_URL

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParsedTemplate {
    all_fields: string[]
    system_fields: string[]
    signature_fields: string[]
    custom_fields: string[]
    input_fields: string[]
    template_name: string
    template_type: "html" | "pdf"
}

interface IssuedCert {
    id: string
    student_name: string
    course_name: string
    signing_status: "unsigned" | "signed"
}

interface SignRecord {
    id: number
    signer_name: string
    signer_role: string
    has_signature: boolean
    has_stamp: boolean
    uploaded_at: string
}

// ── Cert Types ─────────────────────────────────────────────────────────────────
const CERT_TYPES = [
    { id: "degree", label: "Degree", icon: GraduationCap, color: "from-sky-500 to-sky-600", border: "border-sky-200", ring: "ring-sky-500", bg: "bg-sky-50", desc: "Bachelor's, Master's, PhD" },
    { id: "birth_certificate", label: "Birth Certificate", icon: FileText, color: "from-sky-400 to-sky-500", border: "border-sky-200", ring: "ring-sky-400", bg: "bg-sky-50", desc: "Official birth records" },
    { id: "trade", label: "Trade Certificate", icon: Briefcase, color: "from-sky-500 to-sky-600", border: "border-sky-200", ring: "ring-sky-500", bg: "bg-sky-50", desc: "Vocational & technical skills" },
    { id: "business", label: "Business License", icon: Shield, color: "from-slate-600 to-slate-700", border: "border-slate-300", ring: "ring-slate-600", bg: "bg-slate-100", desc: "Company & trade permits" },
    { id: "education", label: "Education Cert", icon: BookOpen, color: "from-sky-500 to-sky-600", border: "border-sky-200", ring: "ring-sky-500", bg: "bg-sky-50", desc: "General educational awards" },
    { id: "diploma", label: "Diploma", icon: Award, color: "from-sky-500 to-sky-600", border: "border-sky-200", ring: "ring-sky-500", bg: "bg-sky-50", desc: "Diploma, HND, Foundation" },
    { id: "training", label: "Training", icon: BookOpen, color: "from-sky-400 to-sky-500", border: "border-sky-200", ring: "ring-sky-400", bg: "bg-sky-50", desc: "Bootcamp, workshop, course" },
    { id: "professional", label: "Professional", icon: Briefcase, color: "from-sky-500 to-sky-600", border: "border-sky-200", ring: "ring-sky-500", bg: "bg-sky-50", desc: "Certification, license" },
    { id: "achievement", label: "Achievement", icon: Star, color: "from-sky-500 to-sky-600", border: "border-sky-200", ring: "ring-sky-500", bg: "bg-sky-50", desc: "Award, honor, recognition" },
    { id: "attendance", label: "Attendance", icon: Users, color: "from-sky-400 to-sky-500", border: "border-sky-200", ring: "ring-sky-400", bg: "bg-sky-50", desc: "Event, conference, seminar" },
    { id: "certificate", label: "Generic", icon: FileText, color: "from-slate-500 to-slate-600", border: "border-slate-200", ring: "ring-slate-500", bg: "bg-slate-50", desc: "Custom / other" },
]

const SYSTEM_AUTO = new Set(["issued_at", "cert_id", "signature", "qr_code"])
const SIG_FIELDS = new Set(["digital_signature", "stamp"])
const SYSTEM_AUTO_LABELS: Record<string, string> = {
    issued_at: "Issue Date (auto)", cert_id: "Certificate ID (auto)",
    signature: "Cryptographic Signature (auto)", qr_code: "QR Code (auto)",
    digital_signature: "Digital Signature (signing step)", stamp: "Official Stamp (signing step)",
}

// ── Fuzzy Field Helpers ────────────────────────────────────────────────────────
const normalizeKey = (k: string) => k.toLowerCase().replace(/_/g, "").replace(/\s/g, "")
const isNameField = (k: string) => {
    const n = normalizeKey(k)
    return n === "studentname" || n === "fullname" || n === "name" || n === "recipient" || n === "recipientname"
}
const isCourseField = (k: string) => {
    const n = normalizeKey(k)
    return n === "coursename" || n === "course" || n === "subject" || n === "program" || n === "training"
}

// ── Step Indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ current, step, label, icon: Icon }: { current: number; step: number; label: string; icon: React.ElementType }) {
    const done = current > step
    const active = current === step
    return (
        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all ${active ? "border-sky-500 bg-gradient-to-r from-sky-50 to-white shadow-lg shadow-sky-200" : done ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white opacity-50"}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-300" : done ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                {done ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
            </div>
            <div className="flex-1">
                <p className={`text-xs font-black uppercase tracking-widest ${active ? "text-sky-700" : done ? "text-sky-700" : "text-slate-400"}`}>Step {step}</p>
                <p className={`text-sm font-bold leading-tight ${active ? "text-sky-900" : done ? "text-sky-900" : "text-slate-400"}`}>{label}</p>
            </div>
            {active && <ChevronRight className="w-5 h-5 text-sky-500 ml-auto" />}
        </div>
    )
}

// ── Template Upload Widget ─────────────────────────────────────────────────────
function TemplateUpload({ parsed, parsing, onFile, onClear }: {
    parsed: ParsedTemplate | null; parsing: boolean; onFile: (f: File) => void; onClear: () => void
}) {
    const ref = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)

    return (
        <Card
            className={`border-2 border-dashed rounded-2xl transition-all cursor-pointer ${dragging ? "border-sky-500 bg-gradient-to-br from-sky-50 to-white shadow-lg shadow-sky-200" : parsed ? "border-sky-400 bg-gradient-to-br from-sky-50 to-white shadow-md" : "border-slate-200 bg-white hover:border-sky-300 hover:shadow-md"}`}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
                e.preventDefault(); setDragging(false)
                const f = e.dataTransfer.files[0]
                if (f && (f.name.endsWith(".html") || f.name.endsWith(".pdf"))) onFile(f)
            }}
            onClick={() => !parsed && ref.current?.click()}
        >
            <CardContent className="p-4 sm:p-8 text-center space-y-3 sm:space-y-4">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl flex items-center justify-center ${parsed ? "bg-gradient-to-br from-sky-100 to-sky-200" : dragging ? "bg-gradient-to-br from-sky-100 to-sky-200" : "bg-slate-50 border-2 border-slate-200"}`}>
                    {parsing
                        ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-sky-500 animate-spin" />
                        : parsed
                            ? <Check className="w-6 h-6 sm:w-8 sm:h-8 text-sky-600" />
                            : <LayoutTemplate className={`w-6 h-6 sm:w-8 sm:h-8 ${dragging ? "text-sky-600" : "text-slate-400"}`} />
                    }
                </div>
                <div>
                    <h3 className={`text-base sm:text-lg font-bold ${parsed ? "text-sky-800" : "text-slate-800"}`}>
                        {parsed ? `${parsed.template_name}` : "Upload Certificate"}
                    </h3>
                    {!parsed && (
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            PDF or HTML
                        </p>
                    )}
                </div>
                {parsed && (
                    <button onClick={e => { e.stopPropagation(); onClear() }}
                        className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 mx-auto mt-2 font-semibold">
                        <RefreshCw className="w-3 h-3" /> Change template
                    </button>
                )}
                <input ref={ref} type="file" accept=".html,.pdf" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
            </CardContent>
        </Card>
    )
}

// ── Image Upload Box ────────────────────────────────────────────────────────────
function ImageUploadBox({ label, icon: Icon, file, onChange, accept = "image/*" }: {
    label: string; icon: React.ElementType; file: File | null; onChange: (f: File | null) => void; accept?: string
}) {
    const ref = useRef<HTMLInputElement>(null)
    const preview = file ? URL.createObjectURL(file) : null
    return (
        <div
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${file ? "border-sky-400 bg-sky-50" : "border-slate-200 hover:border-sky-300 bg-slate-50"}`}
            onClick={() => ref.current?.click()}
        >
            {preview ? (
                <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt={label} className="max-h-24 mx-auto rounded-lg object-contain" />
                    <button
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center"
                        onClick={e => { e.stopPropagation(); onChange(null) }}
                    ><X className="w-3 h-3" /></button>
                </div>
            ) : (
                <>
                    <Icon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">{label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">PNG / JPG / WEBP</p>
                </>
            )}
            <input ref={ref} type="file" accept={accept} className="hidden"
                onChange={e => onChange(e.target.files?.[0] || null)} />
        </div>
    )
}

// ── Main Page Content ──────────────────────────────────────────────────────────
function IssuePageContent() {
    const { user } = useAuth()
    const searchParams = useSearchParams()

    // ── Step state
    const [step, setStep] = useState<1 | 2>(1)

    // ── Global feedback
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // ── Step 1: Template
    const [parsedTemplate, setParsedTemplate] = useState<ParsedTemplate | null>(null)
    const [templateParsing, setTemplateParsing] = useState(false)

    // ── Step 1: Issue mode
    const [issueMode, setIssueMode] = useState<"single" | "bulk">("single")
    const [templateFields, setTemplateFields] = useState<Record<string, string>>({})
    const [selectedType, setSelectedType] = useState<string>("certificate")
    const [categoryOpen, setCategoryOpen] = useState(false)
    const [bulkFile, setBulkFile] = useState<File | null>(null)
    const bulkInputRef = useRef<HTMLInputElement>(null)

    // ── Step 1: Issued certs  
    const [issuedCerts, setIssuedCerts] = useState<IssuedCert[]>([])

    // ── Step 2: Signing
    const [signerName, setSignerName] = useState("")
    const [signerRole, setSignerRole] = useState("")
    const [signatureFile, setSignatureFile] = useState<File | null>(null)
    const [stampFile, setStampFile] = useState<File | null>(null)
    const [selectedCertIds, setSelectedCertIds] = useState<Set<string>>(new Set())
    const [signedResults, setSignedResults] = useState<Array<{ id: string; student_name: string }>>([])
    const [sigRecordId, setSigRecordId] = useState<number | null>(null)
    const [signLoading, setSignLoading] = useState(false)
    const [uploadedSignatureRecord, setUploadedSignatureRecord] = useState<SignRecord | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    // ── Deep Linking Handling
    useEffect(() => {
        const initFromParams = async () => {
            const certId = searchParams.get("certId")
            const paramStep = searchParams.get("step")

            if (certId && paramStep === "2") {
                try {
                    setLoading(true)
                    const res = await axios.get<IssuedCert>(`${API}/api/certificate/${certId}`, { withCredentials: true })
                    if (res.data) {
                        setIssuedCerts([res.data])
                        setSelectedCertIds(new Set([res.data.id]))
                        setStep(2)
                    }
                } catch (err) {
                    console.error("Failed to fetch certificate for deep-link:", err)
                    setError("Could not find the certificate for signing. Please try again from the registry.")
                } finally {
                    setLoading(false)
                }
            }
            setIsInitialized(true)
        }

        if (!isInitialized) {
            initFromParams()
        }
    }, [searchParams, isInitialized])

    // ─────────────────────────────────────────────────────────────────────────
    // Handlers
    // ─────────────────────────────────────────────────────────────────────────

    const parseTemplate = async (file: File) => {
        setTemplateParsing(true); setError("")
        try {
            const fd = new FormData(); fd.append("file", file)
            const res = await axios.post<ParsedTemplate>(`${API}/api/templates/parse`, fd)
            setParsedTemplate(res.data)
            const init: Record<string, string> = {}
            for (const f of res.data.input_fields) init[f] = ""
            setTemplateFields(init)
        } catch {
            setError("Failed to parse template. Ensure it's a valid .html or .pdf file.")
        } finally { setTemplateParsing(false) }
    }

    const clearTemplate = () => {
        setParsedTemplate(null); setTemplateFields({})
        setBulkFile(null)
        if (bulkInputRef.current) bulkInputRef.current.value = ""
    }

    const handleSingleIssue = async () => {
        if (!parsedTemplate) return

        const inputFields = parsedTemplate.input_fields
        const hasNameField = inputFields.some(isNameField)
        const hasCourseField = inputFields.some(isCourseField)

        const sNameKey = Object.keys(templateFields).find(isNameField) || "student_name"
        const cNameKey = Object.keys(templateFields).find(isCourseField) || "course_name"

        const sName = templateFields[sNameKey] || ""
        const cName = templateFields[cNameKey] || ""

        // ALIGN VALIDATION: If template has specific name/course placeholders, REQUIRE them.
        // Otherwise, just require at least one field to be non-empty.
        const nameValid = hasNameField ? sName.trim().length > 0 : true
        const courseValid = hasCourseField ? cName.trim().length > 0 : true
        const anyFieldFilled = Object.values(templateFields).some(v => v.trim().length > 0)

        if (!nameValid || !courseValid || !anyFieldFilled) {
            setError(hasNameField && hasCourseField ? "A Name and Course/Subject are required." : "At least one field must be filled.");
            return
        }

        setLoading(true); setError("")
        try {
            // For PDF templates: use bulk-issue-excel with a synthetic single row via the API
            // For HTML: use the existing /api/issue endpoint  
            if (parsedTemplate.template_type === "pdf") {
                // Build a one-row CSV in memory and POST it
                const headers = Object.keys(templateFields)
                const values = headers.map(h => `"${(templateFields[h] || "").replace(/"/g, '""')}"`)
                const csvContent = `${headers.join(",")}\n${values.join(",")}`
                const csvBlob = new Blob([csvContent], { type: "text/csv" })
                const csvFile = new File([csvBlob], "single.csv")
                const fd = new FormData(); fd.append("file", csvFile)
                fd.append("cert_type", selectedType)
                const res = await axios.post(`${API}/api/templates/bulk-issue-excel`, fd, { withCredentials: true })
                const certs: IssuedCert[] = (res.data.certificates || []).map((c: IssuedCert) => ({ ...c, signing_status: "unsigned" }))
                setIssuedCerts(certs)
                setSelectedCertIds(new Set(certs.map((c: IssuedCert) => c.id)))
            } else {
                const res = await axios.post(`${API}/api/issue`, {
                    student_name: sName,
                    course_name: cName,
                    cert_type: selectedType,
                    data_payload: { ...templateFields }
                }, { withCredentials: true })
                const cert: IssuedCert = { id: res.data.id, student_name: sName, course_name: cName, signing_status: "unsigned" }
                setIssuedCerts([cert])
                setSelectedCertIds(new Set([cert.id]))
            }
            setTemplateFields({})
            setStep(2)
        } catch (err: unknown) {
            setError(axios.isAxiosError(err) ? err.response?.data?.detail || "Failed to issue" : "Failed")
        } finally { setLoading(false) }
    }

    const handleBulkIssue = async () => {
        if (!bulkFile) return
        setLoading(true); setError("")
        try {
            const fd = new FormData(); fd.append("file", bulkFile)
            fd.append("cert_type", selectedType)
            const endpoint = bulkFile.name.endsWith(".xlsx")
                ? `${API}/api/templates/bulk-issue-excel`
                : `${API}/api/templates/bulk-issue`
            const res = await axios.post(endpoint, fd, { withCredentials: true })
            const certs: IssuedCert[] = (res.data.certificates || []).map((c: IssuedCert) => ({ ...c, signing_status: "unsigned" }))
            setIssuedCerts(certs)
            setSelectedCertIds(new Set(certs.map((c: IssuedCert) => c.id)))
            setBulkFile(null)
            if (bulkInputRef.current) bulkInputRef.current.value = ""
            setStep(2)
        } catch (err: unknown) {
            setError(axios.isAxiosError(err) ? err.response?.data?.detail || "Bulk import failed" : "Bulk import failed")
        } finally { setLoading(false) }
    }

    const handleUploadSignatureAssets = async () => {
        if (!signerName || !signerRole) { setError("Signer name and role are required."); return }
        if (!signatureFile && !stampFile) { setError("Upload at least a signature or stamp image."); return }
        setSignLoading(true); setError("")
        try {
            const fd = new FormData()
            if (signatureFile) fd.append("signature_file", signatureFile)
            if (stampFile) fd.append("stamp_file", stampFile)
            fd.append("signer_name", signerName)
            fd.append("signer_role", signerRole)
            const res = await axios.post<SignRecord>(`${API}/api/sign/upload`, fd, { withCredentials: true })
            setSigRecordId(res.data.id)
            setUploadedSignatureRecord(res.data)
            setPreviewImage(null)
            // Auto-generate preview after successful upload
            if (issuedCerts.length > 0) {
                setPreviewLoading(true)
                try {
                    const firstCertId = issuedCerts[0].id
                    const previewRes = await axios.get(`${API}/api/preview-signature/${firstCertId}/${res.data.id}`, {
                        responseType: 'blob',
                        withCredentials: true
                    })
                    setPreviewImage(URL.createObjectURL(previewRes.data))
                } catch (previewErr: unknown) {
                    const msg = axios.isAxiosError(previewErr)
                        ? previewErr.response?.data?.detail || "Preview generation failed"
                        : "Preview generation failed"
                    setError(`Preview error: ${msg}`)
                } finally {
                    setPreviewLoading(false)
                }
            }
        } catch (err: unknown) {
            setError(axios.isAxiosError(err) ? err.response?.data?.detail || "Upload failed" : "Upload failed")
        } finally { setSignLoading(false) }
    }

    const handleApplySignatures = async () => {
        if (selectedCertIds.size === 0) { setError("Select at least one certificate to sign."); return }
        if (!sigRecordId) { setError("Upload your signature/stamp first."); return }
        setSignLoading(true); setError("")
        try {
            const res = await axios.post(`${API}/api/sign/apply`, {
                cert_ids: Array.from(selectedCertIds),
                signer_name: signerName,
                signer_role: signerRole,
                signature_record_id: sigRecordId
            }, { withCredentials: true })
            setSignedResults(res.data.signed || [])
            // Update local state
            setIssuedCerts(prev => prev.map(c =>
                selectedCertIds.has(c.id) ? { ...c, signing_status: "signed" } : c
            ))
        } catch (err: unknown) {
            setError(axios.isAxiosError(err) ? err.response?.data?.detail || "Signing failed" : "Signing failed")
        } finally { setSignLoading(false) }
    }

    const toggleCert = useCallback((id: string) => {
        setSelectedCertIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }, [])

    const handleGeneratePreview = async () => {
        if (!sigRecordId || issuedCerts.length === 0) return
        setPreviewLoading(true); setError("")
        try {
            const firstCertId = issuedCerts[0].id
            const res = await axios.get(`${API}/api/preview-signature/${firstCertId}/${sigRecordId}`, {
                responseType: 'blob',
                withCredentials: true
            })
            setPreviewImage(URL.createObjectURL(res.data))
        } catch (err) {
            console.error("Preview failed:", err)
            setError("Failed to generate signature preview.")
        } finally {
            setPreviewLoading(false)
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Access guard
    // ─────────────────────────────────────────────────────────────────────────

    if (!user?.is_admin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
                    <Shield className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-slate-900">Access Restricted</h1>
                <p className="text-slate-500 max-w-sm font-medium">Only authorized administrators can issue credentials.</p>
            </div>
        )
    }

    const allSigned = issuedCerts.length > 0 && issuedCerts.every(c => c.signing_status === "signed")

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 sm:space-y-8">

            {/* ── Page Header ── */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3">
                    <FilePlus className="w-6 h-6 sm:w-8 sm:h-8 text-sky-600" />Issue Credentials
                </h1>
                <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">Two-step process: generate certificates from a template, then apply digital signatures.</p>
            </div>

            {/* ── Step Indicators ── */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <StepIndicator current={step} step={1} label="Generate Certificates" icon={FilePlus} />
                <StepIndicator current={step} step={2} label="Sign & Stamp" icon={PenLine} />
            </div>

            {/* ── Global error / success ── */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs sm:text-sm text-red-700 font-medium flex-1">{error}</p>
                        <button onClick={() => setError("")}><X className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════════════════════════
                STEP 1 — GENERATE CERTIFICATES
                ══════════════════════════════════════════════════════════════ */}
            {step === 1 && (
                <div className="space-y-4 sm:space-y-6">

                    {/* Category Selection */}
                    <div>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-sky-500" /> Choose Certificate Category
                        </p>
                        {(() => {
                            const selected = CERT_TYPES.find(t => t.id === selectedType) ?? CERT_TYPES[CERT_TYPES.length - 1]
                            return (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setCategoryOpen(o => !o)}
                                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-2xl border-2 bg-gradient-to-br from-white to-slate-50 text-left transition-all shadow-sm ${categoryOpen ? "border-sky-500 ring-2 ring-sky-500/30 shadow-xl shadow-sky-500/20" : "border-slate-200 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/10"}`}
                                    >
                                        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${selected.color} text-white shadow-lg shrink-0 ring-2 ring-white ring-offset-2 ring-offset-slate-100`}>
                                            <selected.icon className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{selected.label}</p>
                                            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">{selected.desc}</p>
                                        </div>
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${categoryOpen ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                            <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {categoryOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10 bg-slate-900/10 backdrop-blur-[2px]" onClick={() => setCategoryOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    className="absolute z-20 mt-2 w-full max-h-72 sm:max-h-80 overflow-y-auto rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-2xl shadow-slate-300/50 p-2 ring-1 ring-slate-200"
                                                >
                                                    {CERT_TYPES.map(type => (
                                                        <button
                                                            key={type.id}
                                                            type="button"
                                                            onClick={() => { setSelectedType(type.id); setCategoryOpen(false) }}
                                                            className={`w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-xl text-left transition-all ${selectedType === type.id ? "bg-gradient-to-r from-sky-50 to-sky-100 border-2 border-sky-300 shadow-md" : "hover:bg-slate-100 border-2 border-transparent"}`}
                                                        >
                                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${type.color} text-white shadow-md shrink-0 ${selectedType === type.id ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-white" : ""}`}>
                                                                <type.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-xs sm:text-sm font-bold truncate ${selectedType === type.id ? "text-sky-900" : "text-slate-700"}`}>{type.label}</p>
                                                                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">{type.desc}</p>
                                                            </div>
                                                            {selectedType === type.id && (
                                                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white shadow-lg shrink-0 ring-2 ring-white">
                                                                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })()}
                    </div>

                    {/* Template upload */}
                    <div>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <FileSearch className="w-3.5 h-3.5" /> Step 1A — Upload Template <span className="text-red-400 text-[10px] normal-case font-semibold tracking-normal">(Required)</span>
                        </p>
                        <TemplateUpload parsed={parsedTemplate} parsing={templateParsing} onFile={parseTemplate} onClear={clearTemplate} />
                    </div>

                    {!parsedTemplate && !templateParsing && (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            <p className="text-sm text-amber-700 font-medium">
                                Upload a <strong>.pdf</strong> or <strong>.html</strong> template above. All <code className="text-amber-800 bg-amber-100 px-1 rounded">{"{{placeholder}}"}</code> fields will become form inputs automatically.
                            </p>
                        </div>
                    )}

                    {parsedTemplate && (
                        <AnimatePresence>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                                {/* Signature fields info banner */}
                                {parsedTemplate.signature_fields?.length > 0 ? (
                                    <div className="flex items-start gap-3 p-4 bg-sky-50 border border-sky-200 rounded-2xl">
                                        <Signature className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-sky-800">Signature placeholders detected</p>
                                            <p className="text-xs text-sky-600 mt-0.5">
                                                {parsedTemplate.signature_fields.map((f, i) => (
                                                    <code key={`sig-field-${f}-${i}`} className="bg-sky-100 px-1.5 py-0.5 rounded mr-1">{`{{${f}}}`}</code>
                                                ))}
                                                — these will be filled in Step 2 with your uploaded signature/stamp images.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-800">No Signature Placeholders</p>
                                            <p className="text-xs text-amber-600 mt-0.5">
                                                Your template is missing <code className="bg-amber-100 px-1 rounded">{"{{digital_signature}}"}</code> or <code className="bg-amber-100 px-1 rounded">{"{{stamp}}"}</code>.
                                                You can still sign digitally (hash-based), but images will not appear on the PDF.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Auto-filled system fields */}
                                {parsedTemplate.system_fields.filter(f => SYSTEM_AUTO.has(f)).length > 0 && (
                                    <Card className="bg-slate-50 border-slate-200 rounded-2xl">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Eye className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Auto-Filled by System</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {[...parsedTemplate.system_fields.filter(f => SYSTEM_AUTO.has(f)),
                                                ...parsedTemplate.signature_fields || []].map((f, i) => (
                                                    <span key={`auto-field-${f}-${i}`} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                                        <Check className="w-3 h-3 text-emerald-500" />{SYSTEM_AUTO_LABELS[f] || f}
                                                    </span>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Single / Bulk toggle */}
                                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-fit border border-slate-200">
                                    {[{ key: "single", label: "Single", icon: SquarePen },
                                    { key: "bulk", label: "Bulk", icon: FileSpreadsheet }].map(m => (
                                        <button key={m.key} onClick={() => setIssueMode(m.key as "single" | "bulk")}
                                            className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${issueMode === m.key ? "bg-white shadow text-sky-700 border border-sky-100" : "text-slate-500 hover:text-slate-800"}`}>
                                            <m.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{m.label}
                                        </button>
                                    ))}
                                </div>

                                {/* ── Single mode ── */}
                                {issueMode === "single" && (
                                    <Card className="bg-white border-slate-200 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-slate-200">
                                        <div className="h-2 bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500" />
                                        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Tag className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />Fill in Certificate Fields</CardTitle>
                                            <CardDescription className="text-xs sm:text-sm">
                                                {parsedTemplate.input_fields.length} field{parsedTemplate.input_fields.length !== 1 ? "s" : ""} extracted from <span className="font-semibold text-sky-600">{parsedTemplate.template_name}</span>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 px-4 sm:px-6">
                                            {parsedTemplate.input_fields
                                                .filter(field => !SIG_FIELDS.has(field))
                                                .map((field, i) => {
                                                    const isCore = isNameField(field) || isCourseField(field)
                                                    return (
                                                        <div key={`form-input-${field}-${i}`} className="space-y-1.5 sm:space-y-2">
                                                            <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block ${isCore ? "bg-sky-500" : "bg-sky-400"}`} />
                                                                {field.replace(/_/g, " ")}
                                                                {isCore && <span className="text-red-400">*</span>}
                                                            </label>
                                                            <input type="text" placeholder={`Enter ${field.replace(/_/g, " ")}`}
                                                                value={templateFields[field] || ""}
                                                                onChange={e => setTemplateFields({ ...templateFields, [field]: e.target.value })}
                                                                className="w-full bg-white border-2 border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all font-medium placeholder:text-slate-400 shadow-sm focus:shadow-md" />
                                                        </div>
                                                    )
                                                })}
                                            <div className="md:col-span-2 p-3 sm:p-4 bg-gradient-to-r from-sky-50 to-sky-100 rounded-xl border border-sky-200 flex gap-2 sm:gap-3">
                                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-sky-600 mt-0.5" />
                                                <p className="text-[10px] sm:text-xs leading-tight font-medium text-slate-700">
                                                    Fields will be injected into the template at the exact placeholder positions. All fields are individually salted, hashed, and signed with Ed25519.
                                                </p>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 sm:p-5">
                                            {(() => {
                                                const inputFields = parsedTemplate.input_fields
                                                const hasNameField = inputFields.some(isNameField)
                                                const hasCourseField = inputFields.some(isCourseField)

                                                const nameValue = Object.keys(templateFields).find(k => isNameField(k) && templateFields[k].trim())
                                                const courseValue = Object.keys(templateFields).find(k => isCourseField(k) && templateFields[k].trim())

                                                const nameValid = hasNameField ? !!nameValue : true
                                                const courseValid = hasCourseField ? !!courseValue : true
                                                const anyFieldFilled = Object.values(templateFields).some(v => v.trim())

                                                const canIssue = nameValid && courseValid && anyFieldFilled

                                                return (
                                                    <Button onClick={handleSingleIssue}
                                                        className="w-full h-10 sm:h-12 rounded-xl text-sm sm:text-base font-bold group shadow-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 border-0 transition-all"
                                                        disabled={loading || !canIssue}>
                                                        {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : (
                                                            <>Generate Certificate <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
                                                        )}
                                                    </Button>
                                                )
                                            })()}
                                        </CardFooter>
                                    </Card>
                                )}

                                {/* ── Bulk mode ── */}
                                {issueMode === "bulk" && (
                                    <div className="space-y-4 sm:space-y-5">
                                        {/* Column mapping table */}
                                        <Card className="bg-white border-slate-200 rounded-2xl shadow-lg overflow-hidden ring-1 ring-slate-200">
                                            <div className="h-1.5 bg-gradient-to-r from-sky-500 to-sky-600" />
                                            <CardHeader className="pb-2 px-4 sm:px-6">
                                                <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                                                    <Table2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500" />
                                                    CSV / Excel Column → Template Field Mapping
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    Your file must have these exact column headers. Each row = one certificate.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-0 px-4 sm:px-6">
                                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                                    <table className="w-full text-xs sm:text-sm">
                                                        <thead>
                                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Column Header</th>
                                                                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Template Placeholder</th>
                                                                <th className="text-left px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Required?</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {parsedTemplate.input_fields.filter(f => !SIG_FIELDS.has(f)).map((field, i) => (
                                                                <tr key={`input-${field}-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                                                    <td className="px-2 sm:px-4 py-2 sm:py-2.5">
                                                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                                                            <code className="text-sky-600 bg-sky-50 px-1.5 sm:px-2 py-0.5 rounded font-mono text-[10px] sm:text-xs">{field}</code>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-2 sm:px-4 py-2 sm:py-2.5"><code className="text-sky-600 bg-sky-50 px-1.5 sm:px-2 py-0.5 rounded font-mono text-[10px] sm:text-xs">{"{{ " + field + " }}"}</code></td>
                                                                    <td className="px-2 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2">
                                                                        {(field === "student_name" || field === "course_name" || isNameField(field) || isCourseField(field))
                                                                            ? <span className="text-[9px] sm:text-[10px] font-bold text-red-600 bg-red-50 px-1.5 sm:px-2 py-0.5 rounded border border-red-200">Required</span>
                                                                            : <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded">Optional</span>
                                                                        }
                                                                        {bulkFile && (
                                                                            <span className="text-[9px] sm:text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 sm:px-2 py-0.5 rounded border border-sky-200 flex items-center gap-0.5 sm:gap-1">
                                                                                <Check className="w-1.5 h-1.5 sm:w-2 sm:h-2" /> Auto-mapped
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {parsedTemplate.system_fields.filter(f => SYSTEM_AUTO.has(f)).map((field, i) => (
                                                                <tr key={`system-${field}-${i}`} className={(parsedTemplate.input_fields.length + i) % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                                                    <td className="px-2 sm:px-4 py-2 sm:py-2.5"><span className="text-slate-400 italic text-[10px] sm:text-xs">(auto)</span></td>
                                                                    <td className="px-2 sm:px-4 py-2 sm:py-2.5"><code className="text-slate-400 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded font-mono text-[10px] sm:text-xs">{"{{ " + field + " }}"}</code></td>
                                                                    <td className="px-2 sm:px-4 py-2 sm:py-2.5"><span className="text-[9px] sm:text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 sm:px-2 py-0.5 rounded border border-sky-200">System Filled</span></td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* File upload */}
                                        <Card className="bg-white border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden hover:border-sky-300 transition-colors">
                                            <div className="h-1.5 bg-gradient-to-r from-sky-500 to-sky-600" />
                                            <CardContent className="p-4 sm:p-8 text-center space-y-3 sm:space-y-5">
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-3xl mx-auto flex items-center justify-center border-2 border-slate-100">
                                                    <FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base sm:text-lg font-bold text-slate-900">Upload Bulk Data File</h3>
                                                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                                                        Upload a <strong>.csv</strong> or <strong>.xlsx</strong> (Excel) file. Each row generates one signed certificate.
                                                    </p>
                                                </div>
                                                <input ref={bulkInputRef} type="file" accept=".csv,.xlsx" id="bulk-upload"
                                                    onChange={e => e.target.files && setBulkFile(e.target.files[0])} className="hidden" />
                                                <div className="flex flex-col gap-2 sm:gap-3 items-center">
                                                    <label htmlFor="bulk-upload"
                                                        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 cursor-pointer border border-slate-200 font-semibold shadow-sm flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                                        <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        {bulkFile ? bulkFile.name : "Select .csv or .xlsx File"}
                                                    </label>
                                                    {bulkFile && (
                                                        <Button onClick={handleBulkIssue}
                                                            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 max-w-sm w-full h-10 sm:h-12 rounded-xl font-bold shadow-xl shadow-sky-500/30 text-xs sm:text-sm"
                                                            disabled={loading}>
                                                            {loading
                                                                ? <><Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-2" />Issuing…</>
                                                                : <><FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />Issue All from {bulkFile.name}</>
                                                            }
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                STEP 2 — SIGN & STAMP
                ══════════════════════════════════════════════════════════════ */}
            {step === 2 && (
                <div className="space-y-4 sm:space-y-6">
                    {/* Summary banner */}
                    <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-5 rounded-2xl bg-sky-50 border border-sky-200">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-500 rounded-full flex items-center justify-center shrink-0 shadow-md shadow-sky-200">
                            <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm sm:text-base font-bold text-sky-800">{issuedCerts.length} Certificate{issuedCerts.length !== 1 ? "s" : ""} Generated</h3>
                            <p className="text-xs sm:text-sm text-sky-600 mt-0.5">Now apply your digital signature and/or official stamp to finalize them.</p>
                        </div>
                        <button onClick={() => { setStep(1); setIssuedCerts([]); setSignedResults([]) }}
                            className="text-[10px] sm:text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Start Over
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* ── Left: Signature configuration ── */}
                        <div className="space-y-4 sm:space-y-5">
                            <Card className="bg-white border-slate-200 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-slate-200">
                                <div className="h-2 bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500" />
                                <CardHeader className="px-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-sm sm:text-base"><PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />Signer Setup</CardTitle>
                                        <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-100 text-xs">Step 2</Badge>
                                    </div>
                                    <CardDescription className="text-xs sm:text-sm">Setup your digital signature and stamp for these certificates.</CardDescription>

                                    {parsedTemplate && parsedTemplate.signature_fields?.length === 0 && (
                                        <div className="mt-3 sm:mt-4 flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[10px] sm:text-[11px] leading-tight text-amber-700 font-medium">
                                                <strong>Warning:</strong> Template missing signature/stamp placeholders.
                                                Images will <strong>not</strong> appear on the PDF, but certificates will still be digitally secured.
                                            </p>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4 sm:space-y-5 pb-4 sm:pb-6 px-4 sm:px-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Signer Name</label>
                                            <Input value={signerName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignerName(e.target.value)} placeholder="e.g. Dr. Jane Doe" className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Signer Title</label>
                                            <Input value={signerRole} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignerRole(e.target.value)} placeholder="e.g. Dean of Studies" className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Signature Image</label>
                                            <div className="relative group cursor-pointer" onClick={() => (document.getElementById("sig-input") as HTMLInputElement).click()}>
                                                <div className={`flex flex-col items-center justify-center h-24 sm:h-28 border-2 border-dashed rounded-xl transition-all overflow-hidden ${signatureFile ? "border-sky-400 bg-gradient-to-br from-sky-50 to-sky-100" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-sky-400 hover:shadow-sm"
                                                    }`}>
                                                    {signatureFile ? (
                                                        <>
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={URL.createObjectURL(signatureFile)} alt="Signature preview" className="max-h-14 sm:max-h-16 max-w-full object-contain" />
                                                            <p className="text-[9px] sm:text-[10px] font-semibold text-sky-600 mt-1 truncate px-2">{signatureFile.name}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 mb-1" />
                                                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Click to upload</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input id="sig-input" type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && setSignatureFile(e.target.files[0])} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stamp Image</label>
                                            <div className="relative group cursor-pointer" onClick={() => (document.getElementById("stamp-input") as HTMLInputElement).click()}>
                                                <div className={`flex flex-col items-center justify-center h-24 sm:h-28 border-2 border-dashed rounded-xl transition-all overflow-hidden ${stampFile ? "border-sky-400 bg-gradient-to-br from-sky-50 to-sky-100" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-sky-400 hover:shadow-sm"
                                                    }`}>
                                                    {stampFile ? (
                                                        <>
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={URL.createObjectURL(stampFile)} alt="Stamp preview" className="max-h-14 sm:max-h-16 max-w-full object-contain" />
                                                            <p className="text-[9px] sm:text-[10px] font-semibold text-sky-600 mt-1 truncate px-2">{stampFile.name}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 mb-1" />
                                                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Click to upload</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input id="stamp-input" type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && setStampFile(e.target.files[0])} />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-slate-100 bg-slate-50 p-4 sm:p-5 flex flex-col gap-2 sm:gap-3">
                                    {!uploadedSignatureRecord ? (
                                        <Button onClick={handleUploadSignatureAssets}
                                            className="w-full h-10 sm:h-12 rounded-xl font-bold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-xl shadow-sky-500/30 text-xs sm:text-sm"
                                            disabled={signLoading || !signerName || !signerRole || (!signatureFile && !stampFile)}>
                                            {signLoading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-2" /> : <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />}
                                            Upload Signature & Stamp
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-sky-50 border border-sky-200 rounded-xl w-full">
                                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-bold text-sky-800">Signature assets uploaded</p>
                                                <p className="text-[10px] sm:text-xs text-sky-600">
                                                    {uploadedSignatureRecord.has_signature ? "✓ Signature " : ""}
                                                    {uploadedSignatureRecord.has_stamp ? "✓ Stamp" : ""}
                                                </p>
                                            </div>
                                            <button className="text-[10px] sm:text-xs text-sky-400 hover:text-sky-700 font-semibold"
                                                onClick={() => { setUploadedSignatureRecord(null); setSigRecordId(null); setPreviewImage(null) }}>
                                                Change
                                            </button>
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>

                            {/* Preview of signature/stamp on template */}
                            {uploadedSignatureRecord && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                    <Card className="bg-white border-slate-200 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-slate-200">
                                        <div className="h-2 bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500" />
                                        <CardHeader className="px-4 sm:px-6">
                                            <CardTitle className="flex items-center gap-2 text-sm sm:text-base"><Eye className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />Signature Preview</CardTitle>
                                            <CardDescription className="text-xs sm:text-sm">See how your signature and stamp will appear on the certificate.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="relative w-full aspect-[1.414/1] bg-slate-100 flex items-center justify-center overflow-hidden">
                                                {previewLoading && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 gap-2">
                                                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-sky-600" />
                                                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Generating preview…</p>
                                                    </div>
                                                )}
                                                {previewImage && !previewLoading && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={previewImage} alt="Signature Preview" className="w-full h-full object-contain" />
                                                )}
                                                {!previewImage && !previewLoading && (
                                                    <div className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 text-center">
                                                        <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
                                                        <div>
                                                            <p className="text-xs sm:text-sm font-semibold text-slate-500">Preview not generated yet</p>
                                                            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Click the button below to render the certificate with your signature and stamp.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="border-t border-slate-100 bg-slate-50 p-4 sm:p-5">
                                            <Button onClick={handleGeneratePreview}
                                                className="w-full h-10 sm:h-12 rounded-xl font-bold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-xl shadow-sky-500/30 text-xs sm:text-sm"
                                                disabled={previewLoading || !uploadedSignatureRecord}>
                                                {previewLoading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-2" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />}
                                                Generate Preview
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            )}
                        </div>

                        {/* ── Right: Certificate Selection ── */}
                        <div className="space-y-4 sm:space-y-5">
                            <Card className="bg-white border-slate-200 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-slate-200">
                                <div className="h-2 bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500" />
                                <CardHeader className="px-4 sm:px-6">
                                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base"><ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />Select Certificates to Sign</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        {selectedCertIds.size} of {issuedCerts.length} selected
                                        <button className="ml-2 sm:ml-3 text-sky-600 hover:text-sky-800 font-semibold underline text-[10px] sm:text-xs"
                                            onClick={() => setSelectedCertIds(new Set(issuedCerts.map(c => c.id)))}>
                                            Select All
                                        </button>
                                        <button className="ml-1 sm:ml-2 text-slate-500 hover:text-slate-700 font-semibold underline text-[10px] sm:text-xs"
                                            onClick={() => setSelectedCertIds(new Set())}>
                                            None
                                        </button>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 max-h-64 overflow-y-auto">
                                    <div className="flex flex-col">
                                        {issuedCerts.map((cert, i) => {
                                            const isSelected = selectedCertIds.has(cert.id)
                                            const isSigned = cert.signing_status === "signed"

                                            return (
                                                <div key={cert.id || `issued-${i}`} className={`group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-slate-100 last:border-0 transition-all ${isSelected ? "bg-sky-50/50" : "bg-white hover:bg-slate-50"}`}>
                                                    <button onClick={() => !isSigned && toggleCert(cert.id)}
                                                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md border flex items-center justify-center transition-all ${isSigned ? "bg-slate-100 border-slate-200 cursor-not-allowed" : isSelected ? "bg-sky-600 border-sky-600 shadow-sm" : "bg-white border-slate-300 group-hover:border-sky-400"}`}>
                                                        {isSigned ? <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" /> : isSelected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white stroke-[3]" />}
                                                    </button>
                                                    <div className="flex-1 min-w-0" onClick={() => !isSigned && toggleCert(cert.id)}>
                                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                                            <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{cert.student_name}</p>
                                                            {isSigned && <span className="text-[9px] sm:text-[10px] font-bold text-sky-600 px-1.5 py-0.5 bg-sky-50 rounded-full border border-sky-200">Signed</span>}
                                                        </div>
                                                        <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate flex items-center gap-1 sm:gap-1.5 mt-0.5">
                                                            <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" /> {cert.course_name}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        <a href={`${API}/api/download/${cert.id}`} target="_blank" rel="noreferrer"
                                                            className="p-1 sm:p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                                                            title="Download Certificate">
                                                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-slate-100 bg-slate-50 p-4 sm:p-5">
                                    <Button onClick={handleApplySignatures}
                                        className="w-full h-10 sm:h-12 rounded-xl font-bold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-xl shadow-sky-500/30 text-xs sm:text-sm"
                                        disabled={signLoading || !sigRecordId || selectedCertIds.size === 0 || allSigned}>
                                        {signLoading
                                            ? <><Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-2" />Signing…</>
                                            : allSigned
                                                ? <><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />All Signed!</>
                                                : <><Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />Apply Digital Signature to {selectedCertIds.size} Cert{selectedCertIds.size !== 1 ? "s" : ""}</>
                                        }
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Download section — shown after signing */}
                            {signedResults.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                    <Card className="bg-white border-sky-200 shadow-2xl rounded-2xl overflow-hidden mt-3 sm:mt-4 ring-1 ring-sky-200">
                                        <div className="h-2 bg-gradient-to-r from-sky-500 to-sky-600" />
                                        <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
                                            <CardTitle className="flex items-center gap-2 text-sky-800 text-sm sm:text-base">
                                                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
                                                {signedResults.length} Certificate{signedResults.length !== 1 ? "s" : ""} Signed
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto p-3 sm:p-4">
                                            {signedResults.map((cert, i) => (
                                                <div key={`signed-${cert.id}-${i}`} className="flex items-center justify-between p-2.5 sm:p-3 bg-sky-50 rounded-xl border border-sky-200">
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-semibold text-sky-900">{cert.student_name}</p>
                                                    </div>
                                                    <a href={`${API}/api/download/${cert.id}`} target="_blank" rel="noreferrer"
                                                        className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-sky-700 hover:text-sky-900 bg-white border border-sky-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm transition-all hover:shadow">
                                                        <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Download PDF
                                                    </a>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-sky-600" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading issuance wizard...</p>
                </div>
            </div>
        }>
            <IssuePageContent />
        </Suspense>
    )
}
