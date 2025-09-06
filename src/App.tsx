import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import {
  Workspace,
  Login,
  Register,
  Space,
  NotFound,
  Invitation,
} from './pages'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route path="/invitation/:invitationId" element={<Invitation />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Workspace />} />
              <Route path=":workspaceNumber" element={<Workspace />} />
              <Route path=":workspaceNumber/:spaceId" element={<Space />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
