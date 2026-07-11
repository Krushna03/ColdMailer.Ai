import React, { useEffect, useState, useCallback } from 'react'
import { MovingDots } from '../components/moving-dots';
import { Header } from '../components/Header';
import { EmailGenerator } from '../components/email-generator';
import { Footer } from '../components/Footer';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { login } from '../context/authSlice';
import Sidebar from '../components/Sidebar';
import { ensureAuthenticated, useLogout } from '../Helper/tokenValidation';
import { getToken, getErrorMessage } from '../utils';

export const GenerateEmail = () => {

  const [generatedEmail, setGeneratedEmails] = useState(false);
  const dispatch = useDispatch()
  const logoutUser = useLogout()
  const url = import.meta.env.VITE_BASE_URL

  const token = getToken();

  const validateANDFetchUser = useCallback(async () => {
    if (!ensureAuthenticated(token, logoutUser)) return;

    try {
      const response = await axios.get(`${url}/api/v1/user/getCurrentUser`,
        {
          headers: {Authorization: `Bearer ${token}`},
          withCredentials: true
        }
      )
      
    if (response && response.data) {
        dispatch(login(response.data?.data))
      }
    } catch (error) {
      console.error("Error while validating token:", error);
      logoutUser({
        title: "Authentication Error",
        message: getErrorMessage(error, "Please log in again"),
      });
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