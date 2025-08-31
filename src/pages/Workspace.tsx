import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users, 
  TrendingUp, 
  Plus,
  BarChart3
} from "lucide-react";

const Workspace = () => {
  // Mock data - replace with API calls
  const stats = [
    { title: "Total Tasks", value: "234", icon: CheckCircle2, change: "+12%" },
    { title: "In Progress", value: "48", icon: Clock, change: "+8%" },
    { title: "Completed Today", value: "16", icon: TrendingUp, change: "+24%" },
    { title: "Team Members", value: "12", icon: Users, change: "0%" },
  ];

  const recentTasks = [
    { id: 1, title: "Design homepage mockup", space: "Design", priority: "High", status: "In Progress" },
    { id: 2, title: "Implement user authentication", space: "Development", priority: "High", status: "Todo" },
    { id: 3, title: "Write API documentation", space: "Development", priority: "Medium", status: "In Progress" },
    { id: 4, title: "Create marketing campaign", space: "Marketing", priority: "Low", status: "Review" },
  ];

  const workspaceProgress = [
    { name: "Personal Projects", progress: 75, tasks: 45 },
    { name: "Company Work", progress: 60, tasks: 78 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your productivity overview.
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
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
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
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {task.space}
                      </Badge>
                      <Badge 
                        variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline">{task.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workspace Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
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
                      {workspace.tasks} tasks
                    </span>
                  </div>
                  <Progress value={workspace.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {workspace.progress}% completed
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
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Plus className="h-6 w-6" />
              <span>Create Space</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="h-6 w-6" />
              <span>Invite Team</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Workspace;