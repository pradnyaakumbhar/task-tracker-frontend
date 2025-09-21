import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/authContext'
import axios from 'axios'

interface WorkspaceSpace {
  id: string
  name: string
  description?: string | null
  spaceNumber: string
}

interface DeleteSpaceProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  space: WorkspaceSpace | null
  onSpaceDeleted: () => void
}

const DeleteSpace = ({
  isOpen,
  onOpenChange,
  space,
  onSpaceDeleted,
}: DeleteSpaceProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()
  const handleDeleteSpace = async () => {
    if (!space?.id) return

    setIsDeleting(true)
    setError(null)

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_BASE_URL}/api/space/delete/${space.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = response.data
      if (!response) {
        const errorData = await data.error
        throw new Error(errorData.error || 'Failed to delete space')
      }

      onSpaceDeleted()
      onOpenChange(false)
    } catch (err) {
      console.error('Error deleting space:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete space')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-md lg:max-w-[425px] mx-auto">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl">Delete Space</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Are you sure you want to delete "{space?.name}"? This will
            permanently delete all tasks and data within this space.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-xs sm:text-sm text-destructive bg-destructive/10 p-2 sm:p-3 rounded-md">
            {error}
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteSpace}
            disabled={isDeleting}
            className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10"
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            )}
            Delete Space
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteSpace
