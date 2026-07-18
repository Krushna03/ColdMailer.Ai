import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { login } from "../context/authSlice";
import { useLogout } from "../helpers/tokenValidation";
import { api, getToken, getErrorMessage } from "../utils";
import { queryKeys } from "./queryKeys";

// GET /api/v1/user/get-user-count — public landing-page counter.
export function useUserCount() {
  return useQuery({
    queryKey: queryKeys.userCount,
    queryFn: async () => {
      const response = await api.get(`/api/v1/user/get-user-count`);
      return response.data?.data?.totalUsers;
    },
  });
}

// GET /api/v1/user/getCurrentUser — hydrates Redux from the session token
// logging out on failure
export function useCurrentUser() {
  const dispatch = useDispatch();
  const logoutUser = useLogout();
  const token = getToken();

  const query = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const response = await api.get(`/api/v1/user/getCurrentUser`);
      return response.data?.data;
    },
    enabled: !!token,
  });

  const { data, isSuccess, isError, error } = query;

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(login(data));
    }
  }, [isSuccess, data, dispatch]);

  useEffect(() => {
    if (isError) {
      console.error("Error while validating token:", error);
      logoutUser({
        title: "Authentication Error",
        message: getErrorMessage(error, "Please log in again"),
      });
    }
  }, [isError, error, logoutUser]);

  return query;
}
