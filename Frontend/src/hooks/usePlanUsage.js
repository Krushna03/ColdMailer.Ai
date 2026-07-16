import { useCallback, useEffect, useState } from "react";
import { api, getToken } from "../utils";
import { isTokenExpired, useLogout } from "../Helper/tokenValidation";

export function usePlanUsage() {
  const [planUsage, setPlanUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const logoutUser = useLogout();
  const token = getToken();

  const fetchPlanUsage = useCallback(async () => {
    if (!token) {
      setPlanUsage(null);
      return;
    }

    if (isTokenExpired(token)) {
      logoutUser("Session expired. Please log in again.");
      return;
    }

    setUsageLoading(true);
    try {
      const response = await api.get(`/api/v1/email/usage`);
      if (response.data.success) {
        setPlanUsage(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logoutUser("Session expired. Please log in again.");
      } else {
        console.error("Failed to fetch plan usage", error);
      }
    } finally {
      setUsageLoading(false);
    }
  }, [token, logoutUser]);

  useEffect(() => {
    fetchPlanUsage();
  }, [fetchPlanUsage]);

  return { planUsage, setPlanUsage, usageLoading, fetchPlanUsage };
}
