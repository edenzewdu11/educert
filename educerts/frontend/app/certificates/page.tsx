"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getApiBaseUrl } from "@/lib/api-config"
import { Download, Loader2, Search, Shield, Tag } from "lucide-react"

interface Certificate {
    id: string
    course_name: string
    student_name: string
    cert_type: string
    organization: string
    claim_pin?: string | null
    issued_at: string
    revoked: boolean
    signing_status?: string
}

const CATEGORY_LABELS: Record<string, string> = {
    degree: "Degree",
    birth_certificate: "Birth Certificate",
    trade: "Trade",
    business: "Business",
    education: "Education",
    diploma: "Diploma",
    training: "Training",
    professional: "Professional",
    achievement: "Achievement",
    attendance: "Attendance",
    certificate: "Generic",
}

export default function CertificatesPage() {
    const { user } = useAuth()
    const [certs, setCerts] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [nameQuery, setNameQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")

    useEffect(() => {
        const fetchCertificates = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            setLoading(true)
            setError("")
            try {
                const endpoint = user.is_admin
                    ? `${getApiBaseUrl()}/api/certificates`
                    : `${getApiBaseUrl()}/api/certificates/${encodeURIComponent(user.name)}`
                const res = await axios.get<Certificate[]>(endpoint)
                const list = Array.isArray(res.data) ? res.data : []
                setCerts(list)
            } catch {
                setError("Failed to load certificates")
            } finally {
                setLoading(false)
            }
        }

        fetchCertificates()
    }, [user])

    const categoryOptions = useMemo(() => {
        const values = Array.from(new Set(certs.map(c => (c.cert_type || "certificate").toLowerCase()))).sort()
        return values
    }, [certs])

    const filteredCerts = useMemo(() => {
        const q = nameQuery.trim().toLowerCase()
        return certs.filter((c) => {
            const category = (c.cert_type || "certificate").toLowerCase()
            const nameMatch = !q || (c.student_name || "").toLowerCase().includes(q)
            const categoryMatch = categoryFilter === "all" || category === categoryFilter
            return nameMatch && categoryMatch
        })
    }, [certs, nameQuery, categoryFilter])

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <Card className="border border-slate-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">Certificates</CardTitle>
                        <p className="text-sm text-slate-500">Table view with quick filters by category and student name.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2 relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    value={nameQuery}
                                    onChange={(e) => setNameQuery(e.target.value)}
                                    placeholder="Filter by student name"
                                    className="w-full h-10 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                />
                            </div>

                            <div className="relative">
                                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                >
                                    <option value="all">All Categories</option>
                                    {categoryOptions.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {CATEGORY_LABELS[cat] || cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="text-xs text-slate-500">
                            Showing {filteredCerts.length} of {certs.length} certificates
                        </div>

                        {loading ? (
                            <div className="py-16 flex flex-col items-center gap-3 text-slate-500">
                                <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                                <p className="text-sm font-medium">Loading certificates...</p>
                            </div>
                        ) : error ? (
                            <div className="py-8 text-sm text-red-600 font-medium">{error}</div>
                        ) : filteredCerts.length === 0 ? (
                            <div className="py-16 text-center text-slate-500 text-sm border border-dashed border-slate-300 rounded-lg bg-white">
                                No certificates match this filter.
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                                <table className="w-full min-w-[980px] text-sm">
                                    <thead className="bg-slate-100 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Student Name</th>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Category</th>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Certificate</th>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Certificate ID</th>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-700">PIN</th>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Issued</th>
                                            <th className="text-right px-4 py-3 font-semibold text-slate-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCerts.map((cert, i) => {
                                            const category = (cert.cert_type || "certificate").toLowerCase()
                                            const signed = cert.signing_status === "signed"
                                            const statusText = cert.revoked ? "Revoked" : signed ? "Signed" : "Unsigned"
                                            const statusClass = cert.revoked
                                                ? "text-red-700 bg-red-50 border-red-200"
                                                : signed
                                                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                                    : "text-amber-700 bg-amber-50 border-amber-200"

                                            return (
                                                <tr key={cert.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                                    <td className="px-4 py-3 font-medium text-slate-900">{cert.student_name}</td>
                                                    <td className="px-4 py-3 text-slate-700">{CATEGORY_LABELS[category] || category}</td>
                                                    <td className="px-4 py-3 text-slate-700">{cert.course_name || "-"}</td>
                                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{cert.id}</td>
                                                    <td className="px-4 py-3 text-slate-700 font-semibold">{cert.claim_pin || "-"}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${statusClass}`}>
                                                            {statusText}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">{new Date(cert.issued_at).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8"
                                                                onClick={() => window.open(`${getApiBaseUrl()}/api/download/${cert.id}`, "_blank")}
                                                            >
                                                                <Download className="w-3.5 h-3.5 mr-1" />
                                                                PDF
                                                            </Button>
                                                            <Link href={`/verify?id=${cert.id}`}>
                                                                <Button size="sm" className="h-8 bg-sky-600 hover:bg-sky-700 text-white">
                                                                    <Shield className="w-3.5 h-3.5 mr-1" />
                                                                    Verify
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
