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
import { MoreHorizontal, Eye, Activity, User, Calendar, Globe } from "lucide-react"
import type { AdminActivityLog } from "@/lib/types"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface ActivityLogsTableProps {
  activityLogs: AdminActivityLog[]
  onView: (log: AdminActivityLog) => void
}

const getActionBadge = (action: string) => {
  const actionType = action.toLowerCase()
  
  if (actionType.includes('login') || actionType.includes('logout')) {
    return <Badge variant="outline" className="text-blue-600 border-blue-600">AUTH</Badge>
  } else if (actionType.includes('create') || actionType.includes('add')) {
    return <Badge variant="outline" className="text-green-600 border-green-600">CREATE</Badge>
  } else if (actionType.includes('update') || actionType.includes('edit')) {
    return <Badge variant="outline" className="text-yellow-600 border-yellow-600">UPDATE</Badge>
  } else if (actionType.includes('delete') || actionType.includes('remove')) {
    return <Badge variant="outline" className="text-red-600 border-red-600">DELETE</Badge>
  } else if (actionType.includes('view') || actionType.includes('read')) {
    return <Badge variant="outline" className="text-gray-600 border-gray-600">VIEW</Badge>
  } else {
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

const getResourceDisplayName = (resourceType: string | null) => {
  if (!resourceType) return null
  
  const resourceMap: Record<string, string> = {
    'vehicles': 'Kendaraan',
    'bookings': 'Booking',
    'admin_profiles': 'Admin',
    'notifications': 'Notifikasi',
    'users': 'Users',
    'content_pages': 'Halaman',
    'testimonials': 'Testimonial',
    'faqs': 'FAQ',
    'system_settings': 'Pengaturan',
    'admin_session': 'Sesi Admin'
  }
  return resourceMap[resourceType] || resourceType
}

const truncateId = (id: string | null) => {
  if (!id) return null
  return id.slice(-8).toUpperCase()
}

const formatAction = (action: string) => {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

export function ActivityLogsTable({ activityLogs, onView }: ActivityLogsTableProps) {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aksi</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Waktu</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activityLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                Belum ada activity log
              </TableCell>
            </TableRow>
          ) : (
            activityLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{formatAction(log.action)}</div>
                      <div className="flex items-center mt-1">
                        {getActionBadge(log.action)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {log.resource_type ? (
                    <div>
                      <div className="font-medium">{getResourceDisplayName(log.resource_type)}</div>
                      {log.resource_id && (
                        <div className="text-xs text-gray-500 font-mono">
                          ID: {truncateId(log.resource_id)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {log.admin_profiles.full_name || 'Unnamed Admin'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.admin_profiles.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {log.ip_address ? (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-sm">{log.ip_address}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      {formatDateTime(log.created_at)}
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
                      <DropdownMenuItem onClick={() => onView(log)}>
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
