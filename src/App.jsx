import React from 'react'
import './App.css'
import Login from './component/Login'
import ResetPW from './component/ResetPW'
import Home from './Home'
import {Routes, Route } from 'react-router-dom'
import ProjectDashboard from './component/Dashboard'
import UserAccountsManage from "./component/UserAccountsManage"
import FirstPage from './component/student/FirstPage.jsx'
import HomePage from './component/supervisor/HomePage.jsx'
import ProjectsPage from './component/supervisor/ProjectsPage.jsx'
import AddProjectPage from './component/supervisor/AddProjectPage';
import ModifyProjectPage from './component/supervisor/ModifyProjectPage';
import TeamsPage from './component/supervisor/TeamsPage';
import TeamManagementPage from './component/student/TeamManagementPage';
import Notifications from './component/student/Notifications';
import PreferenceList from './component/student/PreferenceList';
import ChatPage from './component/student/ChatPage';
import SupervisorChatPage from './component/supervisor/ChatPage';
import SupervisorNotifications from './component/supervisor/Notifications';



function App() {

  return (
    <>
      <Routes>
        <Route index path='/login' element={<Login />} />
        <Route index path='/' element={<Home />} />
        <Route index path='/resetpw' element={<ResetPW />} />
        <Route index path='/projectsdashboard' element={<ProjectDashboard />} /> {/*Admin session */}
        <Route index path='/accountsmanage' element={<UserAccountsManage />} />
        <Route index path='student/firstpage' element={<FirstPage />} /> {/*Student session */}
        <Route index path='supervisor/homepage' element={<HomePage />} />  {/*Supervisor session */}
        <Route index path='supervisor/projectspage' element={<ProjectsPage />} /> {/*Supervisor session */}
        <Route index path='supervisor/addprojectpage' element={<AddProjectPage />} />
        <Route index path='supervisor/modifyprojectpage' element={<ModifyProjectPage />} />
        <Route index path='supervisor/teamspage' element={<TeamsPage />} />
        <Route index path='student/TeamManagementPage' element={<TeamManagementPage />} />
        <Route index path='student/notifications' element={<Notifications />} />
        <Route path='student/preferencelist' element={<PreferenceList />} />
         <Route path='student/chatpage' element={<ChatPage />} /> 
         <Route path='supervisor/chat' element={<SupervisorChatPage />} />
         <Route path='supervisor/notifications' element={<SupervisorNotifications />} />
      </Routes>
    </>
  )
}

export default App