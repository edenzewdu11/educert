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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome, {user?.name}</h1>
          <p className="text-slate-600">Manage your digital certificates</p>
        </div>
        <div className="flex gap-3">
          <Link href="/verify">
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Verify
            </Button>
          </Link>
          {user?.is_admin && (
            <Link href="/issue">
              <Button className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Issue New
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIssued}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verifications</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVerified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{user?.is_admin ? "Pending" : "Available"}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.is_admin ? stats.pending : stats.totalIssued}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Certificates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Certificates</CardTitle>
          <Link href="/certificates">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentCerts.length > 0 ? (
            <div className="space-y-3">
              {recentCerts.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{cert.course_name}</p>
                      <p className="text-sm text-slate-600">{cert.student_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {cert.revoked ? (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Revoked</span>
                      ) : cert.signing_status === 'signed' ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Signed</span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Draft</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No certificates found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Security Protocol</span>
                <span className="text-sm font-medium">OpenAttestation v2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Encryption</span>
                <span className="text-sm font-medium">Ed25519</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Hash Algorithm</span>
                <span className="text-sm font-medium">SHA-256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Status</span>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
