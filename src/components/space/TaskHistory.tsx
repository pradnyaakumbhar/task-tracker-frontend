import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
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
  Calendar,
} from 'lucide-react'
import { useAuth } from '@/context/authContext'
import axios from 'axios'

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
  // fetch versions
  const loadVersions = async () => {
    if (!taskId) return

    setLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/task/versions`,
        { taskId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const data = response.data

      if (!response) throw new Error('Failed to load versions')

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
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/task/version/revert`,
        { taskId, version },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response) throw new Error('Failed to revert task')

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

  const isSelected = (version: number) => {
    return selectedVersions.v1 === version || selectedVersions.v2 === version
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-7xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <GitBranch className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Task Version History</span>
            <span className="sm:hidden">Version History</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mr-2" />
            <span className="text-sm sm:text-base">
              Loading version history...
            </span>
          </div>
        ) : versions.length === 0 ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <GitBranch className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                No version history found
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                This task hasn't been updated yet, or version control isn't
                enabled.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Selection Status */}
            {(selectedVersions.v1 || selectedVersions.v2) && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-blue-50 rounded-lg border gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-blue-900">
                    Selected versions:
                  </span>
                  {selectedVersions.v1 && (
                    <Badge variant="outline" className="text-xs">
                      v{selectedVersions.v1}
                    </Badge>
                  )}
                  {selectedVersions.v2 && (
                    <Badge variant="outline" className="text-xs">
                      v{selectedVersions.v2}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="text-xs sm:text-sm"
                >
                  Clear Selection
                </Button>
              </div>
            )}

            {/* Mobile Card Layout */}
            <div className="block sm:hidden space-y-3">
              {versions.map((version) => (
                <Card
                  key={version.id}
                  className={`cursor-pointer transition-colors ${
                    isSelected(version.version)
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleVersionSelect(version.version)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {version.version}
                        </div>
                        <span className="font-medium text-sm truncate max-w-[150px]">
                          {version.title}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          revertToVersion(version.version)
                        }}
                        disabled={revertLoading}
                        className="text-xs h-7"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Revert
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={`${getStatusColor(version.status)} text-xs`}
                      >
                        {getStatusLabel(version.status)}
                      </Badge>
                      <Badge
                        className={`${getPriorityColor(
                          version.priority
                        )} text-xs`}
                      >
                        {getPriorityLabel(version.priority)}
                      </Badge>
                    </div>

                    {version.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(version.dueDate).toLocaleDateString()}
                      </div>
                    )}

                    {version.tags && version.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {version.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {version.tags.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            +{version.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">
                          {version.updater.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(
                            version.versionCreatedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <Card className="hidden sm:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b bg-muted/50">
                        <TableHead className="font-semibold text-xs sm:text-sm">
                          Version
                        </TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm min-w-[120px]">
                          Title
                        </TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm">
                          Priority
                        </TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm hidden md:table-cell">
                          Due Date
                        </TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm hidden lg:table-cell">
                          Tags
                        </TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm">
                          Edited By
                        </TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm">
                          Updated at
                        </TableHead>
                        <TableHead className="w-[80px] sm:w-[100px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {versions.map((version) => (
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
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {version.version}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium max-w-[120px] sm:max-w-[200px] truncate text-xs sm:text-sm">
                            {version.title}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${getStatusColor(
                                version.status
                              )} text-xs`}
                            >
                              {getStatusLabel(version.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${getPriorityColor(
                                version.priority
                              )} text-xs`}
                            >
                              {getPriorityLabel(version.priority)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm hidden md:table-cell">
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
                          <TableCell className="hidden lg:table-cell">
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
                          <TableCell className="text-xs sm:text-sm">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
                              <span className="font-medium truncate max-w-[80px] sm:max-w-[120px]">
                                {version.updater.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-500 flex-shrink-0" />
                              <div>
                                <div>
                                  {new Date(
                                    version.versionCreatedAt
                                  ).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-muted-foreground hidden sm:block">
                                  {new Date(
                                    version.versionCreatedAt
                                  ).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                revertToVersion(version.version)
                              }}
                              disabled={revertLoading}
                              className="w-full text-xs"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Revert</span>
                              <span className="sm:hidden">Rev</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default TaskHistory
