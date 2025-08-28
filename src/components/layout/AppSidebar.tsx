import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronDown, Plus, Hash, Users, Settings, Home } from "lucide-react";
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

// Mock data - replace with API calls
const mockWorkspaces = [
  {
    id: "1",
    name: "Personal Projects",
    spaces: [
      { id: "1", name: "Development", taskCount: 12 },
      { id: "2", name: "Design", taskCount: 8 },
      { id: "3", name: "Marketing", taskCount: 5 },
    ],
  },
  {
    id: "2",
    name: "Company Work",
    spaces: [
      { id: "4", name: "Frontend Team", taskCount: 15 },
      { id: "5", name: "Backend Team", taskCount: 9 },
      { id: "6", name: "QA Testing", taskCount: 7 },
    ],
  },
];

const AppSidebar = () => {
  const [selectedWorkspace, setSelectedWorkspace] = useState(mockWorkspaces[0]);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId, spaceId } = useParams();

  const isActive = (path: string) => location.pathname === path;
  const isSpaceActive = (workspace: string, space: string) => 
    workspaceId === workspace && spaceId === space;

  const handleSpaceClick = (workspaceId: string, spaceId: string) => {
    navigate(`/${workspaceId}/${spaceId}`);
  };

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
                {!collapsed && (
                  <span className="font-medium truncate">{selectedWorkspace.name}</span>
                )}
              </div>
              {!collapsed && <ChevronDown className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            {mockWorkspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => setSelectedWorkspace(workspace)}
                className="flex items-center gap-2 p-3"
              >
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                  <Users className="h-3 w-3 text-primary-foreground" />
                </div>
                <span>{workspace.name}</span>
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-2 flex items-center justify-between">
            <span>Spaces</span>
            {!collapsed && (
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {selectedWorkspace.spaces.map((space) => (
                <SidebarMenuItem key={space.id}>
                  <SidebarMenuButton
                    asChild
                    className={
                      isSpaceActive(selectedWorkspace.id, space.id)
                        ? "bg-sidebar-active text-white"
                        : "hover:bg-sidebar-hover"
                    }
                  >
                    <button
                      onClick={() => handleSpaceClick(selectedWorkspace.id, space.id)}
                      className="flex items-center gap-2 w-full"
                    >
                      <Hash className="h-4 w-4" />
                      {!collapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{space.name}</span>
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {space.taskCount}
                          </span>
                        </div>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button className="flex items-center gap-2 w-full">
                    <Settings className="h-4 w-4" />
                    {!collapsed && <span>Settings</span>}
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