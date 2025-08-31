import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Loader2 } from "lucide-react";
import { useAuth } from '@/context/authContext';

interface WorkspaceSpace {
  id: string;
  name: string;
  description?: string | null;
  spaceNumber: string;
}

interface DeleteSpaceProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  space: WorkspaceSpace | null;
  onSpaceDeleted: () => void;
}

const DeleteSpace = ({
  isOpen,
  onOpenChange,
  space,
  onSpaceDeleted,
}: DeleteSpaceProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const handleDeleteSpace = async () => {
    if (!space?.id) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3000/api/space/delete/${space.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete space');
      }
      
      onSpaceDeleted();
      onOpenChange(false);
    } catch (err) {
      console.error('Error deleting space:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete space');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Space</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{space?.name}"? This action cannot be undone and will permanently delete all tasks and data within this space.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDeleteSpace}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete Space
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSpace