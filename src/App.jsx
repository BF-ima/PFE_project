import React from 'react'
import './App.css'
import Login from './component/Login'
import ResetPW from './component/ResetPW'
import ResetPss from './component/ResetPss'
import Home from './Home'
import {Routes, Route } from 'react-router-dom'
import ProjectDashboard from './component/Dashboard'
import UserAccountsManage from "./component/UserAccountsManage"
import FirstPage from './component/student/FirstPage.jsx'
import HomePage from './component/supervisor/HomePage.jsx'





function App() {

  return (
    <>
      <Routes>
        <Route index path='/login' element={<Login />} />
        <Route index path='/' element={<Home />} />
        <Route index path='/resetpw' element={<ResetPW />} />
        <Route index path='/resetpss/:token' element={<ResetPss />} />
        <Route index path='/projectsdashboard' element={<ProjectDashboard />} /> {/*Admin session */}
        <Route index path='/accountsmanage' element={<UserAccountsManage />} />
        <Route index path='student/firstpage' element={<FirstPage />} /> {/*Student session */}
        <Route index path='supervisor/homepage' element={<HomePage />} />  {/*Supervisor session */}
      </Routes>
    </>
  )
}

export default App
