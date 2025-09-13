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
      const response = await fetch('http://localhost:3000/api/task/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask.title.trim(),
          description: newTask.description.trim() || undefined,
          comment: newTask.comment.trim() || undefined,
          priority: newTask.priority,
          status: newTask.status,
          tags: newTask.tags.filter((tag) => tag.trim() !== ''),
          dueDate: newTask.dueDate || undefined,
          spaceId: spaceId,
          // Only send assigneeId if it's not "unassigned"
          assigneeId:
            newTask.assigneeId === 'unassigned'
              ? undefined
              : newTask.assigneeId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task{spaceName ? ` to ${spaceName}` : ''}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="taskTitle">Title *</Label>
            <Input
              id="taskTitle"
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="taskDescription">Description</Label>
            <Textarea
              id="taskDescription"
              value={newTask.description}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter task description (optional)"
              rows={3}
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) =>
                  setNewTask((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
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
              <Label>Status</Label>
              <Select
                value={newTask.status}
                onValueChange={(value) =>
                  setNewTask((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
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
            <Label>Assignee (Optional)</Label>
            <Select
              value={newTask.assigneeId}
              onValueChange={(value) =>
                setNewTask((prev) => ({ ...prev, assigneeId: value }))
              }
            >
              <SelectTrigger>
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select assignee (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {availableMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="grid gap-2">
            <Label htmlFor="taskDueDate">Due Date</Label>
            <Input
              id="taskDueDate"
              type="date"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))
              }
            />
          </div>

          {/* Tags */}
          <div className="grid gap-2">
            <Label htmlFor="taskTags">Tags (comma-separated)</Label>
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
            />
          </div>

          {/* Comment */}
          <div className="grid gap-2">
            <Label htmlFor="taskComment">Initial Comment</Label>
            <Textarea
              id="taskComment"
              value={newTask.comment}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder="Add an initial comment (optional)"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateTask}
            disabled={isCreating || !newTask.title.trim()}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTask
