import React, { useEffect, useState, useCallback } from 'react'
import { MovingDots } from '../components/moving-dots';
import { Header } from '../components/Header';
import { EmailGenerator } from '../components/email-generator';
import { Footer } from '../components/Footer';
import { useDispatch } from 'react-redux';
import { login } from '../context/authSlice';
import Sidebar from '../components/Sidebar';
import { ensureAuthenticated, useLogout } from '../Helper/tokenValidation';
import { getToken, getErrorMessage, api } from '../utils';

export const GenerateEmail = () => {

  const [generatedEmail, setGeneratedEmails] = useState(false);
  const dispatch = useDispatch()
  const logoutUser = useLogout()

  const token = getToken();

  const validateANDFetchUser = useCallback(async () => {
    if (!ensureAuthenticated(token, logoutUser)) return;

    try {
      const response = await api.get(`/api/v1/user/getCurrentUser`)

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
  }, [token, logoutUser])

  useEffect(() => {
    if (token) {
      validateANDFetchUser()
    }
  }, [])
  
  return (
    <>
      <Sidebar />
    
      {/* Main Content */}
      <div className="h-[100dvh] overflow-hidden flex flex-col relative bg-surface-900 z-0">
        {/* Background glow — balanced, centered around the hero + input */}
        {/* <div className="hidden sm:block absolute -top-10 left-1/2 -translate-x-1/2 w-[55%] h-56 bg-brand opacity-25 blur-3xl rounded-full"></div> */}
        {/* <div className="hidden sm:block absolute top-1/3 -left-24 w-1/3 h-64 bg-brand-deep opacity-20 blur-3xl rounded-full"></div> */}
        {/* <div className="hidden sm:block absolute top-1/3 -right-24 w-1/3 h-64 bg-brand-deep opacity-20 blur-3xl rounded-full"></div> */}
        <div className="hidden sm:block absolute bottom-0 left-1/2 -translate-x-1/2 w-[65%] h-44 bg-brand opacity-20 blur-3xl rounded-full"></div>

        {/* Mobile-only glow near the bottom input */}
        <div className="sm:hidden absolute bottom-0 -left-10 w-2/3 h-44 bg-brand opacity-30 blur-3xl"></div>
        <div className="sm:hidden absolute bottom-0 -right-10 w-2/3 h-44 bg-brand-200 opacity-30 blur-3xl"></div>
        
        <div className="sm:hidden absolute top-0 -left-20 w-2/3 h-20 bg-brand opacity-25 blur-3xl"></div>
        
        <div className='hidden sm:block'>
          <MovingDots />
        </div>

        <Header />
        
        <main className="z-20 h-full custom-scroll flex-1 flex sm:flex-col items-center justify-center px-2">
          <EmailGenerator emailGenerated={setGeneratedEmails} />
        </main>
    
        {!generatedEmail &&
          <div className='hidden sm:block'>
            <Footer />
          </div>
         }
      </div>
    </>
  
  )
}

export default GenerateEmail