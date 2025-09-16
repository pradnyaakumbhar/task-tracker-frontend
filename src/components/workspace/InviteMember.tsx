import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useWorkspace } from '@/context/workspaceContext'
import { useAuth } from '@/context/authContext'
import axios from 'axios'

interface InviteMemberProps {
  isOpen: boolean
  onClose: () => void
}

const InviteMember: React.FC<InviteMemberProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<boolean>(false)

  const { selectedWorkspace, refreshWorkspaces } = useWorkspace()
  const { token } = useAuth()

  const handleSubmit = async (): Promise<void> => {
    if (!email) {
      setError('Email is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!selectedWorkspace) {
      setError('No workspace selected')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/invitation/send`,
        {
          email,
          workspaceId: selectedWorkspace.id,
          workspaceName: selectedWorkspace.name,
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
        setError(data.error || 'Failed to send invitation')
        return
      }

      setSuccess(true)
      setEmail('')

      if (refreshWorkspaces) {
        await refreshWorkspaces()
      }

      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 3000)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send invitation'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = (): void => {
    setEmail('')
    setError('')
    setSuccess(false)
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md border">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Invite Team Member
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 rounded-full"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Add a new member to{' '}
            <Badge variant="secondary">
              {selectedWorkspace?.name || 'this workspace'}
            </Badge>{' '}
            workspace.
          </p>

          {/* Success State */}
          {success ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                Invitation Sent Successfully!
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                An invitation email has been sent to <strong>{email}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                They will receive a link to join the workspace and complete
                authentication
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter team member's email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  className={
                    error ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }
                  disabled={isLoading}
                  autoFocus
                />
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Current Workspace Info */}
              {selectedWorkspace && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">Workspace:</span>
                    <span className="font-medium">
                      {selectedWorkspace.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Current members:
                    </span>
                    <span className="font-medium">
                      {selectedWorkspace._count?.members || 0}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !email || !selectedWorkspace}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InviteMember
