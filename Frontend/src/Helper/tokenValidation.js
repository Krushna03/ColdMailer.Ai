import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../context/authSlice";
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import axios from "axios";

export const fetchToken = () => {
  const storedToken = localStorage.getItem('token');
  let token = null
  try {
    token = storedToken ? JSON.parse(storedToken) : null
  } catch {
    token = storedToken
  }
  return token;
}

export const isTokenExpired = (token = fetchToken()) => {
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

  return useCallback(async (message = "Session expired. Please log in again.") => {
    const url = import.meta.env.VITE_BASE_URL;

    try {
      await axios.post(`${url}/api/v1/user/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Error invalidating session on logout:', error);
    }

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