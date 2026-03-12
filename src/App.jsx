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
        <Route path='supervisor/addprojectpage' element={<AddProjectPage />} />
        <Route path='supervisor/modifyprojectpage' element={<ModifyProjectPage />} />
        <Route path='supervisor/teamspage' element={<TeamsPage />} />
      </Routes>
    </>
  )
}

export default App
