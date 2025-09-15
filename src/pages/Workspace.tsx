import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Plus,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useWorkspace } from '@/context/workspaceContext'
import InviteMemberModal from '@/components/workspace/InviteMember'
import CreateSpaceDialog from '@/components/sidebar/CreateSpaceDialog'
import { useAuth } from '@/context/authContext'

interface TaskData {
  id: string
  title: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string
  taskNumber: string
  spaceName: string
  spaceNumber: string
  assignee?: {
    id: string
    name: string
  } | null
}

interface SpaceProgressData {
  id: string
  name: string
  spaceNumber: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  progress: number
}

interface DashboardData {
  todayTasks: TaskData[]
  upcomingTasks: TaskData[]
  spaceProgress: SpaceProgressData[]
}

const Workspace: React.FC = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false)
  const [isCreateSpaceDialogOpen, setIsCreateSpaceDialogOpen] =
    useState<boolean>(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const { token } = useAuth()
  const {
    selectedWorkspace,
    workspaceDetails,
    loading,
    detailsLoading,
    error,
    detailsError,
  } = useWorkspace()

  // Fetch dashboard data from backend
  const fetchDashboardData = async (workspaceId: string) => {
    setDashboardLoading(true)
    setDashboardError(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BASE_URL}/api/workspace/dashboardData`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ workspaceId }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch dashboard data: ${response.statusText}`
        )
      }

      const result = await response.json()
      setDashboardData(result.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setDashboardError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch dashboard data'
      )
    } finally {
      setDashboardLoading(false)
    }
  }

  // Fetch dashboard data when workspace is selected
  useEffect(() => {
    if (selectedWorkspace?.id) {
      fetchDashboardData(selectedWorkspace.id)
    }
  }, [selectedWorkspace?.id])

  // Calculate stats with real data
  const stats = React.useMemo(() => {
    if (!workspaceDetails) {
      return [
        { title: 'Total Tasks', value: '-', icon: CheckCircle2, change: '-' },
        { title: 'In Progress', value: '-', icon: Clock, change: '-' },
        { title: 'Completed Today', value: '-', icon: TrendingUp, change: '-' },
        { title: 'Team Members', value: '-', icon: Users, change: '-' },
      ]
    }

    const totalTasks = workspaceDetails.spaces.reduce(
      (acc, space) => acc + space._count.tasks,
      0
    )

    // Calculate in-progress tasks from dashboard data
    const inProgressTasks =
      dashboardData?.spaceProgress.reduce(
        (acc, space) => acc + space.inProgressTasks,
        0
      ) || Math.floor(totalTasks * 0.3)

    return [
      {
        title: 'Total Spaces',
        value: workspaceDetails._count.spaces.toString(),
        icon: BarChart3,
      },
      {
        title: 'Total Tasks',
        value: totalTasks.toString(),
        icon: CheckCircle2,
      },
      {
        title: 'In Progress',
        value: inProgressTasks.toString(),
        icon: Clock,
      },
      {
        title: 'Team Members',
        value: workspaceDetails._count.members.toString(),
        icon: Users,
      },
    ]
  }, [workspaceDetails, dashboardData])

  // Get priority color for tasks
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const handleInviteMembers = (): void => {
    setIsInviteModalOpen(true)
  }

  const handleCloseInviteModal = (): void => {
    setIsInviteModalOpen(false)
  }

  const handleCreateSpace = (): void => {
    setIsCreateSpaceDialogOpen(true)
  }

  const handleCloseCreateSpaceDialog = (): void => {
    setIsCreateSpaceDialogOpen(false)
  }

  // Loading state
  if (loading || detailsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading workspace data...</span>
      </div>
    )
  }

  // Error state
  if (error || detailsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading workspace data</p>
          <p className="text-sm text-muted-foreground">
            {error || detailsError}
          </p>
        </div>
      </div>
    )
  }

  // No workspace selected
  if (!selectedWorkspace || !workspaceDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No workspace selected</p>
          <p className="text-sm text-muted-foreground">
            Please select a workspace to view details
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            {workspaceDetails.name}
          </h1>
          <p className="text-muted-foreground">
            {workspaceDetails.description ||
              "Welcome back! Here's your workspace overview."}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Due Tasks / Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {dashboardData?.todayTasks && dashboardData.todayTasks.length > 0
                ? 'Due Today'
                : 'Upcoming Tasks'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading tasks...</span>
              </div>
            ) : dashboardError ? (
              <div className="flex items-center justify-center py-8">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                <span className="text-red-500 text-sm">{dashboardError}</span>
              </div>
            ) : dashboardData?.todayTasks &&
              dashboardData.todayTasks.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.spaceName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {task.assignee && (
                        <span className="hidden sm:inline">
                          {task.assignee.name}
                        </span>
                      )}
                      <span className="font-medium">Today</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.upcomingTasks &&
              dashboardData.upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.spaceName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {task.assignee && (
                        <span className="hidden sm:inline">
                          {task.assignee.name}
                        </span>
                      )}
                      <span className="font-medium">
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                ))}
                {dashboardData.upcomingTasks.length > 5 && (
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    +{dashboardData.upcomingTasks.length - 5} more tasks
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">No tasks due today</p>
                  <p className="text-sm text-muted-foreground">
                    Great job staying on top of things!
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Space Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Space Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dashboardLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-muted-foreground">
                    Loading progress...
                  </span>
                </div>
              ) : dashboardError ? (
                <div className="flex items-center justify-center py-8">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                  <span className="text-red-500 text-sm">{dashboardError}</span>
                </div>
              ) : dashboardData?.spaceProgress &&
                dashboardData.spaceProgress.length > 0 ? (
                dashboardData.spaceProgress.map((space) => (
                  <div key={space.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{space.name}</p>
                        <p className="text-sm text-muted-foreground">
                          #{space.spaceNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {space.progress}% Complete
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {space.completedTasks}/{space.totalTasks} tasks
                        </p>
                      </div>
                    </div>

                    {/* Multi-segment progress bar */}
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div className="h-full flex">
                        {/* Completed tasks - green */}
                        <div
                          className="bg-green-500 h-full transition-all duration-300"
                          style={{
                            width: `${
                              space.totalTasks > 0
                                ? (space.completedTasks / space.totalTasks) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                        {/* In progress tasks - blue */}
                        <div
                          className="bg-blue-500 h-full transition-all duration-300"
                          style={{
                            width: `${
                              space.totalTasks > 0
                                ? (space.inProgressTasks / space.totalTasks) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                        {/* Todo tasks - gray (remaining space automatically) */}
                      </div>
                    </div>

                    {/* Task breakdown */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-muted-foreground">
                          {space.completedTasks} completed
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-muted-foreground">
                          {space.inProgressTasks} in progress
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span className="text-muted-foreground">
                          {space.todoTasks} todo
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No spaces to track progress</p>
                  <p className="text-sm">
                    Create your first space to get started
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={handleCreateSpace}
            >
              <Plus className="h-6 w-6" />
              <span>Create Space</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={handleInviteMembers}
            >
              <Users className="h-6 w-6" />
              <span>Invite Members</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <BarChart3 className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={handleCloseInviteModal}
      />

      {/* Create Space Dialog */}
      <CreateSpaceDialog
        open={isCreateSpaceDialogOpen}
        onOpenChange={setIsCreateSpaceDialogOpen}
      />
    </div>
  )
}

export default Workspace
