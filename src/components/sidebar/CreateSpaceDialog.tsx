import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
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
import { useWorkspace } from '@/context/workspaceContext'
import { useAuth } from '@/context/authContext'
import axios from 'axios'

interface CreatedSpace {
  id: string
  name: string
  spaceNumber: string
  workspaceNumber: string
}

interface CreateSpaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId?: string
  onSpaceCreated?: (space: CreatedSpace) => void
}

const CreateSpaceDialog = ({
  open,
  onOpenChange,
  workspaceId,
  onSpaceCreated,
}: CreateSpaceDialogProps) => {
  const navigate = useNavigate()
  const { selectedWorkspace, refreshWorkspaces, workspaces } = useWorkspace()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [error, setError] = useState('')

  // Determine which workspace to use
  const targetWorkspace = workspaceId
    ? workspaces.find((w) => w.id === workspaceId) || {
        id: workspaceId,
        name: 'Workspace',
      }
    : selectedWorkspace

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (error) setError('')
  }

  const handleClose = () => {
    setFormData({ name: '', description: '' })
    setError('')
    onOpenChange(false)
  }

  const handleCreateSpace = async () => {
    if (!targetWorkspace || !formData.name.trim()) {
      setError('Space name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/space/create`,
        {
          workspaceId: targetWorkspace.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
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
        throw new Error(errorData.message || 'Failed to create space')
      }

      setFormData({ name: '', description: '' })
      onOpenChange(false)

      await refreshWorkspaces()

      if (onSpaceCreated) {
        onSpaceCreated(result.space)
      } else {
        navigate(`/${result.space.workspaceNumber}/${result.space.spaceNumber}`)
      }
    } catch (error) {
      console.error('Error creating space:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to create space'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreateSpace()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Space</DialogTitle>
          <DialogDescription>
            Add a new space to {targetWorkspace?.name || 'the selected'}{' '}
            workspace.
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
              <Label htmlFor="space-name">Name *</Label>
              <Input
                id="space-name"
                placeholder="Enter space name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="space-description">Description</Label>
              <Textarea
                id="space-description"
                placeholder="Enter space description (optional)"
                value={formData.description}
                onChange={(e) =>
                  handleFormChange('description', e.target.value)
                }
                disabled={loading}
                rows={3}
              />
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
              Create Space
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSpaceDialog
