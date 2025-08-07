"use client"

import { useState, useEffect } from "react"
import { useAuditLog } from "@/hooks/use-audit-log"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AuditTrailsTable } from "@/components/admin/tables/audit-trails-table"
import { ActivityLogsTable } from "@/components/admin/tables/activity-logs-table"
import { AuditDetailDialog } from "./audit-detail-dialog"
import { 
  Search, 
  Database, 
  Activity, 
  Calendar, 
  Filter,
  RefreshCw,
  Download
} from "lucide-react"
import { motion } from "framer-motion"
import type { AuditTrail, AdminActivityLog } from "@/lib/types"

export function AuditLogPage() {
  const { 
    auditTrails, 
    activityLogs, 
    loading, 
    error, 
    searchAuditTrails,
    searchActivityLogs,
    getTableNames,
    getResourceTypes,
    refetch 
  } = useAuditLog()
  
  const [activeTab, setActiveTab] = useState("audit-trails")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTable, setSelectedTable] = useState<string>("all")
  const [selectedAction, setSelectedAction] = useState<string>("all")
  const [selectedResourceType, setSelectedResourceType] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedAuditTrail, setSelectedAuditTrail] = useState<AuditTrail | null>(null)
  const [selectedActivityLog, setSelectedActivityLog] = useState<AdminActivityLog | null>(null)
  
  const [filteredAuditTrails, setFilteredAuditTrails] = useState<AuditTrail[]>([])
  const [filteredActivityLogs, setFilteredActivityLogs] = useState<AdminActivityLog[]>([])
  const [tableNames, setTableNames] = useState<string[]>([])
  const [resourceTypes, setResourceTypes] = useState<string[]>([])

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      const [tableNamesResult, resourceTypesResult] = await Promise.all([
        getTableNames(),
        getResourceTypes()
      ])
        if (tableNamesResult.success) {
        setTableNames(tableNamesResult.data || [])
      }
      
      if (resourceTypesResult.success) {
        setResourceTypes(resourceTypesResult.data || [])
      }
    }
    
    loadFilterOptions()
  }, [])

  // Filter audit trails
  useEffect(() => {
    let filtered = auditTrails

    if (searchTerm) {
      filtered = filtered.filter(trail => 
        trail.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trail.record_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trail.action.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedTable !== "all") {
      filtered = filtered.filter(trail => trail.table_name === selectedTable)
    }

    if (selectedAction !== "all") {
      filtered = filtered.filter(trail => trail.action === selectedAction)
    }

    setFilteredAuditTrails(filtered)
  }, [auditTrails, searchTerm, selectedTable, selectedAction])

  // Filter activity logs
  useEffect(() => {
    let filtered = activityLogs

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.admin_profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedResourceType !== "all") {
      filtered = filtered.filter(log => log.resource_type === selectedResourceType)
    }

    setFilteredActivityLogs(filtered)
  }, [activityLogs, searchTerm, selectedResourceType])

  const handleViewAuditTrail = (trail: AuditTrail) => {
    setSelectedAuditTrail(trail)
    setSelectedActivityLog(null)
    setIsDetailOpen(true)
  }

  const handleViewActivityLog = (log: AdminActivityLog) => {
    setSelectedActivityLog(log)
    setSelectedAuditTrail(null)
    setIsDetailOpen(true)
  }

  const handleSearch = async () => {
    if (activeTab === "audit-trails") {
      const filters = {
        table_name: selectedTable !== "all" ? selectedTable : undefined,
        action: selectedAction !== "all" ? selectedAction : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: 200
      }
        const result = await searchAuditTrails(filters)
      if (result.success) {
        setFilteredAuditTrails(result.data || [])
      }
    } else {
      const filters = {
        resource_type: selectedResourceType !== "all" ? selectedResourceType : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: 200
      }
        const result = await searchActivityLogs(filters)
      if (result.success) {
        setFilteredActivityLogs(result.data || [])
      }
    }
  }

  const handleReset = () => {
    setSearchTerm("")
    setSelectedTable("all")
    setSelectedAction("all")
    setSelectedResourceType("all")
    setDateFrom("")
    setDateTo("")
    refetch()
  }

  // Calculate statistics
  const auditStats = {
    total: auditTrails.length,
    creates: auditTrails.filter(t => t.action === 'INSERT').length,
    updates: auditTrails.filter(t => t.action === 'UPDATE').length,
    deletes: auditTrails.filter(t => t.action === 'DELETE').length
  }

  const activityStats = {
    total: activityLogs.length,
    unique_admins: new Set(activityLogs.map(l => l.admin_id)).size,
    today: activityLogs.filter(l => {
      const today = new Date().toDateString()
      return new Date(l.created_at).toDateString() === today
    }).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit & Activity Log</h1>
          <p className="text-gray-600">Monitor semua perubahan data dan aktivitas admin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Audit</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {auditStats.creates} creates, {auditStats.updates} updates
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {activityStats.unique_admins} admin aktif
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityStats.today}</div>
              <p className="text-xs text-muted-foreground">Aktivitas hari ini</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Penghapusan</CardTitle>
              <Database className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{auditStats.deletes}</div>
              <p className="text-xs text-muted-foreground">Data yang dihapus</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-sm border"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-700">Filter Data</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {activeTab === "audit-trails" ? (
            <>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tabel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tabel</SelectItem>
                  {tableNames.map((tableName) => (
                    <SelectItem key={tableName} value={tableName}>
                      {tableName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Aksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Aksi</SelectItem>
                  <SelectItem value="INSERT">CREATE</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : (
            <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Resource</SelectItem>
                {resourceTypes.map((resourceType) => (
                  <SelectItem key={resourceType} value={resourceType}>
                    {resourceType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button onClick={handleSearch} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Cari
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm text-gray-600">Dari Tanggal:</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Sampai Tanggal:</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {/* Tabs for Audit Trails and Activity Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audit-trails" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Audit Trails ({auditStats.total})
            </TabsTrigger>
            <TabsTrigger value="activity-logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity Logs ({activityStats.total})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audit-trails" className="mt-6">
            <AuditTrailsTable
              auditTrails={filteredAuditTrails}
              onView={handleViewAuditTrail}
            />
          </TabsContent>

          <TabsContent value="activity-logs" className="mt-6">
            <ActivityLogsTable
              activityLogs={filteredActivityLogs}
              onView={handleViewActivityLog}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Detail Dialog */}
      <AuditDetailDialog
        auditTrail={selectedAuditTrail}
        activityLog={selectedActivityLog}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
