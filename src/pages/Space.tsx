import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Filter,
  Settings,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  X,
  Eye,
  GitBranch,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWorkspace } from '@/context/workspaceContext'
import { useAuth } from '@/context/authContext'
import {
  CreateTask,
  UpdateSpace,
  DeleteSpace,
  DeleteTask,
  EditTask,
  TaskHistory,
} from '@/components/space'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
}

interface Task {
  id: string
  title: string
  description: string | null
  comment: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignee?: User | null
  reporter: User
  creator: User
  dueDate: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
  taskNumber?: string
  version?: number
}

interface TaskDetails extends Task {
  spaceNumber?: string
  workspaceNumber?: string
}

interface WorkspaceMember {
  id: string
  name: string
  email: string
}

type WorkspaceSpace = {
  id: string
  name: string
  description?: string | null
  spaceNumber: string
}

const Space = () => {
  const { workspaceNumber, spaceNumber } = useParams()
  const navigate = useNavigate()
  const { selectedWorkspace, workspaceDetails, refreshWorkspaces } =
    useWorkspace()
  const { token, user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>(
    []
  )

  // Dialog states
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskDetails | null>(null)
  const [editingTask, setEditingTask] = useState<TaskDetails | null>(null)
  const [updateLoading, setUpdateLoading] = useState(false)

  // Version control states
  const [isTaskHistoryOpen, setIsTaskHistoryOpen] = useState(false)
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState<
    string | null
  >(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [dueDateFilter, setDueDateFilter] = useState('all')

  const currentSpace: WorkspaceSpace | undefined =
    workspaceDetails?.spaces?.find(
      (space) => space.spaceNumber === spaceNumber
    ) ||
    selectedWorkspace?.spaces?.find(
      (space) => space.spaceNumber === spaceNumber
    )

  useEffect(() => {
    fetchTasks()
    if (workspaceDetails?.members) {
      const members = workspaceDetails.members
      const owner = workspaceDetails.owner
      console.log(owner, members)

      const allMembers =
        owner && !members.some((m) => m.id === owner.id)
          ? [owner, ...members]
          : members
      console.log(allMembers)

      setWorkspaceMembers(allMembers)
    }
  }, [currentSpace?.id, workspaceDetails])

  const fetchTasks = async () => {
    if (!currentSpace?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/space/tasks`,
        { spaceId: currentSpace.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response) {
        throw new Error('Failed to fetch tasks')
      }

      const data = await response.data
      setTasks(data.tasks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchTaskDetails = async (taskId: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/task/details`,
        { taskId: taskId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response) {
        throw new Error('Failed to fetch task details')
      }

      const data = await response.data
      setSelectedTask(data.task)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch task details'
      )
    } 
  }

  const updateTask = async (
    taskId: string,
    updateData: Partial<TaskDetails>
  ) => {
    setUpdateLoading(true)
    try {
      const payload: any = {
        title: updateData.title,
        description: updateData.description,
        comment: updateData.comment,
        status: updateData.status,
        priority: updateData.priority,
        dueDate: updateData.dueDate,
        tags: updateData.tags,
        assigneeId: updateData.assignee?.id || null,
        reporterId: updateData.reporter?.id,
      }

      const response = await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}/api/task/update/${taskId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await response.data
      if (!response) {
        const errorData = await data.error
        throw new Error(errorData.error || 'Failed to update task')
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, ...data.task } : task
        )
      )

      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, ...data.task })
      }

      setIsEditTaskOpen(false)
      setEditingTask(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    } finally {
      setUpdateLoading(false)
    }
  }

  const deleteTask = async (taskId: string) => {
    setDeleteLoading(true)
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BASE_URL}/api/task/delete/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const data = response.data
      if (!response) {
        const errorData = await data.error
        throw new Error(errorData.error || 'Failed to delete task')
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))

      if (selectedTask?.id === taskId) {
        setSelectedTask(null)
      }
      if (editingTask?.id === taskId) {
        setIsEditTaskOpen(false)
        setEditingTask(null)
      }

      setIsDeleteTaskDialogOpen(false)
      setTaskToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    } finally {
      setDeleteLoading(false)
    }
  }

  const canEditTask = (task: TaskDetails | Task): boolean => {
    if (!user) return false
    return (
      user.id === task.creator?.id ||
      user.id === task.assignee?.id ||
      user.id === task.reporter?.id
    )
  }

  const handleViewTask = async (task: Task) => {
    setSelectedTaskForHistory(task.id)
    setIsTaskHistoryOpen(true)
  }

  const handleTaskUpdatedFromHistory = async () => {
    await fetchTasks()
    if (selectedTask) {
      await fetchTaskDetails(selectedTask.id)
    }
  }

  const handleEditTask = async (task: Task) => {
    if (!canEditTask(task)) {
      setError(
        'You can only edit tasks where you are the creator, assignee, or reporter'
      )
      return
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/task/details`,
        { taskId: task.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response) {
        throw new Error('Failed to fetch task details')
      }

      const data = await response.data
      setEditingTask(data.task)
      setIsEditTaskOpen(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch task details'
      )
    } 
  }

  const handleDeleteTask = (task: Task) => {
    if (!canEditTask(task)) {
      setError(
        'You can only delete tasks where you are the creator, assignee, or reporter'
      )
      return
    }
    setTaskToDelete(task)
    setIsDeleteTaskDialogOpen(true)
  }

  const handleUpdateTask = async (updateData: Partial<TaskDetails>) => {
    if (!editingTask) return
    await updateTask(editingTask.id, updateData)
  }

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return
    await deleteTask(taskToDelete.id)
  }

  const handleSpaceUpdated = async () => {
    if (refreshWorkspaces) {
      await refreshWorkspaces()
    }
  }

  const handleSpaceDeleted = async () => {
    if (refreshWorkspaces) {
      await refreshWorkspaces()
    }
    navigate(`/workspace/${workspaceNumber}`)
  }

  const handleTaskCreated = async () => {
    await fetchTasks()
  }

  const getAvailableMembers = () => {
    if (workspaceDetails?.members) {
      const members = workspaceDetails.members
      const owner = workspaceDetails.owner
      console.log(owner, members)

      const allMembers =
        owner && !members.some((m) => m.id === owner.id)
          ? [owner, ...members]
          : members

      return allMembers
    }
    return []
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'DONE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'TODO':
        return 'To Do'
      case 'IN_PROGRESS':
        return 'In Progress'
      case 'IN_REVIEW':
        return 'In Review'
      case 'DONE':
        return 'Done'
      case 'CANCELLED':
        return 'Cancelled'
      default:
        return status
    }
  }

  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case 'URGENT':
        return 'Urgent'
      case 'HIGH':
        return 'High'
      case 'MEDIUM':
        return 'Medium'
      case 'LOW':
        return 'Low'
      default:
        return priority
    }
  }

  const getAllTags = (): string[] => {
    const allTags = tasks.flatMap((task) => task.tags || [])
    return [...new Set(allTags)]
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setTagFilter('all')
    setDueDateFilter('all')
  }

  // filters
  const filteredTasks = tasks.filter((task: Task) => {
    const searchText = searchTerm.toLowerCase()
    const matchesSearch =
      !searchText ||
      task.title?.toLowerCase().includes(searchText) ||
      task.description?.toLowerCase().includes(searchText) ||
      task.comment?.toLowerCase().includes(searchText)

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter
    const matchesTag = tagFilter === 'all' || task.tags?.includes(tagFilter)

    let matchesDueDate = true
    if (dueDateFilter !== 'all' && task.dueDate) {
      const today = new Date()
      const dueDate = new Date(task.dueDate)
      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      switch (dueDateFilter) {
        case 'overdue':
          matchesDueDate = diffDays < 0
          break
        case 'today':
          matchesDueDate = diffDays === 0
          break
        case 'this_week':
          matchesDueDate = diffDays >= 0 && diffDays <= 7
          break
        case 'this_month':
          matchesDueDate = diffDays >= 0 && diffDays <= 30
          break
        case 'no_due_date':
          matchesDueDate = !task.dueDate
          break
        default:
          matchesDueDate = true
      }
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesTag &&
      matchesDueDate
    )
  })

  const hasActiveFilters =
    searchTerm ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    tagFilter !== 'all' ||
    dueDateFilter !== 'all'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
          <span className="text-muted-foreground text-sm sm:text-base">
            Loading tasks...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="text-destructive mb-4 text-sm sm:text-base">
            {error}
          </div>
          <Button onClick={fetchTasks} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">
            {currentSpace?.name || 'Loading...'}
          </h1>
          {currentSpace?.description && (
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              {currentSpace.description}
            </p>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsEditDialogOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Edit className="h-4 w-4 mr-2" />
            Update Space
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Space
          </Button>
        </div>
      </div>

      {/* create task */}
      <CreateTask
        isOpen={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        spaceName={currentSpace?.name}
        spaceId={currentSpace?.id || ''}
        availableMembers={getAvailableMembers()}
        onTaskCreated={handleTaskCreated}
      />

      {/* update task */}
      <UpdateSpace
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        space={currentSpace || null}
        onSpaceUpdated={handleSpaceUpdated}
      />

      {/* delete task */}
      <DeleteSpace
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        space={currentSpace || null}
        onSpaceDeleted={handleSpaceDeleted}
      />

      {/* Version control task history*/}
      <TaskHistory
        isOpen={isTaskHistoryOpen}
        onOpenChange={setIsTaskHistoryOpen}
        taskId={selectedTaskForHistory}
        onTaskUpdated={handleTaskUpdatedFromHistory}
      />

      {/* edit task */}
      <EditTask
        isOpen={isEditTaskOpen}
        onOpenChange={setIsEditTaskOpen}
        task={editingTask}
        workspaceMembers={workspaceMembers}
        onUpdateTask={handleUpdateTask}
        loading={updateLoading}
      />

      {/* delete task */}
      <DeleteTask
        isOpen={isDeleteTaskDialogOpen}
        onOpenChange={setIsDeleteTaskDialogOpen}
        task={taskToDelete}
        onConfirmDelete={confirmDeleteTask}
        loading={deleteLoading}
      />

      {/* filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Search and Clear Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tasks, descriptions, and comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Due Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Due Dates</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="today">Due Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="no_due_date">No Due Date</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {getAllTags().map((tag: string) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {searchTerm && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Search: "{searchTerm}"
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSearchTerm('')}
                    />
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Status: {getStatusLabel(statusFilter)}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setStatusFilter('all')}
                    />
                  </Badge>
                )}
                {priorityFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Priority: {getPriorityLabel(priorityFilter)}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setPriorityFilter('all')}
                    />
                  </Badge>
                )}
                {tagFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Tag: {tagFilter}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setTagFilter('all')}
                    />
                  </Badge>
                )}
                {dueDateFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Due: {dueDateFilter.replace('_', ' ')}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setDueDateFilter('all')}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/*  TASKS TABLE  */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/50">
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="font-semibold">Assignee</TableHead>
                  <TableHead className="font-semibold">Reporter</TableHead>
                  <TableHead className="font-semibold">Due Date</TableHead>
                  <TableHead className="font-semibold">Tags</TableHead>
                  <TableHead className="font-semibold">Comment</TableHead>
                  <TableHead className="font-semibold">Version</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {task.description}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(task.priority)}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.assignee?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.reporter?.name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {task.tags?.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {task.tags?.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            +{task.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {task.comment ? (
                        <div className="text-xs bg-muted/50 rounded p-2">
                          <p className="line-clamp-2 break-words">
                            {task.comment}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No comment
                        </span>
                      )}
                    </TableCell>
                    {/* Version column */}
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-blue-500" />
                        <span className="font-mono text-blue-600">
                          v{task.version || 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewTask(task)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View History
                          </DropdownMenuItem>
                          {canEditTask(task) && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleEditTask(task)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteTask(task)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Task
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Quick Add Task Row */}
                <TableRow className="border-t-2 border-dashed">
                  <TableCell colSpan={11}>
                    <div className="flex items-center gap-2 w-full py-2">
                      <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span
                        className="text-muted-foreground cursor-pointer flex-1"
                        onClick={() => setIsTaskDialogOpen(true)}
                      >
                        Click to add a new task...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* No Results State */}
      {filteredTasks.length === 0 && tasks.length > 0 && (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <Settings className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">
              No tasks match your filters
            </h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              Try adjusting your search or filters to see more tasks
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Tasks State */}
      {tasks.length === 0 && (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <Settings className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">
              No tasks yet
            </h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              Get started by adding your first task to this space
            </p>
            <Button onClick={() => setIsTaskDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Task
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Space
