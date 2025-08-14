import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {Dashboard, Login, Register} from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App;
