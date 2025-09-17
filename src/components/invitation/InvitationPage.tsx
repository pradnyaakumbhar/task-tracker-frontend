import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Users,
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle,
  ExternalLink,
  Shield,
  ArrowRight,
} from 'lucide-react'
import axios from 'axios'

interface InvitationData {
  id: string
  email: string
  workspaceName: string
  senderName: string
  expiresAt: string
}

type InvitationAction =
  | 'register'
  | 'login'
  | 'accepted'
  | 'expired'
  | 'error'
  | 'loading'

interface InvitationPageProps {
  invitationId: string
  user?: { id: string; email: string; name: string } | null
  token?: string | null
  onNavigate?: (path: string, state?: any) => void
  onShowLogin?: () => void
  onShowRegister?: (email?: string) => void
}

const InvitationPage: React.FC<InvitationPageProps> = ({
  invitationId,
  user,
  token,
  onNavigate,
  onShowLogin,
  onShowRegister,
}) => {
  const [action, setAction] = useState<InvitationAction>('loading')
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string>('')
  const [processing, setProcessing] = useState<boolean>(false)
  const [workspaceNumber, setWorkspaceNumber] = useState<string | null>(null)

  useEffect(() => {
    if (invitationId) {
      handleInvitationLink()
    }
  }, [invitationId, token])

  const handleInvitationLink = async () => {
    try {
      setAction('loading')
      setError('')

      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_BASE_URL
        }/api/invitation/join/${invitationId}`,
        {
          headers,
        }
      )

      const data = await response.data

      if (!response) {
        setError(data.error || 'Failed to process invitation')
        setAction('error')
        return
      }

      setAction(data.action)
      if (data.invitation) setInvitation(data.invitation)
      if (data.workspaceNumber || data.workspace?.number) {
        setWorkspaceNumber(data.workspaceNumber || data.workspace.number)
      }

      if (data.action === 'accepted') {
        setTimeout(() => {
          if (data.workspaceNumber || data.workspace?.number) {
            onNavigate?.(`/${data.workspaceNumber || data.workspace.number}`)
          } else {
            onNavigate?.('/')
          }
        }, 3000)
      }
    } catch (err) {
      console.error('Failed to handle invitation link:', err)
      setError('Failed to process invitation')
      setAction('error')
    }
  }

  const handleManualAccept = async () => {
    if (!user || !token) {
      setError('Authentication required')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/invitation/accept`,
        { invitationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.data

      if (!data.success) {
        setError(data.error || 'Failed to accept invitation')
        return
      }

      setAction('accepted')
      setTimeout(() => {
        if (data.workspaceNumber) {
          onNavigate?.(`/${data.workspaceNumber}`)
        } else {
          onNavigate?.('/')
        }
      }, 2000)
    } catch (err) {
      console.error('Failed to accept invitation:', err)
      setError('Failed to accept invitation')
    } finally {
      setProcessing(false)
    }
  }

  const handleLogin = () => {
    if (onShowLogin) {
      onShowLogin()
    } else {
      onNavigate?.('/login', {
        state: {
          returnTo: `/invitation/${invitationId}`,
          invitationId,
          email: invitation?.email,
        },
      })
    }
  }

  const handleRegister = () => {
    if (onShowRegister) {
      onShowRegister(invitation?.email)
    } else {
      onNavigate?.('/register', {
        state: {
          returnTo: `/invitation/${invitationId}`,
          invitationId,
          email: invitation?.email,
        },
      })
    }
  }

  const formatExpiryTime = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diffHours = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)
    )

    if (diffHours < 24) return `${diffHours} hours`
    const diffDays = Math.ceil(diffHours / 24)
    return `${diffDays} days`
  }

  const renderContent = () => {
    switch (action) {
      case 'loading':
        return (
          <div className="text-center py-6 sm:py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">
              Processing Invitation...
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Please wait while we verify your invitation
            </p>
          </div>
        )

      case 'register':
        return (
          <div className="text-center py-4 sm:py-6">
            <div className="mx-auto mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">
              Join {invitation?.workspaceName}!
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 px-2">
              {invitation?.senderName} has invited you to collaborate
            </p>

            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium break-all">
                  {invitation?.email}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>
                  Expires in{' '}
                  {invitation?.expiresAt &&
                    formatExpiryTime(invitation.expiresAt)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRegister}
                className="w-full text-sm sm:text-base"
                size="lg"
              >
                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  Create Account & Join Workspace
                </span>
              </Button>

              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <span>Already have an account?</span>
                <Button
                  variant="link"
                  onClick={handleLogin}
                  className="p-0 h-auto text-primary text-xs sm:text-sm"
                >
                  Sign in instead
                  <ArrowRight className="h-3 w-3 ml-1 flex-shrink-0" />
                </Button>
              </div>
            </div>
          </div>
        )

      case 'login':
        return (
          <div className="text-center py-4 sm:py-6">
            <div className="mx-auto mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">
              Welcome back!
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 px-2">
              Sign in to join {invitation?.workspaceName}
            </p>

            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium break-all">
                  {invitation?.email}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Invited by {invitation?.senderName}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleLogin}
                className="w-full text-sm sm:text-base"
                size="lg"
              >
                <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Sign In & Join Workspace</span>
              </Button>

              {user && user.email === invitation?.email && (
                <div className="pt-2 border-t">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 break-all">
                    Already signed in as {user.email}
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleManualAccept}
                    disabled={processing}
                    className="w-full text-sm sm:text-base"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                        <span className="truncate">Joining workspace...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                        Accept Invitation
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      case 'accepted':
        return (
          <div className="text-center py-6 sm:py-8">
            <div className="mx-auto mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
              Welcome to the team!
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 px-2">
              You've successfully joined {invitation?.workspaceName}
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-400">
                {workspaceNumber
                  ? 'Redirecting to your workspace...'
                  : 'Redirecting to dashboard...'}
              </p>
            </div>
            {workspaceNumber && (
              <Button
                variant="outline"
                onClick={() => onNavigate?.(`/${workspaceNumber}`)}
                className="mt-2 text-sm sm:text-base"
              >
                Go to Workspace Now
              </Button>
            )}
          </div>
        )

      case 'expired':
        return (
          <div className="text-center py-6 sm:py-8">
            <div className="mx-auto mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">
              Invitation Expired
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 px-2">
              This invitation link has expired or is no longer valid
            </p>
            <Button
              variant="outline"
              onClick={() => onNavigate?.('/login')}
              className="text-sm sm:text-base"
            >
              Go to Login
            </Button>
          </div>
        )

      case 'error':
        return (
          <div className="text-center py-6 sm:py-8">
            <div className="mx-auto mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">
              Something went wrong
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 px-2">
              {error}
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleInvitationLink}
                className="text-sm sm:text-base"
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate?.('/login')}
                className="text-sm sm:text-base"
              >
                Go to Login
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <CardTitle className="text-base sm:text-lg">
              Workspace Invitation
            </CardTitle>
          </div>
          {invitation && (
            <div className="space-y-1">
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {invitation.workspaceName}
              </Badge>
              <p className="text-xs sm:text-sm text-muted-foreground">
                From {invitation.senderName}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">{renderContent()}</CardContent>
      </Card>
    </div>
  )
}

export default InvitationPage
