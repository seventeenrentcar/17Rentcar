"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Database, User, Calendar } from "lucide-react"
import type { AuditTrail } from "@/lib/types"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface AuditTrailsTableProps {
  auditTrails: AuditTrail[]
  onView: (trail: AuditTrail) => void
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
      return <Badge variant="outline">{action}</Badge>
  }
}

const formatDateTime = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm:ss', { locale: id })
  } catch {
    return dateString
  }
}

const getTableDisplayName = (tableName: string) => {
  const tableMap: Record<string, string> = {
    'vehicles': 'Kendaraan',
    'bookings': 'Booking',
    'admin_profiles': 'Admin Profiles',
    'notifications': 'Notifikasi',
    'users': 'Users',
    'content_pages': 'Content Pages',
    'testimonials': 'Testimonial',
    'faqs': 'FAQ',
    'system_settings': 'System Settings'
  }
  return tableMap[tableName] || tableName
}

const truncateId = (id: string) => {
  return id.slice(-8).toUpperCase()
}

export function AuditTrailsTable({ auditTrails, onView }: AuditTrailsTableProps) {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tabel</TableHead>
            <TableHead>Record ID</TableHead>
            <TableHead>Aksi</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Waktu</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditTrails.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                Belum ada audit trail
              </TableCell>
            </TableRow>
          ) : (
            auditTrails.map((trail) => (
              <TableRow key={trail.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{getTableDisplayName(trail.table_name)}</div>
                      <div className="text-xs text-gray-500">{trail.table_name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{truncateId(trail.record_id)}</span>
                </TableCell>
                <TableCell>{getActionBadge(trail.action)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      {trail.admin_profiles ? (
                        <>
                          <div className="font-medium">
                            {trail.admin_profiles.full_name || 'Unnamed Admin'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {trail.admin_profiles.email}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">System/Unknown</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      {formatDateTime(trail.changed_at)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(trail)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
