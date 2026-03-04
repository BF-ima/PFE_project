import React from 'react'
import './App.css'
import Login from './component/Login'
import ResetPW from './component/ResetPW'
import Home from './Home'
import {Routes, Route } from 'react-router-dom'


function App() {

  return (
    <>
      <Routes>
        <Route index path='/login' element={<Login />} />
        <Route index path='/' element={<Home />} />
        <Route index path='/resetpw' element={<ResetPW />} />
      </Routes>
    </>
  )
}

export default App
