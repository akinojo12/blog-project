import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import LandingPage from './pages/LandingPage'
import RegisterPage from './components/RegisterPage'
import ForgotPassword from './components/ForgotPassword'
import HomePage from './pages/HomePage'
import BlogCard from './components/BlogCard'
import ComposePage from './components/ComposePage'
import ProfilePage from './pages/ProfilePage'


const App = () => {


  return (
    <>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} /> 
      <Route path="/home" element={<HomePage/>} />
      <Route path="/blog" element={<BlogCard/>} />
      <Route path="/compose" element={<ComposePage/>} />
      <Route path='/profile' element={<ProfilePage/>} />
       
      </Routes>
    </>
  )
}

export default App
