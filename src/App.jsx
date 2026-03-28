import React from 'react'
import './App.css'
import Login from './component/Login'
import ResetPW from './component/ResetPW'
import Home from './Home'
import {Routes, Route } from 'react-router-dom'
import ProjectDashboard from './component/Dashboard'
import UserAccountsManage from "./component/UserAccountsManage"
import AcademicEntityManagement from './component/admin/AcademicEntityManagement.jsx'
import ProposalReview from './component/admin/ProposalReview.jsx'
import TeamsAllocation from './component/admin/TeamsAllocation.jsx'
import ProjectAllocation from './component/admin/ProjectAllocation.jsx'
import AllocationResults from './component/admin/AllocationResults.jsx'
import TeamsList from './component/admin/TeamsList.jsx'
import Notifications from './component/admin/notifications.jsx'
import Announcements from './component/admin/Announcements.jsx'
import Messaging from './component/admin/Messaging.jsx'
import DefenseManagement from './component/admin/DefenseManagement.jsx'
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
        <Route index path='/academicentitymanage' element={<AcademicEntityManagement />} /> {/*Admin session */}
        <Route index path='/ProposalReview' element={<ProposalReview />} /> {/*Admin session */}
        <Route index path='/teamsallocation' element={<TeamsAllocation />} /> {/*Admin session */}
        <Route index path='/project-allocation' element={<ProjectAllocation />} /> {/*Admin session */}
        <Route index path='/allocationresults' element={<AllocationResults />} /> {/*Admin session */}
        <Route index path='/teams-list' element={<TeamsList />} /> {/*Admin session */}
        <Route index path='/notifications' element={<Notifications />} /> {/*Admin session */}
        <Route index path='/messaging' element={<Messaging />} /> {/*Admin session */}
        <Route index path='/announcements' element={<Announcements />} /> {/*Admin session */}
        <Route index path='/defense-manage' element={<DefenseManagement />} /> {/*Admin session */}
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
