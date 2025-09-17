import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  Plus,
  Hash,
  Users,
  Home,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useWorkspace } from '@/context/workspaceContext'
import CreateSpaceDialog from '@/components/sidebar/CreateSpaceDialog'

const AppSidebar = () => {
  const {
    workspaces,
    selectedWorkspace,
    loading,
    error,
    workspaceDetails,
    detailsLoading,
    setSelectedWorkspace,
    refreshWorkspaces,
    getWorkspaceByNumber,
  } = useWorkspace()

  const { state, isMobile, toggleSidebar } = useSidebar()
  const collapsed = state === 'collapsed'
  const navigate = useNavigate()
  const location = useLocation()
  const { workspaceNumber, spaceNumber } = useParams()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    if (workspaceNumber && workspaces.length > 0) {
      const workspace = getWorkspaceByNumber(workspaceNumber)
      if (workspace && workspace !== selectedWorkspace) {
        setSelectedWorkspace(workspace)
      }
    }
  }, [
    workspaceNumber,
    workspaces,
    selectedWorkspace,
    getWorkspaceByNumber,
    setSelectedWorkspace,
  ])

  const isDashboardActive = (workspaceNum?: string) => {
    if (!workspaceNum) {
      return location.pathname === '/'
    }
    return location.pathname === `/${workspaceNum}`
  }

  const isSpaceActive = (workspaceNum: string, spaceNum: string) =>
    workspaceNumber === workspaceNum && spaceNumber === spaceNum

  const handleDashboardClick = () => {
    if (selectedWorkspace) {
      navigate(`/${selectedWorkspace.number}`)
    } else if (workspaces.length > 0) {
      navigate(`/${workspaces[0].number}`)
    } else {
      navigate('/')
    }
    // Close sidebar on mobile after navigation
    if (isMobile) {
      toggleSidebar()
    }
  }

  const handleSpaceClick = (workspaceNum: string, spaceNumber: string) => {
    navigate(`/${workspaceNum}/${spaceNumber}`)
    // Close sidebar on mobile after navigation
    if (isMobile) {
      toggleSidebar()
    }
  }

  const handleWorkspaceSelect = (workspace: typeof selectedWorkspace) => {
    if (!workspace) return

    setSelectedWorkspace(workspace)
    navigate(`/${workspace.number}`)
    // Close sidebar on mobile after navigation
    if (isMobile) {
      toggleSidebar()
    }
  }

  if (loading) {
    return (
      <Sidebar className="border-r bg-sidebar border-sidebar-border">
        <SidebarContent className="p-3 sm:p-4 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
            {!collapsed && (
              <span className="text-xs sm:text-sm text-muted-foreground text-center">
                Loading workspaces...
              </span>
            )}
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  if (error) {
    return (
      <Sidebar className="border-r bg-sidebar border-sidebar-border">
        <SidebarContent className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-destructive mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshWorkspaces}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              {!collapsed && <span className="text-xs sm:text-sm">Retry</span>}
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  // No workspaces state
  if (!loading && workspaces.length === 0) {
    return (
      <Sidebar className="border-r bg-sidebar border-sidebar-border">
        <SidebarContent className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">
              No workspaces found
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshWorkspaces}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              {!collapsed && (
                <span className="text-xs sm:text-sm">Refresh</span>
              )}
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <>
      <Sidebar className="border-r bg-sidebar border-sidebar-border">
        <SidebarHeader className="p-3 sm:p-4 border-b border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-auto p-2 sm:p-3 border border-sidebar-border hover:bg-sidebar-hover"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-primary flex items-center justify-center flex-shrink-0">
                    <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                  </div>
                  {!collapsed && selectedWorkspace && (
                    <span className="font-medium truncate text-xs sm:text-sm">
                      {selectedWorkspace.name}
                    </span>
                  )}
                </div>
                {!collapsed && (
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 sm:w-64"
              align="start"
              sideOffset={isMobile ? 4 : 8}
            >
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => handleWorkspaceSelect(workspace)}
                  className="flex items-center gap-2 p-2 sm:p-3"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-primary flex items-center justify-center flex-shrink-0">
                    <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs sm:text-sm truncate">
                      {workspace.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {workspace._count.spaces} spaces •{' '}
                      {workspace._count.members} members
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>

        <SidebarContent className="p-3 sm:p-4">
          {/* Dashboard navigation if workspaces are available */}
          {workspaces.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={
                        isDashboardActive(selectedWorkspace?.number)
                          ? 'bg-sidebar-active text-white'
                          : ''
                      }
                    >
                      <button
                        onClick={handleDashboardClick}
                        className="flex items-center gap-2 w-full p-2 sm:p-3"
                        disabled={!selectedWorkspace && workspaces.length === 0}
                      >
                        <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        {!collapsed && (
                          <span className="text-xs sm:text-sm">Dashboard</span>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* spaces list */}
          {selectedWorkspace && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-2 flex items-center justify-between">
                <span>Spaces</span>
                {!collapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 sm:h-4 sm:w-4 p-0"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                )}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-3 sm:py-4">
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    {!collapsed && (
                      <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
                        Loading spaces...
                      </span>
                    )}
                  </div>
                ) : (
                  <SidebarMenu>
                    {(workspaceDetails || selectedWorkspace).spaces?.map(
                      (space) => (
                        <SidebarMenuItem key={space.id}>
                          <SidebarMenuButton
                            asChild
                            className={
                              isSpaceActive(
                                selectedWorkspace.number,
                                space.spaceNumber
                              )
                                ? 'bg-sidebar-active text-white'
                                : 'hover:bg-sidebar-hover'
                            }
                          >
                            <button
                              onClick={() =>
                                handleSpaceClick(
                                  selectedWorkspace.number,
                                  space.spaceNumber
                                )
                              }
                              className="flex items-center gap-2 w-full p-2 sm:p-3"
                            >
                              <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                              {!collapsed && (
                                <div className="flex items-center justify-between w-full min-w-0">
                                  <span className="truncate text-xs sm:text-sm flex-1">
                                    {space.name}
                                  </span>
                                  <span
                                    className={`text-xs bg-muted px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0 ml-1 ${
                                      isSpaceActive(
                                        selectedWorkspace.number,
                                        space.spaceNumber
                                      )
                                        ? 'bg-white/20 text-white'
                                        : 'bg-muted'
                                    }`}
                                  >
                                    {space._count.tasks}
                                  </span>
                                </div>
                              )}
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    ) || (
                      <div className="text-center py-3 sm:py-4">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          No spaces found
                        </span>
                      </div>
                    )}
                  </SidebarMenu>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      className="flex items-center gap-2 w-full hover:bg-sidebar-hover p-2 sm:p-3"
                      onClick={() => setIsCreateDialogOpen(true)}
                      disabled={!selectedWorkspace}
                    >
                      <Plus className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                      {!collapsed && (
                        <span className="text-xs sm:text-sm">Create Space</span>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <CreateSpaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  )
}

export default AppSidebar
