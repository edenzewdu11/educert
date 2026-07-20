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
    <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-400/5 to-indigo-500/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-sky-300/5 to-cyan-400/5 rounded-full blur-3xl -ml-60 -mb-60 pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              Welcome back, <span className="text-sky-600">{user?.name}</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-2">Manage and verify your digital credentials</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link href="/verify">
              <Button variant="outline" className="flex items-center gap-2 border-slate-200 hover:border-sky-400 hover:bg-sky-50 text-sm">
                <Search className="w-4 h-4" />
                Verify
              </Button>
            </Link>
            {user?.is_admin && (
              <Link href="/issue">
                <Button className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-sm">
                  <FileText className="w-4 h-4" />
                  Issue Certificate
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        <Card className="border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">Total Certificates</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
              <Award className="h-5 w-5 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalIssued}</div>
            <p className="text-xs text-slate-500 mt-1">Issued credentials</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">Verifications</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
              <Activity className="h-5 w-5 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalVerified}</div>
            <p className="text-xs text-slate-500 mt-1">Successful verifications</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">{user?.is_admin ? "Pending" : "Available"}</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{user?.is_admin ? stats.pending : stats.totalIssued}</div>
            <p className="text-xs text-slate-500 mt-1">{user?.is_admin ? "Awaiting signature" : "Your credentials"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Certificates */}
      <Card className="border border-slate-200 relative z-10">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Certificates</CardTitle>
          <Link href="/certificates">
            <Button variant="ghost" size="sm" className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 text-sm font-medium">View all →</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentCerts.length > 0 ? (
            <div className="space-y-3">
              {recentCerts.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-sky-300 hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{cert.course_name}</p>
                      <p className="text-sm text-slate-500">{cert.student_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-slate-500">
                      {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                    {cert.revoked ? (
                      <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full font-medium">Revoked</span>
                    ) : cert.signing_status === 'signed' ? (
                      <span className="text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded-full font-medium">Signed</span>
                    ) : (
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium">Draft</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">No certificates found</p>
              <p className="text-sm text-slate-400 mt-1">Start by issuing your first certificate</p>
              {user?.is_admin && (
                <Link href="/issue" className="inline-block mt-4">
                  <Button className="bg-sky-600 hover:bg-sky-700 text-sm">
                    Issue Your First Certificate
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
