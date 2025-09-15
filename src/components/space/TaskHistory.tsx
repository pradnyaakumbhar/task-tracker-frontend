import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Clock,
  User,
  GitBranch,
  RotateCcw,
  Loader2,
  ArrowRight,
  Calendar,
  Eye,
} from 'lucide-react'
import { useAuth } from '@/context/authContext'

interface TaskVersion {
  id: string
  version: number
  title: string
  description?: string
  comment?: string
  status: string
  priority: string
  tags: string[]
  dueDate?: string
  updater: {
    id: string
    name: string
    email: string
  }
  taskCreatedAt: string
  versionCreatedAt: string
  updateReason?: string
}

interface TaskHistoryProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  taskId: string | null
  onTaskUpdated?: () => void
}

const TaskHistory = ({
  isOpen,
  onOpenChange,
  taskId,
  onTaskUpdated,
}: TaskHistoryProps) => {
  const [versions, setVersions] = useState<TaskVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVersions, setSelectedVersions] = useState<{
    v1: number | null
    v2: number | null
  }>({ v1: null, v2: null })
  const [revertLoading, setRevertLoading] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    if (isOpen && taskId) {
      loadVersions()
    }
  }, [isOpen, taskId])

  const loadVersions = async () => {
    if (!taskId) return

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/task/versions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      })

      if (!response.ok) throw new Error('Failed to load versions')

      const data = await response.json()
      setVersions(data.versions || [])
    } catch (error) {
      console.error('Error loading versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const revertToVersion = async (version: number) => {
    if (!taskId) return

    setRevertLoading(true)
    try {
      const response = await fetch(
        'http://localhost:3000/api/task/version/revert',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId, version }),
        }
      )

      if (!response.ok) throw new Error('Failed to revert task')

      await loadVersions()
      onTaskUpdated?.()
      setSelectedVersions({ v1: null, v2: null })
    } catch (error) {
      console.error('Error reverting task:', error)
    } finally {
      setRevertLoading(false)
    }
  }

  const handleVersionSelect = (version: number) => {
    if (!selectedVersions.v1) {
      setSelectedVersions({ v1: version, v2: null })
    } else if (!selectedVersions.v2 && version !== selectedVersions.v1) {
      setSelectedVersions({ ...selectedVersions, v2: version })
    } else {
      setSelectedVersions({ v1: version, v2: null })
    }
  }

  const clearSelection = () => {
    setSelectedVersions({ v1: null, v2: null })
  }

  const getStatusColor = (status: string): string => {
    const colors = {
      TODO: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      IN_REVIEW: 'bg-yellow-100 text-yellow-800',
      DONE: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string): string => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    }
    return (
      colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    )
  }

  const getStatusLabel = (status: string): string => {
    const labels = {
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      IN_REVIEW: 'In Review',
      DONE: 'Done',
      CANCELLED: 'Cancelled',
    }
    return labels[status as keyof typeof labels] || status
  }

  const getPriorityLabel = (priority: string): string => {
    return priority.charAt(0) + priority.slice(1).toLowerCase()
  }

  const formatValue = (value: any, field: string): string => {
    if (field === 'tags' && Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'No tags'
    }
    if (field === 'dueDate' && value) {
      return new Date(value).toLocaleDateString()
    }
    return value || 'Not set'
  }

  const formatFieldName = (field: string): string => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
  }

  const isSelected = (version: number) => {
    return selectedVersions.v1 === version || selectedVersions.v2 === version
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Task Version History
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading version history...
          </div>
        ) : versions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No version history found
              </h3>
              <p className="text-muted-foreground">
                This task hasn't been updated yet, or version control isn't
                enabled.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Selection Status */}
            {(selectedVersions.v1 || selectedVersions.v2) && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-900">
                    Selected versions:
                  </span>
                  {selectedVersions.v1 && (
                    <Badge variant="outline">v{selectedVersions.v1}</Badge>
                  )}
                  {selectedVersions.v2 && (
                    <Badge variant="outline">v{selectedVersions.v2}</Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
            )}

            {/* Version Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b bg-muted/50">
                      <TableHead className="font-semibold">Version</TableHead>
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">Due Date</TableHead>
                      <TableHead className="font-semibold">Tags</TableHead>
                      <TableHead className="font-semibold">Edited By</TableHead>
                      <TableHead className="font-semibold">
                        Updated at
                      </TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.map((version, index) => (
                      <TableRow
                        key={version.id}
                        className={`cursor-pointer transition-colors ${
                          isSelected(version.version)
                            ? 'bg-blue-50 hover:bg-blue-100'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleVersionSelect(version.version)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {version.version}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {version.title}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(version.status)}>
                            {getStatusLabel(version.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(version.priority)}>
                            {getPriorityLabel(version.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {version.dueDate ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(version.dueDate).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              No date
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {version.tags?.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs px-1 py-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {version.tags?.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs px-1 py-0"
                              >
                                +{version.tags.length - 2}
                              </Badge>
                            )}
                            {(!version.tags || version.tags.length === 0) && (
                              <span className="text-xs text-muted-foreground">
                                No tags
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-500" />
                            <span className="font-medium">
                              {version.updater.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span>
                              {new Date(
                                version.versionCreatedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(
                              version.versionCreatedAt
                            ).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* {index !== 0 && ( */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              revertToVersion(version.version)
                            }}
                            disabled={revertLoading}
                            className="w-full"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Revert
                          </Button>
                          {/* )} */}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default TaskHistory
