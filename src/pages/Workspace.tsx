import React, { useState } from 'react'
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
} from 'lucide-react'
import { useWorkspace } from '@/context/workspaceContext'
import InviteMemberModal from '@/components/workspace/InviteMember'

const Workspace: React.FC = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false)

  const {
    selectedWorkspace,
    workspaceDetails,
    loading,
    detailsLoading,
    error,
    detailsError,
  } = useWorkspace()

  // calculate number
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

    const inProgressTasks = Math.floor(totalTasks * 0.3)

    return [
      {
        title: 'Total Spaces',
        value: workspaceDetails._count.spaces.toString(),
        icon: BarChart3,
        change: '+0%',
      },
      {
        title: 'Total Tasks',
        value: totalTasks.toString(),
        icon: CheckCircle2,
        change: '+0%',
      },
      {
        title: 'In Progress',
        value: inProgressTasks.toString(),
        icon: Clock,
        change: '+5%',
      },
      {
        title: 'Team Members',
        value: workspaceDetails._count.members.toString(),
        icon: Users,
        change: '+0%',
      },
    ]
  }, [workspaceDetails])

  // Today's due tasks and upcoming tasks across workspace
  const workspaceTasks = React.useMemo(() => {
    if (!workspaceDetails) return { todayTasks: [], upcomingTasks: [] }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    // Mock tasks from all spaces - you'd get this from your API
    const allTasks = workspaceDetails.spaces.flatMap((space) => {
      if (space._count.tasks === 0) return []

      // Generate mock tasks for each space
      const mockTasks = [
        {
          id: `${space.id}-1`,
          title: 'Complete project setup',
          priority: 'high' as const,
          dueDate: new Date(today), // Due today
          spaceName: space.name,
          spaceNumber: space.spaceNumber,
        },
        {
          id: `${space.id}-2`,
          title: 'Review team feedback',
          priority: 'medium' as const,
          dueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Due tomorrow
          spaceName: space.name,
          spaceNumber: space.spaceNumber,
        },
        {
          id: `${space.id}-3`,
          title: 'Update documentation',
          priority: 'high' as const,
          dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
          spaceName: space.name,
          spaceNumber: space.spaceNumber,
        },
        {
          id: `${space.id}-4`,
          title: 'Design new feature',
          priority: 'low' as const,
          dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
          spaceName: space.name,
          spaceNumber: space.spaceNumber,
        },
      ]

      // Return random subset of tasks based on space task count
      return mockTasks.slice(
        0,
        Math.min(space._count.tasks, Math.floor(Math.random() * 3) + 1)
      )
    })

    // Filter tasks by due date
    const todayTasks = allTasks.filter((task) => {
      const taskDate = new Date(task.dueDate)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.getTime() === today.getTime()
    })

    const upcomingTasks = allTasks
      .filter((task) => {
        const taskDate = new Date(task.dueDate)
        return taskDate > today && taskDate <= nextWeek
      })
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

    return { todayTasks, upcomingTasks }
  }, [workspaceDetails])

  // Space-wise progress instead of workspace progress
  const spaceProgress = React.useMemo(() => {
    if (!workspaceDetails) return []

    return workspaceDetails.spaces.map((space) => {
      // Mock data - you'd get actual task status counts from your API
      const completedTasks = Math.floor(
        space._count.tasks * (0.4 + Math.random() * 0.5)
      ) // 40-90% completion
      const inProgressTasks = Math.floor(
        (space._count.tasks - completedTasks) * 0.7
      )
      const todoTasks = space._count.tasks - completedTasks - inProgressTasks

      const progressPercentage =
        space._count.tasks > 0
          ? Math.round((completedTasks / space._count.tasks) * 100)
          : 0

      return {
        id: space.id,
        name: space.name,
        spaceNumber: space.spaceNumber,
        totalTasks: space._count.tasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        progress: progressPercentage,
      }
    })
  }, [workspaceDetails])

  const handleInviteMembers = (): void => {
    setIsInviteModalOpen(true)
  }

  const handleCloseInviteModal = (): void => {
    setIsInviteModalOpen(false)
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
        <Button variant="default">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
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
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </p>
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
              {workspaceTasks.todayTasks.length > 0
                ? 'Due Today'
                : 'Upcoming Tasks'}
            </CardTitle>
          </CardHeader>
          {/* need to complete */}
          <CardContent className="flex items-center justify-center">
            No tasks are due today
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
              {spaceProgress.length > 0 ? (
                spaceProgress.map((space) => (
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
    </div>
  )
}

export default Workspace
