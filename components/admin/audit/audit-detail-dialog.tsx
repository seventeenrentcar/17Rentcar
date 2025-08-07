"use client"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { AuditTrail, AdminActivityLog } from "@/lib/types"
import { Database, User, Calendar, Activity, Globe, FileText } from "lucide-react"

interface AuditDetailDialogProps {
  auditTrail?: AuditTrail | null
  activityLog?: AdminActivityLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatDateTime = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  } catch {
    return dateString
  }
}

const getActionBadge = (action: string) => {
  switch (action) {
    case 'INSERT':
      return <Badge variant="outline" className="text-green-600 border-green-600">CREATE</Badge>
    case 'UPDATE':
      return <Badge variant="outline" className="text-blue-600 border-blue-600">UPDATE</Badge>
    case 'DELETE':
      return <Badge variant="outline" className="text-red-600 border-red-600">DELETE</Badge>
    default:
      const actionType = action.toLowerCase()
      if (actionType.includes('login') || actionType.includes('logout')) {
        return <Badge variant="outline" className="text-blue-600 border-blue-600">AUTH</Badge>
      } else if (actionType.includes('create') || actionType.includes('add')) {
        return <Badge variant="outline" className="text-green-600 border-green-600">CREATE</Badge>
      } else if (actionType.includes('update') || actionType.includes('edit')) {
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">UPDATE</Badge>
      } else if (actionType.includes('delete') || actionType.includes('remove')) {
        return <Badge variant="outline" className="text-red-600 border-red-600">DELETE</Badge>
      } else {
        return <Badge variant="outline">{action}</Badge>
      }
  }
}

const formatJSON = (obj: any) => {
  if (!obj) return 'null'
  return JSON.stringify(obj, null, 2)
}

const JsonViewer = ({ data, title }: { data: any; title: string }) => {
  if (!data) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-48 text-gray-800">
          {formatJSON(data)}
        </pre>
      </CardContent>
    </Card>
  )
}

export function AuditDetailDialog({ auditTrail, activityLog, open, onOpenChange }: AuditDetailDialogProps) {
  const isAuditTrail = !!auditTrail
  const data = auditTrail || activityLog

  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAuditTrail ? (
              <>
                <Database className="h-5 w-5" />
                Detail Audit Trail
              </>
            ) : (
              <>
                <Activity className="h-5 w-5" />
                Detail Activity Log
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informasi Dasar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">ID:</span>
                  <div className="font-mono text-sm">{data.id}</div>
                </div>
                
                {isAuditTrail ? (
                  <>
                    <div>
                      <span className="text-gray-600 text-sm">Tabel:</span>
                      <div className="font-medium">{(data as AuditTrail).table_name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Record ID:</span>
                      <div className="font-mono text-sm">{(data as AuditTrail).record_id}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Aksi:</span>
                      <div>{getActionBadge((data as AuditTrail).action)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Waktu Perubahan:</span>
                      <div>{formatDateTime((data as AuditTrail).changed_at)}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-gray-600 text-sm">Aksi:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{(data as AdminActivityLog).action}</span>
                        {getActionBadge((data as AdminActivityLog).action)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Resource Type:</span>
                      <div>{(data as AdminActivityLog).resource_type || '-'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Resource ID:</span>
                      <div className="font-mono text-sm">{(data as AdminActivityLog).resource_id || '-'}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Waktu:</span>
                      <div>{formatDateTime((data as AdminActivityLog).created_at)}</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isAuditTrail ? (
                <div>
                  {(data as AuditTrail).admin_profiles ? (
                    <div>
                      <div className="font-medium">
                        {(data as AuditTrail).admin_profiles?.full_name || 'Unnamed Admin'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {(data as AuditTrail).admin_profiles?.email}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">System/Unknown</span>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">Nama:</span>
                    <div className="font-medium">
                      {(data as AdminActivityLog).admin_profiles.full_name || 'Unnamed Admin'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Email:</span>
                    <div>{(data as AdminActivityLog).admin_profiles.email}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">IP Address:</span>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="font-mono">
                        {(data as AdminActivityLog).ip_address || '-'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">User Agent:</span>
                    <div className="text-sm text-gray-600 truncate">
                      {(data as AdminActivityLog).user_agent || '-'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Changes (Audit Trail) */}
          {isAuditTrail && (
            <div className="space-y-4">
              {(data as AuditTrail).old_values && (
                <JsonViewer 
                  data={(data as AuditTrail).old_values} 
                  title="Data Lama (Old Values)" 
                />
              )}
              
              {(data as AuditTrail).new_values && (
                <JsonViewer 
                  data={(data as AuditTrail).new_values} 
                  title="Data Baru (New Values)" 
                />
              )}

              {(data as AuditTrail).action === 'UPDATE' && 
               (data as AuditTrail).old_values && 
               (data as AuditTrail).new_values && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Perubahan yang Terjadi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.keys((data as AuditTrail).new_values || {}).map(key => {
                        const oldValue = (data as AuditTrail).old_values?.[key]
                        const newValue = (data as AuditTrail).new_values?.[key]
                        
                        if (oldValue !== newValue) {
                          return (
                            <div key={key} className="border-l-2 border-blue-200 pl-3 py-1">
                              <div className="text-sm font-medium text-gray-700">{key}:</div>
                              <div className="text-sm">
                                <span className="text-red-600 line-through">
                                  {String(oldValue)}
                                </span>
                                {' → '}
                                <span className="text-green-600 font-medium">
                                  {String(newValue)}
                                </span>
                              </div>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Details (Activity Log) */}
          {!isAuditTrail && (data as AdminActivityLog).details && (
            <JsonViewer 
              data={(data as AdminActivityLog).details} 
              title="Detail Aktivitas" 
            />
          )}

          {/* Full User Agent (Activity Log) */}
          {!isAuditTrail && (data as AdminActivityLog).user_agent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">User Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono break-all">
                  {(data as AdminActivityLog).user_agent}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
