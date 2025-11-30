import { useCallback, useEffect, useState } from 'react';
import { EmailInput } from './email-input';
import { EmailOutput } from './email-output';
import { useToast } from "../hooks/use-toast";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useSidebarContext } from '../context/SidebarContext';
import { isTokenExpired, useLogout } from '../Helper/tokenValidation';
import { useNavigate } from 'react-router-dom';

const url = import.meta.env.VITE_BASE_URL

export function EmailGenerator({ emailGenerated }) {
    const [prompt, setPrompt] = useState("");
    const [generatedEmail, setGeneratedEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [bottomPrompt, setBottomPrompt] = useState("");
    const [showOutput, setShowOutput] = useState(false);
    const [emailId, setEmailId] = useState("")
    const [planUsage, setPlanUsage] = useState(null);
    const [usageLoading, setUsageLoading] = useState(false);
    const { toast } = useToast();
    const { updateSidebar, setUpdateSidebar } = useSidebarContext()
    const token = JSON.parse(localStorage.getItem('token')) || null;
    const logoutUser = useLogout();
    const user = useSelector(state => state.auth.userData)
    const userId = user?.userData?._id
    const navigate = useNavigate();

    const fetchPlanUsage = useCallback(async () => {
      if (!token) return;

      if (isTokenExpired(token)) {
        logoutUser("Session expired. Please log in again.");
        return;
      }

      setUsageLoading(true);
      try {
        const response = await axios.get(`${url}/api/v1/email/usage`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setPlanUsage(response.data.data);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          logoutUser("Session expired. Please log in again.");
        } else {
          console.error('Failed to fetch plan usage', err);
        }
      } finally {
        setUsageLoading(false);
      }
    }, [token, logoutUser]);

    useEffect(() => {
      fetchPlanUsage();
    }, []);

    const generateEmail = async (e) => {
      e.preventDefault();
      setShowOutput(true); 
      setLoading(true);
      emailGenerated(true);

      if (!token) {
        logoutUser("No authentication token found.");
        setLoading(false);
        return;
      }
  
      if (isTokenExpired(token)) {
        logoutUser("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(`${url}/api/v1/email/generate-email`, { prompt, userId }, 
          { 
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setGeneratedEmail(response.data.fullEmail);
          setEmailId(response.data.emailId)
          setUpdateSidebar(!updateSidebar)
          if (response.data.usage) {
            setPlanUsage(response.data.usage);
          } else {
            fetchPlanUsage();
          }
      } else {
          throw new Error(response.data.error || 'Failed to generate email');
        }
      } catch (err) {
        if (err.response?.status === 401) {
          logoutUser("Session expired. Please log in again.");
          setLoading(false);
          return;
        }

        if (err.response?.status === 403) {
          fetchPlanUsage();
        }

        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          (err instanceof Error ? err.message : "Something went wrong");

        toast({
          title: "Error Occurred !!",
          description: backendMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };


    const updateEmail = async () => {
      if (!bottomPrompt) return;
      setLoading(true);

      if (!token) {
        logoutUser("No authentication token found.");
        setLoading(false);
        return;
      }

      if (isTokenExpired(token)) {
        logoutUser("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(`${url}/api/v1/email/update-email`, {
          baseEmail: generatedEmail,
          modifications: bottomPrompt,
          emailId
        }, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setGeneratedEmail(response.data.updatedEmail);
        } else {
          throw new Error(response.data.error || 'Failed to update email');
        }
      } catch (err) {
        if (err.response?.status === 401) {
          logoutUser("Session expired. Please log in again.");
          setLoading(false);
          return;
        }

        if (err.response?.status === 403) {
          fetchPlanUsage();
        }

        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          (err instanceof Error ? err.message : "Something went wrong");

        toast({
          title: "Error",
          description: backendMessage,
          variant: "destructive",
        });
      } finally {
        setBottomPrompt("");
        setLoading(false);
      }
    };


  return (
    <div className="w-full">
      <div className="w-full max-w-[1400px] mx-auto relative z-10 flex-1 px-4 py-6 sm:pb-10">
        {!showOutput && (
          <div className="w-full flex items-center justify-center min-h-[calc(100vh-260px)]">
            <EmailInput
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={generateEmail}
            />
          </div>
        )}

        {showOutput && (
          <div className="w-full h-full pb-8 z-10 overflow-y-auto custom-scroll">
            <EmailOutput
              prompt={prompt}
              generatedEmail={generatedEmail}
              bottomPrompt={bottomPrompt}
              setBottomPrompt={setBottomPrompt}
              onUpdate={updateEmail}
              loading={loading}
              onBack={() => {
                setShowOutput(false);
                setGeneratedEmail("");
                emailGenerated(false);
                setPrompt("")
              }}
              planUsage={planUsage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

