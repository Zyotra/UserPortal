import './App.css'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './pages/dashboard'
import AddProject from './components/dashboard/AddProject'
import DeployUI from './components/dashboard/DeployUI'
import DeployDB from "./components/dashboard/deployDB.tsx";
import DeployCaching from "./components/dashboard/deployCaching.tsx";
import ProtectedRoute from "./components/ProtectedRoutes.tsx";

function App() {
    return (
        <Router>
            <Toaster position="top-right"/>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                    <Dashboard/>
                    </ProtectedRoute>
                }/>
                <Route path="/new-project" element={<AddProject/>}/>
                <Route path="/deploy-ui" element={<DeployUI/>}/>
                <Route path="deploy-database" element={<DeployDB/>}/>
                <Route path="deploy-caching" element={<DeployCaching/>}/>
                <Route path="/" element={<Navigate to="/login" replace/>}/>
            </Routes>
        </Router>
    )
}

export default App
