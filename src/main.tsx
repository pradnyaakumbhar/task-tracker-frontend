import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/authContext.tsx';
import { WorkspaceProvider } from './context/workspaceContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <WorkspaceProvider>
      <App />
      </WorkspaceProvider>
    </AuthProvider>
  </StrictMode>,
)
