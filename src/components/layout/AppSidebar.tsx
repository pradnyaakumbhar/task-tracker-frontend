import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronDown, Plus, Hash, Users, Home, Loader2, RefreshCw } from "lucide-react";
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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/workspaceContext"; // Update this path

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
  } = useWorkspace();

  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId, spaceId } = useParams();

  // Sync selected workspace with URL params
  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const workspace = getWorkspaceByNumber(workspaceId);
      if (workspace && workspace !== selectedWorkspace) {
        setSelectedWorkspace(workspace);
      }
    }
  }, [workspaceId, workspaces, selectedWorkspace, getWorkspaceByNumber, setSelectedWorkspace]);

  const isActive = (path: string) => location.pathname === path;
  
  const isSpaceActive = (workspaceNumber: string, spaceNumber: string) => 
    workspaceId === workspaceNumber && spaceId === spaceNumber;

  const handleSpaceClick = (workspaceNumber: string, spaceNumber: string) => {
    navigate(`/${workspaceNumber}/${spaceNumber}`);
  };

  const handleWorkspaceSelect = (workspace: typeof selectedWorkspace) => {
    if (!workspace) return;
    
    setSelectedWorkspace(workspace);
    // Optionally navigate to first space of selected workspace
    if (workspace.spaces.length > 0) {
      navigate(`/${workspace.number}/${workspace.spaces[0].spaceNumber}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Sidebar className="border-r bg-sidebar border-sidebar-border">
        <SidebarContent className="p-4 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            {!collapsed && <span className="text-sm text-muted-foreground">Loading workspaces...</span>}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Error state
  if (error) {
    return (
      <Sidebar className="border-r bg-sidebar border-sidebar-border">
        <SidebarContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-destructive mb-3">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshWorkspaces}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {!collapsed && "Retry"}
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // No workspaces state
  if (!loading && workspaces.length === 0) {
    return (
      <Sidebar className="border-r bg-sidebar border-sidebar-border">
        <SidebarContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">No workspaces found</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshWorkspaces}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {!collapsed && "Refresh"}
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r bg-sidebar border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto p-3 border border-sidebar-border hover:bg-sidebar-hover"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                  <Users className="h-3 w-3 text-primary-foreground" />
                </div>
                {!collapsed && selectedWorkspace && (
                  <span className="font-medium truncate">{selectedWorkspace.name}</span>
                )}
              </div>
              {!collapsed && <ChevronDown className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceSelect(workspace)}
                className="flex items-center gap-2 p-3"
              >
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                  <Users className="h-3 w-3 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span>{workspace.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {workspace._count.spaces} spaces • {workspace._count.members} members
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={isActive("/") ? "bg-sidebar-active text-white" : ""}
                >
                  <button onClick={() => navigate("/")} className="flex items-center gap-2 w-full">
                    <Home className="h-4 w-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {selectedWorkspace && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-2 flex items-center justify-between">
              <span>Spaces</span>
              {/* {!collapsed && (
                <Button variant="ghost" size="icon" className="h-4 w-4">
                  <Plus className="h-3 w-3" />
                </Button>
              )} */}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {detailsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {!collapsed && <span className="ml-2 text-sm text-muted-foreground">Loading spaces...</span>}
                </div>
              ) : (
                <SidebarMenu>
                  {(workspaceDetails || selectedWorkspace).spaces?.map((space) => (
                    <SidebarMenuItem key={space.id}>
                      <SidebarMenuButton
                        asChild
                        className={
                          isSpaceActive(selectedWorkspace.number, space.spaceNumber)
                            ? "bg-sidebar-active text-white"
                            : "hover:bg-sidebar-hover"
                        }
                      >
                        <button
                          onClick={() => handleSpaceClick(selectedWorkspace.number, space.spaceNumber)}
                          className="flex items-center gap-2 w-full"
                        >
                          <Hash className="h-4 w-4" />
                          {!collapsed && (
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">{space.name}</span>
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {space._count.tasks}
                              </span>
                            </div>
                          )}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )) || (
                    <div className="text-center py-4">
                      <span className="text-sm text-muted-foreground">No spaces found</span>
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
                <SidebarMenuButton asChild >
                  <button className="flex items-center gap-2 w-full">
                  <Plus className="h-6 w-6" />
                  <span>Create Space</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;