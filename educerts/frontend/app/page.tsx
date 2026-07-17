"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Shield, FileText, Search, Award, Users, Activity } from "lucide-react"
import axios from "axios"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getApiBaseUrl } from "@/lib/api-config"

interface Certificate {
  id: string
  course_name: string
  student_name: string
  issued_at: string
  revoked: boolean
  signing_status: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalIssued: 0, totalVerified: 0, pending: 0 })
  const [recentCerts, setRecentCerts] = useState<Certificate[]>([])

  const fetchCerts = async () => {
    if (!user) return
    try {
      const endpoint = user.is_admin
        ? `${getApiBaseUrl()}/api/certificates`
        : `${getApiBaseUrl()}/api/certificates/${user.name}`
      const res = await axios.get(endpoint)
      const certs = Array.isArray(res.data) ? res.data : []
      setRecentCerts(certs.slice(0, 3))

      setStats({
        totalIssued: user.is_admin ? certs.length : certs.length,
        totalVerified: user.is_admin ? 892 : 45,
        pending: user.is_admin ? certs.filter((c: Certificate) => c.signing_status === 'unsigned').length : 0
      })
    } catch (error) {
      console.error("Error fetching certs", error)
    }
  }

  useEffect(() => {
    fetchCerts()
  }, [user])

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-400/5 rounded-full blur-3xl -ml-60 -mb-60 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-400/3 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">
              <span className="text-slate-900">Welcome, </span>
              <span className="gradient-text">{user?.name}</span>
            </h1>
          </div>
          <p className="text-slate-600 text-lg ml-15">Manage your digital certificates</p>
        </div>
        <div className="flex gap-3">
          <Link href="/verify">
            <Button variant="outline" className="flex items-center gap-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50">
              <Search className="w-4 h-4" />
              Verify
            </Button>
          </Link>
          {user?.is_admin && (
            <Link href="/issue">
              <Button className="flex items-center gap-2 gradient-bg hover:opacity-90 shadow-lg shadow-indigo-500/30">
                <FileText className="w-4 h-4" />
                Issue New
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <Card className="premium-card border-l-4 border-l-indigo-500 hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Certificates</CardTitle>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Award className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold gradient-text">{stats.totalIssued}</div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Issued credentials</p>
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{width: '75%'}}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="premium-card border-l-4 border-l-purple-500 hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Verifications</CardTitle>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold" style={{color: '#7c3aed'}}>{stats.totalVerified}</div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Successful verifications</p>
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full" style={{width: '92%'}}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card border-l-4 border-l-violet-500 hover:scale-105 transition-transform duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">{user?.is_admin ? "Pending" : "Available"}</CardTitle>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold" style={{color: '#8b5cf6'}}>{user?.is_admin ? stats.pending : stats.totalIssued}</div>
            <p className="text-xs text-slate-500 mt-2 font-medium">{user?.is_admin ? "Awaiting signature" : "Your credentials"}</p>
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{width: '60%'}}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Certificates */}
      <Card className="premium-card relative z-10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Recent Certificates
          </CardTitle>
          <Link href="/certificates">
            <Button variant="outline" size="sm" className="border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentCerts.length > 0 ? (
            <div className="space-y-3">
              {recentCerts.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all bg-gradient-to-r from-white via-slate-50 to-white hover:from-indigo-50/50 hover:via-purple-50/50 hover:to-indigo-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-lg">{cert.course_name}</p>
                      <p className="text-sm text-slate-600">{cert.student_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 font-medium">
                      {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {cert.revoked ? (
                        <span className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-semibold border border-red-200 shadow-sm">Revoked</span>
                      ) : cert.signing_status === 'signed' ? (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-semibold border border-emerald-200 shadow-sm">Signed</span>
                      ) : (
                        <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-semibold border border-amber-200 shadow-sm">Draft</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <p className="font-semibold text-lg text-slate-700">No certificates found</p>
              <p className="text-sm text-slate-400 mt-2">Start by issuing your first certificate</p>
              {user?.is_admin && (
                <Link href="/issue" className="inline-block mt-4">
                  <Button className="gradient-bg shadow-lg shadow-indigo-500/30">
                    Issue Your First Certificate
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="premium-card relative z-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Security Protocol</span>
                </div>
                <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-lg shadow-sm">OpenAttestation v2.0</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Encryption</span>
                </div>
                <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-lg shadow-sm">Ed25519</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-violet-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Hash Algorithm</span>
                </div>
                <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-lg shadow-sm">SHA-256</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                  <span className="text-sm font-medium text-emerald-700">Status</span>
                </div>
                <span className="text-sm font-bold text-emerald-600 bg-white px-3 py-1 rounded-lg shadow-sm border border-emerald-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Operational
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
