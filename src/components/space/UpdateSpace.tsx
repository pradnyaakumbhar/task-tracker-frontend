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
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-md lg:max-w-[425px] mx-auto">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl">Update Space</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Update the name and description of your space.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-xs sm:text-sm text-destructive bg-destructive/10 p-2 sm:p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
          <div className="grid gap-2">
            <Label htmlFor="spaceName" className="text-sm font-medium">
              Name *
            </Label>
            <Input
              id="spaceName"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter space name"
              className="h-9 sm:h-10 text-sm sm:text-base"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="spaceDescription" className="text-sm font-medium">
              Description
            </Label>
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
            onClick={handleUpdateSpace}
            disabled={isUpdating || !formData.name.trim()}
            className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            )}
            Update Space
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateSpace
