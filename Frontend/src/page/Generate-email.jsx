import React, { useEffect, useState, useCallback } from 'react'
import { MovingDots } from '../components/moving-dots';
import { Header } from '../components/Header';
import { EmailGenerator } from '../components/email-generator';
import { Footer } from '../components/Footer';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login, logout } from '../context/authSlice';
import { useToast } from '../hooks/use-toast';
import Sidebar from '../components/Sidebar';
import { isTokenExpired, useLogout } from '../Helper/tokenValidation';

export const GenerateEmail = () => {

  const [generatedEmail, setGeneratedEmails] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()
  const logoutUser = useLogout()
  const url = import.meta.env.VITE_BASE_URL

  const token = JSON.parse(localStorage.getItem('token')) || null;

  const validateANDFetchUser = useCallback(async () => {
    if (!token) {
      logoutUser("No authentication token found.");
      return;
    }

    if (isTokenExpired(token)) {
      logoutUser("Session expired. Please log in again.");
      return;
    }

    try {
      const response = await axios.get(`${url}/api/v1/user/getCurrentUser`,
        {
          headers: {Authorization: `Bearer ${token}`}
        },
        {
        withCredentials: true
        }
      )
      
    if (response && response.data) {
        dispatch(login({ 
            userData: response.data?.data,
        }))
      }
    } catch (error) {
      console.error("Error while validating token:", error);
      dispatch(logout());
      
      toast({
          title: "Authentication Error",
          description: error.response?.data?.message || "Please log in again",
          variant: "destructive"
      });
      navigate('/sign-in')
    }
  }, [token, logoutUser, url])

  useEffect(() => {
    if (token) {
      validateANDFetchUser()
    }
  }, [])
  
  return (
    <>
      <Sidebar />
    
      {/* Main Content */}
      <div className="h-screen overflow-y-hidden flex flex-col relative bg-[#0d0e12] z-0">
        {/* Background glow */}
        <div className="absolute top-20 -left-14 w-1/2 h-48 bg-[#6f34ed] opacity-30 blur-3xl"></div>
        <div className="absolute bottom-20 right-0 w-1/2 h-40 bg-[#6f34ed] opacity-30 blur-3xl"></div>
    
        <MovingDots />
        <Header />
        <main className="z-20 h-full custom-scroll flex-1 flex sm:flex-col items-center justify-center px-2">
          <EmailGenerator emailGenerated={setGeneratedEmails} />
        </main>
    
        {!generatedEmail && <Footer />}
      </div>
    </>
  
  )
}

export default GenerateEmail