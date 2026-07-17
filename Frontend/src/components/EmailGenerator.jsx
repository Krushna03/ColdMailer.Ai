import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmailInput } from './EmailInput';
import { EmailOutput } from './EmailOutput';
import { useToast } from "../hooks/use-toast";
import { useSelector } from 'react-redux';
import { useSidebarContext } from '../context/SidebarContext';
import { ensureAuthenticated, useLogout } from '../helpers/tokenValidation';
import { useErrorToast } from '../hooks/useErrorToast';
import { usePlanUsage } from '../hooks/usePlanUsage';
import { getToken, api } from '../utils';

export function EmailGenerator({ emailGenerated }) {
    const [prompt, setPrompt] = useState("");
    const [generatedEmail, setGeneratedEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [bottomPrompt, setBottomPrompt] = useState("");
    const [showOutput, setShowOutput] = useState(false);
    const [emailId, setEmailId] = useState("")
    const [error, setError] = useState(null);
    const { planUsage, setPlanUsage, fetchPlanUsage } = usePlanUsage();
    const { toast } = useToast();
    const { updateSidebar, setUpdateSidebar } = useSidebarContext()
    const navigate = useNavigate();
    const token = getToken();
    const logoutUser = useLogout();
    const showErrorToast = useErrorToast();
    const user = useSelector(state => state.auth.userData)
    const userId = user?._id

    const generateEmail = async (e) => {
      e.preventDefault();
      setShowOutput(true); 
      setLoading(true);
      setError(null);
      emailGenerated(true);

      if (!ensureAuthenticated(token, logoutUser)) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.post(`/api/v1/email/generate-email`, { prompt, userId });

        if (response.data.success) {
          setGeneratedEmail(response.data.fullEmail);
          setEmailId(response.data.emailId)
          setUpdateSidebar(!updateSidebar)
          if (response.data.usage) {
            setPlanUsage(response.data.usage);
          } else {
            fetchPlanUsage();
          }
          
          toast({
            title: "Success",
            description: "Email generated successfully!",
            variant: "success",
          });

          navigate(`/email/${response.data.emailId}`, {
            state: {
              email: {
                _id: response.data.emailId,
                prompt: prompt,
                generatedEmail: response.data.fullEmail,
                chatEmails: [],
                createdAt: new Date().toISOString()
              }
            }
          });
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

        setError(showErrorToast(err));
      } finally {
        setLoading(false);
      }
    };


    const updateEmail = async () => {
      if (updating) return;
      if (!bottomPrompt) return;
      setLoading(true);
      setUpdating(true);
      setError(null);

      if (!ensureAuthenticated(token, logoutUser)) {
        setLoading(false);
        setUpdating(false);
        return;
      }

      try {
        const response = await api.post(`/api/v1/email/update-email`, {
          baseEmail: generatedEmail,
          modifications: bottomPrompt,
          emailId
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

        setError(showErrorToast(err, { title: "Error" }));
      } finally {
        setBottomPrompt("");
        setLoading(false);
        setUpdating(false);
      }
    };


  return (
    <div className="w-full">
      <div className="w-full max-w-[1400px] mx-auto relative z-10 flex-1 px-4 py-6 sm:pb-10">
        {!showOutput && (
          <div className="w-full flex items-center justify-center sm:min-h-[calc(100vh-260px)]">
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
              updating={updating}
              error={error}
              onBack={() => {
                setShowOutput(false);
                setGeneratedEmail("");
                setError(null);
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

