"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
            {/* Results */}
            <AnimatePresence mode="wait">
                {filteredCerts.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative z-10"
                    >
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <table className="min-w-[1100px] w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-black px-3 py-3">Select</th>
                                        <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-black px-3 py-3">Name</th>
                                        <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-black px-3 py-3">Certificate</th>
                                        <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-black px-3 py-3">Category</th>
                                        <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-black px-3 py-3">PIN</th>
                                        <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-black px-3 py-3">ID</th>
                                        <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-black px-3 py-3">Status</th>
                                        <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-black px-3 py-3">Issued</th>
                                        <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-black px-3 py-3">Actions</th>
                                        <th className="text-left text-[10px] uppercase tracking-wider text-slate-500 font-black px-3 py-3">Verify</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCerts.map((cert) => (
                                        <tr
                                            key={cert.id}
                                            className={`border-b border-slate-100 hover:bg-sky-50/40 transition-colors ${selectedIds.has(cert.id) ? "bg-sky-50/60" : ""}`}
                                        >
                                            <td className="px-3 py-3 align-middle">
                                                <Checkbox
                                                    checked={selectedIds.has(cert.id)}
                                                    onCheckedChange={() => toggleSelect(cert.id)}
                                                    className="bg-white border-slate-300 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                                                />
                                            </td>
                                            <td className="px-3 py-3 align-middle">
                                                <div className="text-sm font-bold text-slate-900 capitalize">{cert.student_name}</div>
                                                <div className="text-[11px] text-slate-500 font-medium">{cert.organization || "Academic Institute"}</div>
                                            </td>
                                            <td className="px-3 py-3 align-middle">
                                                <div className="text-sm font-bold text-slate-800 max-w-[260px] truncate" title={cert.course_name}>{cert.course_name}</div>
                                            </td>
                                            <td className="px-3 py-3 align-middle">
                                                <span className="text-xs font-bold text-slate-700 capitalize">{cert.cert_type?.replace(/_/g, " ") || "certificate"}</span>
                                            </td>
                                            <td className="px-3 py-3 align-middle">
                                                {(cert.claim_pin && cert.signing_status === "signed") ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[11px] font-bold text-amber-700">
                                                        <Lock className="w-3 h-3" />
                                                        {cert.claim_pin}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 align-middle">
                                                <span className="font-mono text-[11px] font-bold text-slate-600">#{cert.id.slice(0, 8).toUpperCase()}</span>
                                            </td>
                                            <td className="px-3 py-3 align-middle">
                                                {cert.revoked ? (
                                                    <Badge variant="destructive" className="rounded-full font-black uppercase text-[9px] px-2 py-1">Revoked</Badge>
                                                ) : cert.signing_status === "signed" ? (
                                                    <Badge className="bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-full font-black uppercase text-[9px] px-2 py-1">Signed</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 rounded-full font-black uppercase text-[9px] px-2 py-1">Draft</Badge>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 align-middle text-xs font-semibold text-slate-600">
                                                {new Date(cert.issued_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                            </td>
                                            <td className="px-3 py-3 align-middle">
                                                <div className="flex items-center gap-2">
                                                    {!cert.revoked && user?.is_admin && cert.signing_status === "unsigned" && (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-3 text-[11px] font-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                                                            onClick={() => handleSignRedirect(cert.id)}
                                                        >
                                                            Sign
                                                        </Button>
                                                    )}
                                                    {!cert.revoked && (
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-3 text-[11px] font-black bg-slate-900 hover:bg-slate-800 text-white"
                                                            onClick={() => {
                                                                if (cert.signing_status === "signed" && !cert.revoked) {
                                                                    setViewingCert(cert)
                                                                } else {
                                                                    window.open(`${API}/api/download/${cert.id}`)
                                                                }
                                                            }}
                                                            title={cert.signing_status === "unsigned" ? "Preview Draft PDF" : "View Verified Certificate"}
                                                        >
                                                            {cert.signing_status === "unsigned" ? "Preview" : "View"}
                                                        </Button>
                                                    )}
                                                    {user?.is_admin && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                                                            onClick={() => handleDelete(cert.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 align-middle">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-3 text-[11px] font-black text-sky-600 hover:bg-sky-50"
                                                    onClick={() => window.location.href = `/verify?id=${cert.id}`}
                                                >
                                                    Verify
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                }
            }
        })
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredCerts.map(c => c.id)))
        } else {
            setSelectedIds(new Set())
        }
    }

    const handleBulkRevoke = () => {
        if (selectedIds.size === 0) return
        setModalConfig({
            isOpen: true,
            title: `Revoke ${selectedIds.size} Certificates`,
            description: `You are about to revoke ${selectedIds.size} certificates. This will notify the registry that these credentials are no longer valid.`,
            type: "danger",
            actionLabel: "Revoke Selected",
            isLoading: false,
            onAction: async () => {
                setModalConfig(p => ({ ...p, isLoading: true }))
                try {
                    await axios.post(`${API}/api/certificates/bulk-revoke`, {
                        cert_ids: Array.from(selectedIds)
                    }, { withCredentials: true })
                    fetchCerts()
                    closeModal()
                } catch (err) {
                    setModalConfig({
                        isOpen: true,
                        title: "Bulk Revoke Failed",
                        description: "One or more certificates could not be revoked. Please try again.",
                        type: "danger",
                        actionLabel: "Close",
                        isLoading: false,
                        onAction: closeModal
                    })
                }
            }
        })
    }

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return
        setModalConfig({
            isOpen: true,
            title: `Delete ${selectedIds.size} Documents`,
            description: `This will permanently erase ${selectedIds.size} records and their associated PDF files. This action is irreversible.`,
            type: "danger",
            actionLabel: "Delete Selected",
            isLoading: false,
            onAction: async () => {
                setModalConfig(p => ({ ...p, isLoading: true }))
                try {
                    await axios.post(`${API}/api/certificates/bulk-delete`, {
                        cert_ids: Array.from(selectedIds)
                    }, { withCredentials: true })
                    fetchCerts()
                    closeModal()
                } catch (err) {
                    setModalConfig({
                        isOpen: true,
                        title: "Bulk Delete Failed",
                        description: "One or more records could not be deleted. Please try again.",
                        type: "danger",
                        actionLabel: "Close",
                        isLoading: false,
                        onAction: closeModal
                    })
                }
            }
        })
    }

    const handleSignRedirect = (id: string) => {
        router.push(`/issue?step=2&certId=${id}`)
    }

    const categories = useMemo(() => {
        const existingCats = Array.from(new Set(certs.map(c => c.cert_type || "certificate")))
        // Combine predefined types with any dynamic ones, ensuring "all" is first
        const combined = Array.from(new Set(["all", ...ALL_TYPES, ...existingCats]))
        return combined
    }, [certs])

    const filteredCerts = useMemo(() => {
        return certs.filter(cert => {
            const matchesSearch =
                cert.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cert.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cert.id.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus =
                statusFilter === "all" ? true :
                    statusFilter === "revoked" ? cert.revoked :
                        statusFilter === "signed" ? (cert.signing_status === "signed" && !cert.revoked) :
                            statusFilter === "unsigned" ? (cert.signing_status === "unsigned" && !cert.revoked) : true

            const matchesCategory =
                categoryFilter === "all" ? true : cert.cert_type === categoryFilter

            return matchesSearch && matchesStatus && matchesCategory
        })
    }, [certs, searchTerm, statusFilter, categoryFilter])

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Registry...</p>
            </div>
        )
    }

    return (
        <>
            {/* Certificate Viewer with Banner */}
            {viewingCert && viewingCert.signing_status === 'signed' && !viewingCert.revoked && (
                <CertificateViewer
                    certificateData={{
                        id: viewingCert.id,
                        student_name: viewingCert.student_name,
                        course_name: viewingCert.course_name,
                        issued_at: viewingCert.issued_at,
                        organization: viewingCert.organization || 'EduCerts Academy'
                    }}
                    pdfUrl={`${API}/api/view/${viewingCert.id}`}
                    onClose={() => setViewingCert(null)}
                />
            )}
            
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 relative pb-20 sm:pb-32 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="fixed top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-sky-400/5 rounded-full blur-3xl -mr-24 sm:-mr-48 -mt-24 sm:-mt-48 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-sky-300/5 rounded-full blur-3xl -ml-40 sm:-ml-60 -mb-40 sm:-mb-60 pointer-events-none"></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-sky-200/3 rounded-full blur-3xl pointer-events-none"></div>

            <Modal {...modalConfig} onClose={closeModal} />

            {/* Header Area */}
            <div className="flex flex-col gap-4 sm:gap-6 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Checkbox
                            checked={selectedIds.size > 0 && selectedIds.size === filteredCerts.length}
                            onCheckedChange={handleSelectAll}
                            className="bg-white border-slate-300"
                        />
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-xl shadow-sky-500/30">
                                <Award className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 flex items-center gap-2 sm:gap-3 tracking-tight">
                                <span className="gradient-text">Certificate Registry</span>
                            </h1>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium text-sm sm:text-lg ml-8 sm:ml-16">
                        {user?.is_admin ? "Manage and audit all issued educational credentials." : "Your verifiable academic portfolio."}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="relative w-full sm:w-64 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name... (e.g. John Doe)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 sm:py-3 text-sm text-slate-900 focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 border font-bold shadow-sm"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl border-slate-200 h-10 w-10 sm:h-[46px] sm:w-[46px]"
                        onClick={() => fetchCerts()}
                    >
                        <RefreshCcw className="w-4 h-4 text-slate-600" />
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-gradient-to-r from-white via-slate-50 to-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 flex flex-col gap-3 sm:gap-4 shadow-sm relative z-10">
                <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                    <TabsList className="bg-white border border-slate-200 p-1 h-auto rounded-xl shadow-sm w-full overflow-x-auto">
                        <TabsTrigger value="all" className="rounded-lg px-3 sm:px-4 py-2 font-bold text-[10px] sm:text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-sky-600 data-[state=active]:text-white transition-all capitalize whitespace-nowrap">All ({certs.length})</TabsTrigger>
                        <TabsTrigger value="signed" className="rounded-lg px-3 sm:px-4 py-2 font-bold text-[10px] sm:text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-sky-600 data-[state=active]:text-white transition-all capitalize whitespace-nowrap">Signed</TabsTrigger>
                        <TabsTrigger value="unsigned" className="rounded-lg px-3 sm:px-4 py-2 font-bold text-[10px] sm:text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white transition-all capitalize whitespace-nowrap">Unsigned</TabsTrigger>
                        <TabsTrigger value="revoked" className="rounded-lg px-3 sm:px-4 py-2 font-bold text-[10px] sm:text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-rose-600 data-[state=active]:text-white transition-all capitalize whitespace-nowrap">Revoked</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm hover:border-sky-300 transition-colors flex-1 sm:flex-none">
                        <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-500" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-transparent text-[10px] sm:text-xs font-bold text-slate-700 outline-none border-none focus:ring-0 capitalize w-full"
                        >
                            <option value="all">Every Category</option>
                            {categories.filter(c => c !== "all").map(cat => (
                                <option key={cat} value={cat}>{cat.replace(/_/g, " ")}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="sm"
                            className={`rounded-none px-2 sm:px-3 border-none ${viewMode === "grid" ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white" : "text-slate-500"}`}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="sm"
                            className={`rounded-none px-2 sm:px-3 border-none ${viewMode === "list" ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white" : "text-slate-500"}`}
                            onClick={() => setViewMode("list")}
                        >
                            <ListIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-[40] w-full max-w-2xl px-3 sm:px-4"
                    >
                        <div className="bg-slate-900 text-white rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 shadow-2xl shadow-indigo-500/20 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 backdrop-blur-xl">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="bg-indigo-600 text-white text-[10px] font-black w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full shadow-lg">
                                    {selectedIds.size}
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-slate-300">items selected</p>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                    onClick={handleBulkRevoke}
                                    variant="ghost"
                                    className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-6 rounded-2xl text-[10px] sm:text-xs font-black text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                >
                                    <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                    Revoke
                                </Button>
                                <Button
                                    onClick={handleBulkDelete}
                                    className="flex-1 sm:flex-none h-10 sm:h-12 px-4 sm:px-8 rounded-2xl text-[10px] sm:text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-all active:scale-95"
                                >
                                    <Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence mode="wait">
                {filteredCerts.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10" : "space-y-2 sm:space-y-3 relative z-10"}
                    >
                        {filteredCerts.map((cert) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={cert.id}
                                className={`group relative rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-500 overflow-hidden bg-gradient-to-br from-white via-white to-slate-50 hover:shadow-2xl hover:shadow-sky-500/20 ${cert.revoked
                                    ? "border-rose-200 grayscale-[0.5]"
                                    : cert.signing_status === "signed"
                                        ? "border-sky-200 hover:border-sky-400"
                                        : "border-slate-200 hover:border-sky-400"
                                    } ${selectedIds.has(cert.id) ? "ring-4 ring-sky-500/30 border-sky-500" : ""}`}
                            >
                                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                                    <Checkbox
                                        checked={selectedIds.has(cert.id)}
                                        onCheckedChange={() => toggleSelect(cert.id)}
                                        className="bg-white/90 backdrop-blur border-slate-200 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                                    />
                                </div>

                                <div className={`absolute top-0 left-0 w-full h-1.5 ${cert.revoked ? "bg-gradient-to-r from-rose-500 to-rose-600" : cert.signing_status === "signed" ? "bg-gradient-to-r from-sky-500 to-sky-600" : "bg-gradient-to-r from-sky-400 to-sky-500"}`}></div>

                                <div className="p-3 sm:p-5 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                                        <div className={`p-2 sm:p-3 rounded-2xl shadow-lg ring-1 ring-white/50 ${cert.revoked ? "bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600" :
                                            cert.signing_status === "signed" ? "bg-gradient-to-br from-sky-100 to-sky-200 text-sky-600" : "bg-gradient-to-br from-sky-50 to-sky-100 text-sky-600"
                                            }`}>
                                            <Fingerprint className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1 sm:gap-1.5">
                                            <div className="flex gap-1 sm:gap-1.5">
                                                {cert.revoked ? (
                                                    <Badge variant="destructive" className="rounded-full font-black uppercase text-[8px] sm:text-[9px] px-2 sm:px-2.5 py-0.5 sm:py-1 shadow-sm border border-white">
                                                        Revoked
                                                    </Badge>
                                                ) : cert.signing_status === "signed" ? (
                                                    <Badge className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-full font-black uppercase text-[8px] sm:text-[9px] px-2 sm:px-2.5 py-0.5 sm:py-1 shadow-sm border border-white">
                                                        Signed
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200 rounded-full font-black uppercase text-[8px] sm:text-[9px] px-2 sm:px-2.5 py-0.5 sm:py-1 shadow-sm">
                                                        Draft
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-[8px] sm:text-[9px] text-slate-400 font-mono font-bold tracking-widest bg-slate-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-slate-100">#{cert.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-3 sm:space-y-4">
                                        <div>
                                            <span className="text-[8px] sm:text-[9px] font-black gradient-text uppercase tracking-[0.2em] block mb-1">{cert.cert_type?.replace(/_/g, " ") || "Certificate"}</span>
                                            <h3 className="text-base sm:text-xl font-black text-slate-900 leading-tight group-hover:text-sky-600 transition-colors line-clamp-2 min-h-[1.1em]">{cert.course_name}</h3>
                                        </div>

                                        <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 border-y border-slate-100">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center text-[10px] sm:text-[11px] font-black text-sky-600 border border-white shadow-md shrink-0">
                                                {cert.student_name[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] sm:text-[13px] font-black text-slate-700 capitalize truncate">{cert.student_name}</p>
                                                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{cert.organization || "Academic Institute"}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400">
                                                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                <span className="text-[10px] sm:text-[11px] font-bold">{new Date(cert.issued_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            {(cert.claim_pin && cert.signing_status === 'signed') && (
                                                <div className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded text-[8px] sm:text-[9px] font-black text-amber-600 uppercase tracking-tighter shadow-sm" title="Wallet Claim PIN">
                                                    <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                                    PIN: {cert.claim_pin}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 flex flex-col gap-1.5 sm:gap-2">
                                        <div className="flex gap-1.5 sm:gap-2">
                                            {!cert.revoked && (
                                                <>
                                                    {user?.is_admin && cert.signing_status === "unsigned" && (
                                                        <Button
                                                            size="sm"
                                                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30 font-black rounded-xl h-9 sm:h-10 text-[10px] sm:text-[11px] transition-all hover:scale-[1.02]"
                                                            onClick={() => handleSignRedirect(cert.id)}
                                                        >
                                                            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                                                            Sign
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-black rounded-xl h-9 sm:h-10 text-[10px] sm:text-[11px] transition-all hover:scale-[1.02] shadow-lg shadow-slate-500/30"
                                                        onClick={() => {
                                                            if (cert.signing_status === 'signed' && !cert.revoked) {
                                                                setViewingCert(cert)
                                                            } else {
                                                                window.open(`${API}/api/download/${cert.id}`)
                                                            }
                                                        }}
                                                        title={cert.signing_status === "unsigned" ? "Preview Draft PDF" : "View Verified Certificate"}
                                                    >
                                                        <div className="flex items-center gap-1 sm:gap-1.5">
                                                            {cert.signing_status === "unsigned" ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                                            {cert.signing_status === "unsigned" ? "Preview" : "View"}
                                                        </div>
                                                    </Button>
                                                </>
                                            )}
                                            {user?.is_admin && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="rounded-xl border-slate-200 h-9 w-9 sm:h-10 sm:w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 shrink-0"
                                                    onClick={() => handleDelete(cert.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full h-8 sm:h-9 text-sky-600 hover:bg-sky-50 font-black rounded-xl text-[10px] sm:text-[11px] flex items-center justify-center gap-1 sm:gap-1.5"
                                            onClick={() => window.location.href = `/verify?id=${cert.id}`}
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            Verify
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
                        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 border-dashed border-4 py-16 sm:py-32 rounded-[1.5rem] sm:rounded-[2rem] shadow-none">
                            <CardContent className="flex flex-col items-center space-y-4 sm:space-y-6">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner">
                                    <Award className="w-8 h-8 sm:w-12 sm:h-12 text-slate-300 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-300 uppercase tracking-widest leading-none">No Match Found</h3>
                                    <p className="text-slate-400 max-w-sm mx-auto mt-3 sm:mt-4 font-bold text-xs sm:text-sm">
                                        Try adjusting your filters or search terms. If you haven't issued any certs yet, head over to the Issuance page!
                                    </p>
                                    <Button
                                        variant="link"
                                        className="mt-3 sm:mt-4 text-indigo-600 font-bold text-xs sm:text-sm"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setStatusFilter("all");
                                            setCategoryFilter("all");
                                        }}
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        </>
    )
}
