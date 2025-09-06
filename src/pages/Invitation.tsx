// import React from 'react'
// import { Routes, Route, useParams, useNavigate } from 'react-router-dom'
// import { useAuth } from '@/context/authContext'
// import InvitationPage from '@/components/invitation/InvitationPage'

// // Route component for invitation page
// const Invitation: React.FC = () => {
//   const { invitationId } = useParams<{ invitationId: string }>()
//   const navigate = useNavigate()
//   const { user, token } = useAuth()

//   if (!invitationId) {
//     navigate('/login')
//     return null
//   }

//   return (
//     <InvitationPage
//       invitationId={invitationId}
//       user={user}
//       token={token}
//       onNavigate={(path, state) => {
//         if (state) {
//           navigate(path, state)
//         } else {
//           navigate(path)
//         }
//       }}
//     />
//   )
// }

// export default Invitation

import React, { useEffect } from 'react'
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import { useAuth } from '@/context/authContext'
import InvitationPage from '@/components/invitation/InvitationPage'

// Route component for invitation page
const Invitation: React.FC = () => {
  const { invitationId } = useParams<{ invitationId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token, loading } = useAuth()

  useEffect(() => {
    if (!invitationId) {
      navigate('/login')
      return
    }

    // If not loading and not authenticated, redirect to login with invitation state
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If no invitation ID, redirect to login
  if (!invitationId) {
    return null // useEffect will handle navigation
  }

  // If not authenticated, redirect will happen in useEffect
  if (!token) {
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
