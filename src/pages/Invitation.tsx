import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import InvitationPage from '../components/invitation/InvitationPage'

const Invitation: React.FC = () => {
  const { invitationId } = useParams<{ invitationId: string }>()
  const navigate = useNavigate()
  const { user, token, loading } = useAuth()

  useEffect(() => {
    if (!invitationId) {
      navigate('/login')
      return
    }

    if (!loading && !token) {
      navigate('/login', {
        state: {
          returnTo: `/invitation/${invitationId}`,
          invitationId: invitationId,
        },
      })
      return
    }
  }, [invitationId, token, loading, navigate])

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no invitation ID, redirect to login
  if (!invitationId) {
    return null
  }

  return (
    <InvitationPage
      invitationId={invitationId}
      user={user}
      token={token}
      onNavigate={(path, state) => {
        if (state) {
          navigate(path, state)
        } else {
          navigate(path)
        }
      }}
      onShowLogin={() => {
        navigate('/login', {
          state: {
            returnTo: `/invitation/${invitationId}`,
            invitationId: invitationId,
          },
        })
      }}
      onShowRegister={(email) => {
        navigate('/register', {
          state: {
            returnTo: `/invitation/${invitationId}`,
            invitationId: invitationId,
            email: email,
          },
        })
      }}
    />
  )
}

export default Invitation
