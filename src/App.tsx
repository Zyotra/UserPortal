import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './pages/dashboard'
import AddProject from './components/dashboard/AddProject'
import DeployUI from './components/dashboard/DeployUI'

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-project" element={<AddProject />} />
        <Route path="/deploy-ui" element={<DeployUI />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
