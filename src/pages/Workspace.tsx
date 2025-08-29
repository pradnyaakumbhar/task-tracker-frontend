import { useParams } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
    Plus, 
    Search, 
    Filter, 
    Settings,
    MessageSquare,
    Calendar,
    MoreHorizontal,
    Edit,
    Trash2
  } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Workspace = () => {
  const { workspaceId, spaceId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data - replace with API calls
  const spaceData: Record<string, Record<string, { name: string; description: string }>> = {
    "1": {
      "1": { name: "Development", description: "Frontend and backend development tasks" },
      "2": { name: "Design", description: "UI/UX design and prototyping" },
      "3": { name: "Marketing", description: "Marketing campaigns and content" },
    },
    "2": {
      "4": { name: "Frontend Team", description: "React and TypeScript development" },
      "5": { name: "Backend Team", description: "API and database development" },
      "6": { name: "QA Testing", description: "Testing and quality assurance" },
    },
  };

  const mockTasks = [
    {
      id: 1,
      title: "Implement user authentication system",
      description: "Create login, register, and password reset functionality",
      status: "IN_PROGRESS",
      priority: "High",
      reporter: "Admin User",
      dueDate: "2024-01-15",
      tags: ["Frontend", "Security"],
      comments: 3,
    },
    {
        id: 2,
        title: "Design homepage layout",
        description: "Create wireframes and mockups for the landing page",
        status: "TODO",
        priority: "Medium",
        assignee: "Jane Smith",
        reporter: "Product Manager",
        dueDate: "2024-01-12",
        tags: ["Design", "UI"],
        comments: 1,
      },
      {
        id: 3,
        title: "Write API documentation",
        description: "Document all REST API endpoints with examples",
        status: "IN_REVIEW",
        priority: "Low",
        assignee: "Mike Johnson",
        reporter: "Tech Lead",
        dueDate: "2024-01-20",
        tags: ["Documentation", "Backend"],
        comments: 5,
      },
      {
        id: 4,
        title: "Setup CI/CD pipeline",
        description: "Configure automated testing and deployment",
        status: "DONE",
        priority: "Urgent",
        assignee: "Sarah Wilson",
        reporter: "DevOps Lead",
        dueDate: "2024-01-10",
        tags: ["DevOps", "Automation"],
        comments: 8,
      },
  ];

  const currentSpace = workspaceId && spaceId ? spaceData[workspaceId]?.[spaceId] : null;

  const getStatusColor = (status: string) => {
    switch (status) {
        case "TODO": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
        case "IN_PROGRESS": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        case "IN_REVIEW": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        case "DONE": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "CANCELLED": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "High": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "TODO": return "To Do";
      case "IN_PROGRESS": return "In Progress";
      case "IN_REVIEW": return "In Review";
      case "DONE": return "Done";
      case "CANCELLED": return "Cancelled";
      default: return status;
    }
  };

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{currentSpace?.name}</h1>
          <p className="text-muted-foreground">{currentSpace?.description}</p>
        </div>
        <Button variant="default">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
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
            </div>
            <Button variant="gradient" className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
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
                <TableHead className="font-semibold">Comments</TableHead>
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
                    <Select defaultValue={task.status}>
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="IN_REVIEW">In Review</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={task.priority}>
                      <SelectTrigger className="w-[100px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm">{task.assignee}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{task.reporter}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                      {task.dueDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {task.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{task.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {task.comments}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "Get started by creating your first task"
              }
            </p>
            <Button variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Workspace;