import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter,Navigate,Route,Routes} from 'react-router-dom'
import {AuthProvider,useAuth} from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AdminPeople from './pages/AdminPeople'
import Catalog from './pages/Catalog'
import FacultyDashboard from './pages/FacultyDashboard'
import StudentSearch from './pages/StudentSearch'
import StudentDashboard from './pages/StudentDashboard'
import Profile from './pages/Profile'
import AiInsightsDashboard from './pages/AiInsightsDashboard'
import PlacementReadiness from './pages/PlacementReadiness'
import AssignmentManagement from './pages/AssignmentManagement'
import './index.css'
function Guard({role}){const {user}=useAuth();return !user?<Navigate to="/login"/>:user.role!==role?<Navigate to={`/${user.role.toLowerCase()}`}/>:<AppLayout/>}
function App(){return <Routes><Route path="/login" element={<Login/>}/><Route element={<Guard role="ADMIN"/>}><Route path="/admin" element={<AdminDashboard/>}/><Route path="/admin/students" element={<AdminPeople type="students"/>}/><Route path="/admin/faculty" element={<AdminPeople type="faculty"/>}/><Route path="/admin/catalog" element={<Catalog/>}/><Route path="/admin/ai" element={<AiInsightsDashboard/>}/><Route path="/admin/placement" element={<PlacementReadiness/>}/></Route><Route element={<Guard role="FACULTY"/>}><Route path="/faculty" element={<FacultyDashboard/>}/><Route path="/faculty/students" element={<StudentSearch/>}/><Route path="/faculty/assignments" element={<AssignmentManagement/>}/><Route path="/faculty/ai" element={<AiInsightsDashboard/>}/><Route path="/faculty/placement" element={<PlacementReadiness/>}/></Route><Route element={<Guard role="STUDENT"/>}><Route path="/student" element={<StudentDashboard/>}/><Route path="/student/profile" element={<Profile/>}/><Route path="/student/assignments" element={<AssignmentManagement/>}/><Route path="/student/placement" element={<PlacementReadiness/>}/></Route><Route path="*" element={<Navigate to="/login"/>}/></Routes>}
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><AuthProvider><App/></AuthProvider></BrowserRouter></React.StrictMode>)


