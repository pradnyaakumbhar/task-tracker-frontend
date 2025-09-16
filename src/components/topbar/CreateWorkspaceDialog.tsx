import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, X, Plus } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { useWorkspace } from '@/context/workspaceContext'
import { useAuth } from '@/context/authContext'
import axios from 'axios'

interface CreatedWorkspace {
  id: string
  name: string
  number: string
}

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWorkspaceCreated?: (workspace: CreatedWorkspace) => void
}

interface FormData {
  name: string
  description: string
  memberEmails: string[]
}

const CreateWorkspaceDialog = ({
  open,
  onOpenChange,
  onWorkspaceCreated,
}: CreateWorkspaceDialogProps) => {
  const navigate = useNavigate()
  const { refreshWorkspaces, setSelectedWorkspace } = useWorkspace()
  const { token } = useAuth()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    memberEmails: [],
  })
  const [newEmailInput, setNewEmailInput] = useState('')
  const [error, setError] = useState('')

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (error) setError('')
  }

  const addMemberEmail = () => {
    const email = newEmailInput.trim().toLowerCase()
    if (!email) return

    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (formData.memberEmails.includes(email)) {
      setError('Email already added')
      return
    }

    setFormData((prev) => ({
      ...prev,
      memberEmails: [...prev.memberEmails, email],
    }))
    setNewEmailInput('')
    setError('')
  }

  const removeMemberEmail = (emailToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      memberEmails: prev.memberEmails.filter(
        (email) => email !== emailToRemove
      ),
    }))
  }

  const handleEmailInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addMemberEmail()
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      memberEmails: [],
    })
    setNewEmailInput('')
    setError('')
    onOpenChange(false)
  }

  const handleCreateWorkspace = async () => {
    if (!formData.name.trim()) {
      setError('Workspace name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/workspace/create`,
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          memberEmails: formData.memberEmails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const result = await response.data
      if (!response) {
        const errorData = await result.error.catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create workspace')
      }

      setFormData({
        name: '',
        description: '',
        memberEmails: [],
      })
      setNewEmailInput('')
      onOpenChange(false)

      await refreshWorkspaces()

      if (onWorkspaceCreated) {
        onWorkspaceCreated(result.workspace)
      } else {
        setSelectedWorkspace(result.workspace)
        if (result.workspace.spaces && result.workspace.spaces.length > 0) {
          navigate(
            `/${result.workspace.number}/${result.workspace.spaces[0].spaceNumber}`
          )
        }
      }
    } catch (error) {
      console.error('Error creating workspace:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to create workspace'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreateWorkspace()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your projects and collaborate
            with your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="workspace-name">Name *</Label>
              <Input
                id="workspace-name"
                placeholder="Enter workspace name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workspace-description">Description</Label>
              <Textarea
                id="workspace-description"
                placeholder="Enter workspace description (optional)"
                value={formData.description}
                onChange={(e) =>
                  handleFormChange('description', e.target.value)
                }
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="member-emails">Team Members</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="member-emails"
                    placeholder="Enter email address"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    onKeyPress={handleEmailInputKeyPress}
                    disabled={loading}
                    type="email"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addMemberEmail}
                    disabled={loading || !newEmailInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.memberEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.memberEmails.map((email, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeMemberEmail(email)}
                          disabled={loading}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateWorkspaceDialog
