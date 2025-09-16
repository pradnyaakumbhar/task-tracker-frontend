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
import { Save, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/authContext'
import axios from 'axios'

interface WorkspaceSpace {
  id: string
  name: string
  description?: string | null
  spaceNumber: string
}

interface UpdateSpaceProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  space: WorkspaceSpace | null
  onSpaceUpdated: () => void
}

const UpdateSpace = ({
  isOpen,
  onOpenChange,
  space,
  onSpaceUpdated,
}: UpdateSpaceProps) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const { token } = useAuth()
  // Initialize form when dialog opens or space changes
  useEffect(() => {
    if (isOpen && space) {
      setFormData({
        name: space.name,
        description: space.description || '',
      })
      setError(null)
    }
  }, [isOpen, space])

  const handleUpdateSpace = async () => {
    if (!space?.id || !formData.name.trim()) {
      setError('Space name is required')
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}/api/space/update`,
        {
          id: space.id,
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
      const data = response.data
      if (!response) {
        const errorData = await data.error
        throw new Error(errorData.error || 'Failed to update space')
      }

      onSpaceUpdated()
      onOpenChange(false)
    } catch (err) {
      console.error('Error updating space:', err)
      setError(err instanceof Error ? err.message : 'Failed to update space')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Space</DialogTitle>
          <DialogDescription>
            Update the name and description of your space.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="spaceName">Name *</Label>
            <Input
              id="spaceName"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter space name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="spaceDescription">Description</Label>
            <Textarea
              id="spaceDescription"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter space description (optional)"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateSpace}
            disabled={isUpdating || !formData.name.trim()}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Update Space
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateSpace
