import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {Dashboard, Login, Register, Workspace, NotFound} from './pages';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path=":workspaceId/:spaceId" element={<Workspace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App;
