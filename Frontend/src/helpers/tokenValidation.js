import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../context/authSlice";
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from '../hooks/use-toast';
import { api } from "../utils";

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

export const ensureAuthenticated = (
  token,
  logoutUser,
  {
    missingMessage = "No authentication token found.",
    expiredMessage = "Session expired. Please log in again.",
  } = {}
) => {
  if (!token) {
    logoutUser(missingMessage);
    return false;
  }
  if (isTokenExpired(token)) {
    logoutUser(expiredMessage);
    return false;
  }
  return true;
};

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useCallback(async (options = {}) => {
    const {
      message = "Session expired. Please log in again.",
      title = "Authentication Required",
      variant = "destructive",
      redirectTo = "/sign-in",
      showToast = true,
    } = typeof options === "string" ? { message: options } : options;

    try {
      await api.post(`/api/v1/user/logout`, {});
    } catch (error) {
      console.error('Error invalidating session on logout:', error);
    }

    localStorage.removeItem('token');
    dispatch(logout());
    navigate(redirectTo);
    queryClient.clear();

    if (showToast) {
      toast({ title, description: message, variant });
    }
  }, [dispatch, navigate, toast, queryClient]);
};