// import { useState, useEffect } from 'react'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
// } from '@/components/ui/command'
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover'
// import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
// import { cn } from '@/lib/utils'

// interface User {
//   id: string
//   userId?: string
//   name: string
//   email: string
// }

// interface TaskDetails {
//   id: string
//   title: string
//   description: string | null
//   comment: string | null
//   status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
//   priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
//   assignee?: User | null
//   reporter: User
//   creator: User
//   dueDate: string | null
//   tags: string[]
//   createdAt: string
//   updatedAt: string
//   taskNumber?: string
//   spaceNumber?: string
//   workspaceNumber?: string
// }

// interface WorkspaceMember {
//   id: string
//   name: string
//   email: string
// }

// interface EditTaskDialogProps {
//   isOpen: boolean
//   onOpenChange: (open: boolean) => void
//   task: TaskDetails | null
//   workspaceMembers: WorkspaceMember[]
//   onUpdateTask: (updateData: Partial<TaskDetails>) => void
//   loading: boolean
// }

// const EditTask = ({
//   isOpen,
//   onOpenChange,
//   task,
//   workspaceMembers,
//   onUpdateTask,
//   loading,
// }: EditTaskDialogProps) => {
//   const [editingTask, setEditingTask] = useState<TaskDetails | null>(task)
//   const [assigneeOpen, setAssigneeOpen] = useState(false)
//   const [reporterOpen, setReporterOpen] = useState(false)

//   // Update local state when task changes
//   useEffect(() => {
//     setEditingTask(task)
//   }, [task])

//   const handleClose = (open: boolean) => {
//     onOpenChange(open)
//     if (!open) {
//       setEditingTask(null)
//     }
//   }

//   const handleSave = () => {
//     if (!editingTask) return

//     const updateData: Partial<TaskDetails> = {
//       title: editingTask.title,
//       description: editingTask.description,
//       comment: editingTask.comment,
//       status: editingTask.status,
//       priority: editingTask.priority,
//       dueDate: editingTask.dueDate,
//       tags: editingTask.tags,
//       assignee: editingTask.assignee,
//       reporter: editingTask.reporter,
//     }

//     onUpdateTask(updateData)
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="w-[95vw] max-w-sm sm:max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
//         <DialogHeader className="space-y-2 sm:space-y-3">
//           <DialogTitle className="text-lg sm:text-xl">Edit Task</DialogTitle>
//           <DialogDescription className="text-sm sm:text-base">
//             Make changes to your task. Click save when you're done.
//           </DialogDescription>
//         </DialogHeader>
//         {editingTask && (
//           <div className="space-y-3 sm:space-y-4">
//             <div>
//               <Label htmlFor="title" className="text-sm font-medium">
//                 Title
//               </Label>
//               <Input
//                 id="title"
//                 value={editingTask.title}
//                 onChange={(e) =>
//                   setEditingTask({ ...editingTask, title: e.target.value })
//                 }
//                 className="h-9 sm:h-10 text-sm sm:text-base"
//               />
//             </div>

//             <div>
//               <Label htmlFor="description" className="text-sm font-medium">
//                 Description
//               </Label>
//               <Textarea
//                 id="description"
//                 value={editingTask.description || ''}
//                 onChange={(e) =>
//                   setEditingTask({
//                     ...editingTask,
//                     description: e.target.value,
//                   })
//                 }
//                 className="text-sm sm:text-base resize-none"
//               />
//             </div>

//             <div>
//               <Label htmlFor="comment" className="text-sm font-medium">
//                 Comment
//               </Label>
//               <Textarea
//                 id="comment"
//                 value={editingTask.comment || ''}
//                 onChange={(e) =>
//                   setEditingTask({ ...editingTask, comment: e.target.value })
//                 }
//                 placeholder="Add a comment about this task..."
//                 className="min-h-[80px] text-sm sm:text-base resize-none"
//               />
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//               <div>
//                 <Label className="text-sm font-medium">Status</Label>
//                 <Select
//                   value={editingTask.status}
//                   onValueChange={(
//                     value:
//                       | 'TODO'
//                       | 'IN_PROGRESS'
//                       | 'IN_REVIEW'
//                       | 'DONE'
//                       | 'CANCELLED'
//                   ) => setEditingTask({ ...editingTask, status: value })}
//                 >
//                   <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="TODO">To Do</SelectItem>
//                     <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
//                     <SelectItem value="IN_REVIEW">In Review</SelectItem>
//                     <SelectItem value="DONE">Done</SelectItem>
//                     <SelectItem value="CANCELLED">Cancelled</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <Label className="text-sm font-medium">Priority</Label>
//                 <Select
//                   value={editingTask.priority}
//                   onValueChange={(
//                     value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
//                   ) => setEditingTask({ ...editingTask, priority: value })}
//                 >
//                   <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="LOW">Low</SelectItem>
//                     <SelectItem value="MEDIUM">Medium</SelectItem>
//                     <SelectItem value="HIGH">High</SelectItem>
//                     <SelectItem value="URGENT">Urgent</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Assignee and Reporter Selection */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//               <div>
//                 <Label className="text-sm font-medium">Assignee</Label>
//                 <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       role="combobox"
//                       aria-expanded={assigneeOpen}
//                       className="w-full justify-between h-9 sm:h-10 text-sm sm:text-base"
//                     >
//                       <span className="truncate">
//                         {editingTask.assignee
//                           ? workspaceMembers.find(
//                               (member) => member.id === editingTask.assignee?.id
//                             )?.name
//                           : 'Select assignee...'}
//                       </span>
//                       <ChevronsUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-[200px] sm:w-[250px] p-0">
//                     <Command>
//                       <CommandInput
//                         placeholder="Search members..."
//                         className="text-sm"
//                       />
//                       <CommandEmpty className="text-sm">
//                         No member found.
//                       </CommandEmpty>
//                       <CommandGroup>
//                         <CommandItem
//                           value=""
//                           onSelect={() => {
//                             setEditingTask({ ...editingTask, assignee: null })
//                             setAssigneeOpen(false)
//                           }}
//                           className="text-sm"
//                         >
//                           <Check
//                             className={cn(
//                               'mr-2 h-3 w-3 sm:h-4 sm:w-4',
//                               !editingTask.assignee
//                                 ? 'opacity-100'
//                                 : 'opacity-0'
//                             )}
//                           />
//                           Unassigned
//                         </CommandItem>
//                         {workspaceMembers.map((member) => (
//                           <CommandItem
//                             key={member.id}
//                             value={member.id}
//                             onSelect={(currentValue: string) => {
//                               const selectedMember = workspaceMembers.find(
//                                 (m) => m.id === currentValue
//                               )
//                               setEditingTask({
//                                 ...editingTask,
//                                 assignee: selectedMember || null,
//                               })
//                               setAssigneeOpen(false)
//                             }}
//                             className="text-sm"
//                           >
//                             <Check
//                               className={cn(
//                                 'mr-2 h-3 w-3 sm:h-4 sm:w-4',
//                                 editingTask.assignee?.id === member.id
//                                   ? 'opacity-100'
//                                   : 'opacity-0'
//                               )}
//                             />
//                             {member.name}
//                           </CommandItem>
//                         ))}
//                       </CommandGroup>
//                     </Command>
//                   </PopoverContent>
//                 </Popover>
//               </div>

//               <div>
//                 <Label className="text-sm font-medium">Reporter</Label>
//                 <Popover open={reporterOpen} onOpenChange={setReporterOpen}>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       role="combobox"
//                       aria-expanded={reporterOpen}
//                       className="w-full justify-between h-9 sm:h-10 text-sm sm:text-base"
//                     >
//                       <span className="truncate">
//                         {editingTask.reporter
//                           ? workspaceMembers.find(
//                               (member) => member.id === editingTask.reporter?.id
//                             )?.name
//                           : 'Select reporter...'}
//                       </span>
//                       <ChevronsUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-[200px] sm:w-[250px] p-0">
//                     <Command>
//                       <CommandInput
//                         placeholder="Search members..."
//                         className="text-sm"
//                       />
//                       <CommandEmpty className="text-sm">
//                         No member found.
//                       </CommandEmpty>
//                       <CommandGroup>
//                         {workspaceMembers.map((member) => (
//                           <CommandItem
//                             key={member.id}
//                             value={member.id}
//                             onSelect={(currentValue: string) => {
//                               const selectedMember = workspaceMembers.find(
//                                 (m) => m.id === currentValue
//                               )
//                               setEditingTask({
//                                 ...editingTask,
//                                 reporter:
//                                   selectedMember || editingTask.reporter,
//                               })
//                               setReporterOpen(false)
//                             }}
//                             className="text-sm"
//                           >
//                             <Check
//                               className={cn(
//                                 'mr-2 h-3 w-3 sm:h-4 sm:w-4',
//                                 editingTask.reporter?.id === member.id
//                                   ? 'opacity-100'
//                                   : 'opacity-0'
//                               )}
//                             />
//                             {member.name}
//                           </CommandItem>
//                         ))}
//                       </CommandGroup>
//                     </Command>
//                   </PopoverContent>
//                 </Popover>
//               </div>
//             </div>

//             <div>
//               <Label htmlFor="dueDate" className="text-sm font-medium">
//                 Due Date
//               </Label>
//               <Input
//                 id="dueDate"
//                 type="date"
//                 value={
//                   editingTask.dueDate
//                     ? new Date(editingTask.dueDate).toISOString().split('T')[0]
//                     : ''
//                 }
//                 onChange={(e) =>
//                   setEditingTask({
//                     ...editingTask,
//                     dueDate: e.target.value || null,
//                   })
//                 }
//                 className="h-9 sm:h-10 text-sm sm:text-base"
//               />
//             </div>

//             <div>
//               <Label htmlFor="tags" className="text-sm font-medium">
//                 Tags
//               </Label>
//               <Input
//                 id="tags"
//                 value={editingTask.tags?.join(', ') || ''}
//                 onChange={(e) =>
//                   setEditingTask({
//                     ...editingTask,
//                     tags: e.target.value
//                       .split(',')
//                       .map((tag) => tag.trim())
//                       .filter((tag) => tag),
//                   })
//                 }
//                 placeholder="Enter tags separated by commas"
//                 className="h-9 sm:h-10 text-sm sm:text-base"
//               />
//             </div>
//           </div>
//         )}
//         <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-4">
//           <Button
//             variant="outline"
//             onClick={() => handleClose(false)}
//             className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSave}
//             disabled={loading}
//             className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
//                 Updating...
//               </>
//             ) : (
//               'Save Changes'
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default EditTask

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
import { Loader2, User } from 'lucide-react'

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

  // Update local state when task changes
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
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-md lg:max-w-[600px] max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl">Edit Task</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Make changes to your task. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        {editingTask && (
          <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title *
              </Label>
              <Input
                id="title"
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
                placeholder="Enter task title"
                className="h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={editingTask.description || ''}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    description: e.target.value,
                  })
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
                  value={editingTask.priority}
                  onValueChange={(
                    value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
                  ) => setEditingTask({ ...editingTask, priority: value })}
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
              <Label className="text-sm font-medium">Assignee</Label>
              <Select
                value={editingTask.assignee?.id || 'unassigned'}
                onValueChange={(value) => {
                  if (value === 'unassigned') {
                    setEditingTask({ ...editingTask, assignee: null })
                  } else {
                    const selectedMember = workspaceMembers.find(
                      (member) => member.id === value
                    )
                    setEditingTask({
                      ...editingTask,
                      assignee: selectedMember || null,
                    })
                  }
                }}
              >
                <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {workspaceMembers.map((member) => (
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

            {/* Reporter */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Reporter</Label>
              <Select
                value={editingTask.reporter?.id || 'unassigned'}
                onValueChange={(value) => {
                  if (value === 'unassigned') {
                    // For reporter, we might want to keep the original reporter
                    // or handle this differently based on your business logic
                    return
                  } else {
                    const selectedMember = workspaceMembers.find(
                      (member) => member.id === value
                    )
                    setEditingTask({
                      ...editingTask,
                      reporter: selectedMember || editingTask.reporter,
                    })
                  }
                }}
              >
                <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <SelectValue placeholder="Select reporter" />
                </SelectTrigger>
                <SelectContent>
                  {workspaceMembers.map((member) => (
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
              <Label htmlFor="dueDate" className="text-sm font-medium">
                Due Date
              </Label>
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
                className="h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags" className="text-sm font-medium">
                Tags (comma-separated)
              </Label>
              <Input
                id="tags"
                value={editingTask.tags?.join(', ') || ''}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                  setEditingTask({
                    ...editingTask,
                    tags: tags,
                  })
                }}
                placeholder="tag1, tag2, tag3"
                className="h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>

            {/* Comment */}
            <div className="grid gap-2">
              <Label htmlFor="comment" className="text-sm font-medium">
                Comment
              </Label>
              <Textarea
                id="comment"
                value={editingTask.comment || ''}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, comment: e.target.value })
                }
                placeholder="Add a comment about this task (optional)"
                rows={2}
                className="text-sm sm:text-base resize-none"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-4">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
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
