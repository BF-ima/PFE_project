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
import ProjectsPage from './component/supervisor/ProjectsPage.jsx'
import AddProjectPage from './component/supervisor/AddProjectPage';
import ModifyProjectPage from './component/supervisor/ModifyProjectPage';
import TeamsPage from './component/supervisor/TeamsPage';
import TeamManagementPage from './component/student/TeamManagementPage.jsx';
import Notifications from './component/student/Notifications.jsx';
import PreferenceList from './component/student/PreferenceList.jsx';
import AcademicEntityManagement from './component/admin/AcademicEntityManagement.jsx'
import ProposalReview from './component/admin/ProposalReview.jsx'
import TeamsAllocation from './component/admin/TeamsAllocation.jsx'
import ProjectAllocation from './component/admin/ProjectAllocation.jsx'
import AllocationResults from './component/admin/AllocationResults.jsx'
import TeamsList from './component/admin/TeamsList.jsx'
import AdminNotifications from './component/admin/notifications.jsx'
import Announcements from './component/admin/Announcements.jsx'
import Messaging from './component/admin/Messaging.jsx'
import DefenseManagement from './component/admin/DefenseManagement.jsx'
import ChatPage from './component/student/ChatPage';
import SupervisorChatPage from './component/supervisor/ChatPage';
import SupervisorNotifications from './component/supervisor/Notifications';
import DocumentsPage from './component/student/DocumentsPage';
import SupervisorDocumentsPage from './component/supervisor/DocumentsPage';
import DeliverableDocumentPage from './component/supervisor/SupervisorDeadlinesPage.jsx';
import MeetingManagement from './component/supervisor/MeetingManagement';
import StudentMeetingPage from './component/student/StudentMeetingPage';
import ResultPage from './component/student/ResultPage';



import ExChatPage from './component/externalsupervisor/ChatPage'
import ExMeetingPage from './component/externalsupervisor/MeetingManagement'
import ExDocumentPage from './component/externalsupervisor/DocumentsPage'
import ExNotifications from './component/externalsupervisor/Notifications'
import ExTeamsPage from './component/externalsupervisor/TeamsPage'




function App() {

  return (
    <>
      <Routes>
        <Route index path='/login' element={<Login />} />
        <Route index path='/resetpw' element={<ResetPW />} />
        <Route index path='/resetpss/:token' element={<ResetPss />} />
        <Route index path='/projectsdashboard' element={<ProjectDashboard />} /> {/*Admin session */}
        <Route index path='/accountsmanage' element={<UserAccountsManage />} />
        <Route index path='student/firstpage' element={<FirstPage />} /> {/*Student session */}
        <Route index path='student/teammanagementpage' element={<TeamManagementPage />} />
        <Route index path='student/notifications' element={<Notifications />} />
        <Route index path='supervisor/homepage' element={<HomePage />} />  {/*Supervisor session */}
        <Route index path='supervisor/projectspage' element={<ProjectsPage />} /> {/*Supervisor session */}
        <Route path='supervisor/addprojectpage' element={<AddProjectPage />} />
        <Route path='supervisor/modifyprojectpage' element={<ModifyProjectPage />} />
        <Route path='supervisor/teamspage' element={<TeamsPage />} />
        <Route path='student/preferencelist' element={<PreferenceList />} />
        <Route index path='/academicentitymanage' element={<AcademicEntityManagement />} /> {/*Admin session */}
        <Route index path='/ProposalReview' element={<ProposalReview />} /> {/*Admin session */}
        <Route index path='/teamsallocation' element={<TeamsAllocation />} /> {/*Admin session */}
        <Route index path='/project-allocation' element={<ProjectAllocation />} /> {/*Admin session */}
        <Route index path='/allocationresults' element={<AllocationResults />} /> {/*Admin session */}
        <Route index path='/teams-list' element={<TeamsList />} /> {/*Admin session */}
        <Route index path='/admin-notifications' element={<AdminNotifications />} /> {/*Admin session */}
        <Route index path='/notifications' element={<AdminNotifications />} />
        <Route index path='/messaging' element={<Messaging />} /> {/*Admin session */}
        <Route index path='/announcements' element={<Announcements />} /> {/*Admin session */}
        <Route index path='/defense-manage' element={<DefenseManagement />} /> {/*Admin session */}
        <Route path='student/chatpage' element={<ChatPage />} /> 
        <Route path='supervisor/chat' element={<SupervisorChatPage />} />
        <Route path='supervisor/notifications' element={<SupervisorNotifications />} />
        <Route path='student/documents' element={<DocumentsPage />} />
        <Route path='supervisor/documents' element={<SupervisorDocumentsPage />} />
        <Route path='supervisor/meetings' element={<MeetingManagement />} />
        <Route path='supervisor/deadlines' element={<DeliverableDocumentPage />} />
        <Route path='student/meetings' element={<StudentMeetingPage />} />
        <Route path="/student/results" element={<ResultPage />} />



        <Route index path='external_supervisor/chatpage' element={<ExChatPage />} />
        <Route index path='external_supervisor/meeting' element={<ExMeetingPage />} />
        <Route index path='external_supervisor/documentpage' element={<ExDocumentPage />} />
        <Route index path='external_supervisor/notifications' element={<ExNotifications />} />
        <Route index path='external_supervisor/teamspage' element={<ExTeamsPage />} />


    
      </Routes>
    </>
  )
}

export default App
