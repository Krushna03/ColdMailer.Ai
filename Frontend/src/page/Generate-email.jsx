import React, { useEffect, useState } from 'react'
import { MovingDots } from '../components/moving-dots';
import { Header } from '../components/Header';
import { EmailGenerator } from '../components/email-generator';
import { Footer } from '../components/Footer';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login, logout } from '../context/authSlice';
import { useToast } from '../hooks/use-toast';


export const GenerateEmail = () => {

  const [generatedEmail, setGeneratedEmails] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()

  const token = localStorage.getItem('token') || null;
  
  const validateANDFetchUser = async () => {
    try {
      const response = await axios.get('/api/v1/user/getCurrentUser',
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
  } 

  useEffect(() => {
    if (token) {
      validateANDFetchUser()
    }
}, [dispatch])
  
  return (
    <div className="h-screen overflow-y-hidden flex flex-col bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(121,120,240,0.5),rgba(255,255,255,0))]">
      <MovingDots />
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
        <EmailGenerator emailGenerated={setGeneratedEmails}/>
      </main>

      {
        !generatedEmail && ( <Footer /> )
      }
    </div>
  )
}

export default GenerateEmail