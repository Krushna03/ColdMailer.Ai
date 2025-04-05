import React from 'react'
import { useLocation, Navigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const Protected = ({ children }) => {

  const location = useLocation()
  const { toast } = useToast()

  const getCurrentUser = () => {
    const user = localStorage.getItem('token')
    return user
  };

  const user = getCurrentUser();

  if (!user) {
    return (
        <Navigate to="/sign-in" state={{ from: location }} replace />
      ) 
  }

  return children;
}

export default Protected