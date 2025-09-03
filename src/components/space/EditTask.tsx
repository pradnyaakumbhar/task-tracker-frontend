import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface User {
  id: string
  userId?: string
  name: string
  email: string
}

interface TaskDetails {
  id: string
  title: string
  description: string | null
  comment: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignee?: User | null
  reporter: User
  creator: User
  dueDate: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
  taskNumber?: string
  spaceNumber?: string
  workspaceNumber?: string
}

interface WorkspaceMember {
  id: string
  name: string
  email: string
}

interface EditTaskDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  task: TaskDetails | null
  workspaceMembers: WorkspaceMember[]
  onUpdateTask: (updateData: Partial<TaskDetails>) => void
  loading: boolean
}

const EditTask = ({
  isOpen,
  onOpenChange,
  task,
  workspaceMembers,
  onUpdateTask,
  loading,
}: EditTaskDialogProps) => {
  const [editingTask, setEditingTask] = useState<TaskDetails | null>(task)
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [reporterOpen, setReporterOpen] = useState(false)

  // Update local state when task prop changes
  useEffect(() => {
    setEditingTask(task)
  }, [task])

  const handleClose = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      setEditingTask(null)
    }
  }

  const handleSave = () => {
    if (!editingTask) return

    const updateData: Partial<TaskDetails> = {
      title: editingTask.title,
      description: editingTask.description,
      comment: editingTask.comment,
      status: editingTask.status,
      priority: editingTask.priority,
      dueDate: editingTask.dueDate,
      tags: editingTask.tags,
      assignee: editingTask.assignee,
      reporter: editingTask.reporter,
    }

    onUpdateTask(updateData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {editingTask && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingTask.description || ''}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={editingTask.comment || ''}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, comment: e.target.value })
                }
                placeholder="Add a comment about this task..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={editingTask.status}
                  onValueChange={(
                    value:
                      | 'TODO'
                      | 'IN_PROGRESS'
                      | 'IN_REVIEW'
                      | 'DONE'
                      | 'CANCELLED'
                  ) => setEditingTask({ ...editingTask, status: value })}
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
              <div>
                <Label>Priority</Label>
                <Select
                  value={editingTask.priority}
                  onValueChange={(
                    value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
                  ) => setEditingTask({ ...editingTask, priority: value })}
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
            </div>

            {/* Assignee and Reporter Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Assignee</Label>
                <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={assigneeOpen}
                      className="w-full justify-between"
                    >
                      {editingTask.assignee
                        ? workspaceMembers.find(
                            (member) => member.id === editingTask.assignee?.id
                          )?.name
                        : 'Select assignee...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search members..." />
                      <CommandEmpty>No member found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => {
                            setEditingTask({ ...editingTask, assignee: null })
                            setAssigneeOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              !editingTask.assignee
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          Unassigned
                        </CommandItem>
                        {workspaceMembers.map((member) => (
                          <CommandItem
                            key={member.id}
                            value={member.id}
                            onSelect={(currentValue: string) => {
                              const selectedMember = workspaceMembers.find(
                                (m) => m.id === currentValue
                              )
                              setEditingTask({
                                ...editingTask,
                                assignee: selectedMember || null,
                              })
                              setAssigneeOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                editingTask.assignee?.id === member.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {member.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Reporter</Label>
                <Popover open={reporterOpen} onOpenChange={setReporterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={reporterOpen}
                      className="w-full justify-between"
                    >
                      {editingTask.reporter
                        ? workspaceMembers.find(
                            (member) => member.id === editingTask.reporter?.id
                          )?.name
                        : 'Select reporter...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search members..." />
                      <CommandEmpty>No member found.</CommandEmpty>
                      <CommandGroup>
                        {workspaceMembers.map((member) => (
                          <CommandItem
                            key={member.id}
                            value={member.id}
                            onSelect={(currentValue: string) => {
                              const selectedMember = workspaceMembers.find(
                                (m) => m.id === currentValue
                              )
                              setEditingTask({
                                ...editingTask,
                                reporter:
                                  selectedMember || editingTask.reporter,
                              })
                              setReporterOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                editingTask.reporter?.id === member.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {member.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={
                  editingTask.dueDate
                    ? new Date(editingTask.dueDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    dueDate: e.target.value || null,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={editingTask.tags?.join(', ') || ''}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    tags: e.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter((tag) => tag),
                  })
                }
                placeholder="Enter tags separated by commas"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditTask
