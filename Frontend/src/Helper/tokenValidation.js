import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../context/authSlice";
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';


export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useCallback((message = "Session expired. Please log in again.") => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/sign-in');
    toast({
      title: "Authentication Required",
      description: message,
      variant: "destructive"
    });
  }, [dispatch, navigate, toast]);
};