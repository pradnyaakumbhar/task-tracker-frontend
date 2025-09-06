// import React, { useState } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { Progress } from '@/components/ui/progress'
// import {
//   Calendar,
//   CheckCircle2,
//   Clock,
//   Users,
//   TrendingUp,
//   Plus,
//   BarChart3,
//   Loader2,
// } from 'lucide-react'
// import { useWorkspace } from '@/context/workspaceContext'
// import InviteMemberModal from '@/components/workspace/InviteMember'

// const Workspace: React.FC = () => {
//   const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false)

//   const {
//     selectedWorkspace,
//     workspaceDetails,
//     loading,
//     detailsLoading,
//     error,
//     detailsError,
//   } = useWorkspace()

//   // Calculate stats from real data
//   const stats = React.useMemo(() => {
//     if (!workspaceDetails) {
//       return [
//         { title: 'Total Tasks', value: '-', icon: CheckCircle2, change: '-' },
//         { title: 'In Progress', value: '-', icon: Clock, change: '-' },
//         { title: 'Completed Today', value: '-', icon: TrendingUp, change: '-' },
//         { title: 'Team Members', value: '-', icon: Users, change: '-' },
//       ]
//     }

//     const totalTasks = workspaceDetails.spaces.reduce(
//       (acc, space) => acc + space._count.tasks,
//       0
//     )

//     return [
//       {
//         title: 'Total Spaces',
//         value: workspaceDetails._count.spaces.toString(),
//         icon: BarChart3,
//         change: '+0%',
//       },
//       {
//         title: 'Total Tasks',
//         value: totalTasks.toString(),
//         icon: CheckCircle2,
//         change: '+0%',
//       },
//       {
//         title: 'In Progress',
//         value: '-', // This would need task status data from API
//         icon: Clock,
//         change: '+0%',
//       },
//       {
//         title: 'Team Members',
//         value: workspaceDetails._count.members.toString(),
//         icon: Users,
//         change: '+0%',
//       },
//     ]
//   }, [workspaceDetails])

//   // Recent spaces instead of tasks (since we don't have task details)
//   const recentSpaces = React.useMemo(() => {
//     if (!workspaceDetails) return []

//     return workspaceDetails.spaces.slice(0, 4).map((space) => ({
//       id: space.id,
//       title: space.name,
//       spaceNumber: space.spaceNumber,
//       taskCount: space._count.tasks,
//       status: space._count.tasks > 0 ? 'Active' : 'Empty',
//     }))
//   }, [workspaceDetails])

//   // Workspace progress based on spaces
//   const workspaceProgress = React.useMemo(() => {
//     if (!workspaceDetails) return []

//     const totalTasks = workspaceDetails.spaces.reduce(
//       (acc, space) => acc + space._count.tasks,
//       0
//     )
//     const spacesWithTasks = workspaceDetails.spaces.filter(
//       (space) => space._count.tasks > 0
//     ).length
//     const progressPercentage =
//       workspaceDetails.spaces.length > 0
//         ? Math.round((spacesWithTasks / workspaceDetails.spaces.length) * 100)
//         : 0

//     return [
//       {
//         name: workspaceDetails.name,
//         progress: progressPercentage,
//         tasks: totalTasks,
//         spaces: workspaceDetails.spaces.length,
//       },
//     ]
//   }, [workspaceDetails])

//   const handleInviteMembers = (): void => {
//     setIsInviteModalOpen(true)
//   }

//   const handleCloseInviteModal = (): void => {
//     setIsInviteModalOpen(false)
//   }

//   // Loading state
//   if (loading || detailsLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin" />
//         <span className="ml-2">Loading workspace data...</span>
//       </div>
//     )
//   }

//   // Error state
//   if (error || detailsError) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <p className="text-red-500 mb-2">Error loading workspace data</p>
//           <p className="text-sm text-muted-foreground">
//             {error || detailsError}
//           </p>
//         </div>
//       </div>
//     )
//   }

//   // No workspace selected
//   if (!selectedWorkspace || !workspaceDetails) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <p className="text-muted-foreground">No workspace selected</p>
//           <p className="text-sm text-muted-foreground">
//             Please select a workspace to view details
//           </p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
//             {workspaceDetails.name}
//           </h1>
//           <p className="text-muted-foreground">
//             {workspaceDetails.description ||
//               "Welcome back! Here's your workspace overview."}
//           </p>
//         </div>
//         <Button variant="default">
//           <Plus className="h-4 w-4 mr-2" />
//           New Task
//         </Button>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {stats.map((stat, index) => (
//           <Card
//             key={index}
//             className="shadow-sm hover:shadow-md transition-shadow"
//           >
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">
//                     {stat.title}
//                   </p>
//                   <p className="text-2xl font-bold">{stat.value}</p>
//                   <p className="text-xs text-muted-foreground flex items-center mt-1">
//                     <TrendingUp className="h-3 w-3 mr-1" />
//                     {stat.change}
//                   </p>
//                 </div>
//                 <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
//                   <stat.icon className="h-6 w-6 text-primary" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Recent Spaces */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <BarChart3 className="h-5 w-5" />
//               Recent Spaces
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {recentSpaces.length > 0 ? (
//                 recentSpaces.map((space) => (
//                   <div
//                     key={space.id}
//                     className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
//                   >
//                     <div className="space-y-1">
//                       <p className="font-medium">{space.title}</p>
//                       <div className="flex items-center gap-2">
//                         <Badge variant="outline" className="text-xs">
//                           #{space.spaceNumber}
//                         </Badge>
//                         <Badge variant="secondary" className="text-xs">
//                           {space.taskCount} tasks
//                         </Badge>
//                       </div>
//                     </div>
//                     <Badge variant="outline">{space.status}</Badge>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-8 text-muted-foreground">
//                   <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                   <p>No spaces created yet</p>
//                   <p className="text-sm">
//                     Create your first space to get started
//                   </p>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Workspace Progress */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <TrendingUp className="h-5 w-5" />
//               Workspace Progress
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-6">
//               {workspaceProgress.map((workspace, index) => (
//                 <div key={index} className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <p className="font-medium">{workspace.name}</p>
//                     <span className="text-sm text-muted-foreground">
//                       {workspace.spaces} spaces, {workspace.tasks} tasks
//                     </span>
//                   </div>
//                   <Progress value={workspace.progress} className="h-2" />
//                   <p className="text-xs text-muted-foreground">
//                     {workspace.progress}% of spaces have tasks
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Quick Actions */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Calendar className="h-5 w-5" />
//             Quick Actions
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Button
//               variant="outline"
//               className="h-auto p-4 flex flex-col items-center gap-2"
//             >
//               <Plus className="h-6 w-6" />
//               <span>Create Space</span>
//             </Button>
//             <Button
//               variant="outline"
//               className="h-auto p-4 flex flex-col items-center gap-2"
//               onClick={handleInviteMembers}
//             >
//               <Users className="h-6 w-6" />
//               <span>Invite Members</span>
//             </Button>
//             <Button
//               variant="outline"
//               className="h-auto p-4 flex flex-col items-center gap-2"
//             >
//               <BarChart3 className="h-6 w-6" />
//               <span>View Reports</span>
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Invite Member Modal */}
//       <InviteMemberModal
//         isOpen={isInviteModalOpen}
//         onClose={handleCloseInviteModal}
//         workspaceId={selectedWorkspace.id}
//         workspaceName={selectedWorkspace.name}
//       />
//     </div>
//   )
// }

// export default Workspace

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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

  // Calculate stats from real data
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
        value: '-', // This would need task status data from API
        icon: Clock,
        change: '+0%',
      },
      {
        title: 'Team Members',
        value: workspaceDetails._count.members.toString(),
        icon: Users,
        change: '+0%',
      },
    ]
  }, [workspaceDetails])

  // Recent spaces instead of tasks (since we don't have task details)
  const recentSpaces = React.useMemo(() => {
    if (!workspaceDetails) return []

    return workspaceDetails.spaces.slice(0, 4).map((space) => ({
      id: space.id,
      title: space.name,
      spaceNumber: space.spaceNumber,
      taskCount: space._count.tasks,
      status: space._count.tasks > 0 ? 'Active' : 'Empty',
    }))
  }, [workspaceDetails])

  // Workspace progress based on spaces
  const workspaceProgress = React.useMemo(() => {
    if (!workspaceDetails) return []

    const totalTasks = workspaceDetails.spaces.reduce(
      (acc, space) => acc + space._count.tasks,
      0
    )
    const spacesWithTasks = workspaceDetails.spaces.filter(
      (space) => space._count.tasks > 0
    ).length
    const progressPercentage =
      workspaceDetails.spaces.length > 0
        ? Math.round((spacesWithTasks / workspaceDetails.spaces.length) * 100)
        : 0

    return [
      {
        name: workspaceDetails.name,
        progress: progressPercentage,
        tasks: totalTasks,
        spaces: workspaceDetails.spaces.length,
      },
    ]
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
        {/* Recent Spaces */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Spaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSpaces.length > 0 ? (
                recentSpaces.map((space) => (
                  <div
                    key={space.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{space.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{space.spaceNumber}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {space.taskCount} tasks
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline">{space.status}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No spaces created yet</p>
                  <p className="text-sm">
                    Create your first space to get started
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workspace Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Workspace Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {workspaceProgress.map((workspace, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{workspace.name}</p>
                    <span className="text-sm text-muted-foreground">
                      {workspace.spaces} spaces, {workspace.tasks} tasks
                    </span>
                  </div>
                  <Progress value={workspace.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {workspace.progress}% of spaces have tasks
                  </p>
                </div>
              ))}
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

      {/* Invite Member Modal - No props needed, gets data from context */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={handleCloseInviteModal}
      />
    </div>
  )
}

export default Workspace
