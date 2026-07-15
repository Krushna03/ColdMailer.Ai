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
      <div className="h-[100dvh] overflow-hidden flex flex-col relative bg-[#0d0e12] z-0">
        {/* Background glow */}
        <div className="hidden sm:block absolute top-20 -left-14 w-1/2 h-48 bg-[#6f34ed] opacity-30 blur-3xl"></div>
        <div className="hidden sm:block absolute bottom-20 right-0 w-1/2 h-40 bg-[#6f34ed] opacity-30 blur-3xl"></div>

        {/* Mobile-only glow near the bottom input */}
        <div className="sm:hidden absolute bottom-0 -left-10 w-2/3 h-44 bg-[#6f34ed] opacity-30 blur-3xl"></div>
        <div className="sm:hidden absolute bottom-0 -right-10 w-2/3 h-44 bg-[#8b5cf6] opacity-30 blur-3xl"></div>
        
        <div className="sm:hidden absolute top-0 -left-20 w-2/3 h-20 bg-[#6f34ed] opacity-25 blur-3xl"></div>
        

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