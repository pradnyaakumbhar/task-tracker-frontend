import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2, User } from 'lucide-react'
import { useAuth } from '@/context/authContext'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
}

interface CreateTaskProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  spaceName?: string
  spaceId: string
  availableMembers: User[]
  onTaskCreated: () => void
}

interface NewTaskForm {
  title: string
  description: string
  priority: string
  status: string
  assigneeId: string
  dueDate: string
  tags: string[]
  comment: string
}

const CreateTask = ({
  isOpen,
  onOpenChange,
  spaceName,
  spaceId,
  availableMembers,
  onTaskCreated,
}: CreateTaskProps) => {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    assigneeId: 'unassigned', // Changed from empty string to "unassigned"
    dueDate: '',
    tags: [],
    comment: '',
  })
  const { token } = useAuth()

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm()
      setError(null)
    }
  }, [isOpen])

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      assigneeId: 'unassigned', // Changed from empty string to "unassigned"
      dueDate: '',
      tags: [],
      comment: '',
    })
  }

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !spaceId) {
      setError('Title is required')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/task/create`,
        {
          title: newTask.title.trim(),
          description: newTask.description.trim() || undefined,
          comment: newTask.comment.trim() || undefined,
          priority: newTask.priority,
          status: newTask.status,
          tags: newTask.tags.filter((tag) => tag.trim() !== ''),
          dueDate: newTask.dueDate || undefined,
          spaceId: spaceId,
          assigneeId:
            newTask.assigneeId === 'unassigned'
              ? undefined
              : newTask.assigneeId,
        },
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
        throw new Error(errorData.error || 'Failed to create task')
      }

      onTaskCreated()
      onOpenChange(false)
    } catch (err) {
      console.error('Error creating task:', err)
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-md lg:max-w-[600px] max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl">
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Add a new task{spaceName ? ` to ${spaceName}` : ''}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-xs sm:text-sm text-destructive bg-destructive/10 p-2 sm:p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="taskTitle" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="taskTitle"
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter task title"
              className="h-9 sm:h-10 text-sm sm:text-base"
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="taskDescription" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="taskDescription"
              value={newTask.description}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter task description (optional)"
              rows={3}
              className="text-sm sm:text-base resize-none"
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) =>
                  setNewTask((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={newTask.status}
                onValueChange={(value) =>
                  setNewTask((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
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
            </div>
          </div>

          {/* Assignee */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Assignee (Optional)</Label>
            <Select
              value={newTask.assigneeId}
              onValueChange={(value) =>
                setNewTask((prev) => ({ ...prev, assigneeId: value }))
              }
            >
              <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                <SelectValue placeholder="Select assignee (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {availableMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({member.email})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="grid gap-2">
            <Label htmlFor="taskDueDate" className="text-sm font-medium">
              Due Date
            </Label>
            <Input
              id="taskDueDate"
              type="date"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className="h-9 sm:h-10 text-sm sm:text-base"
            />
          </div>

          {/* Tags */}
          <div className="grid gap-2">
            <Label htmlFor="taskTags" className="text-sm font-medium">
              Tags (comma-separated)
            </Label>
            <Input
              id="taskTags"
              value={newTask.tags.join(', ')}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                setNewTask((prev) => ({ ...prev, tags }))
              }}
              placeholder="tag1, tag2, tag3"
              className="h-9 sm:h-10 text-sm sm:text-base"
            />
          </div>

          {/* Comment */}
          <div className="grid gap-2">
            <Label htmlFor="taskComment" className="text-sm font-medium">
              Initial Comment
            </Label>
            <Textarea
              id="taskComment"
              value={newTask.comment}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder="Add an initial comment (optional)"
              rows={2}
              className="text-sm sm:text-base resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTask}
            disabled={isCreating || !newTask.title.trim()}
            className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
          >
            {isCreating ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            )}
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTask
