import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Header } from "../components/Header"
import Sidebar from "../components/Sidebar"
import { EmailOutput } from "../components/email-output"
import { Button } from "@/components/ui/button"
import { Loader2, History } from "lucide-react"
import { getToken, api } from "../utils"
import { useSidebarContext } from "../context/SidebarContext"
import { ensureAuthenticated, useLogout } from "../Helper/tokenValidation"
import { useErrorToast } from "../hooks/useErrorToast"

export default function EmailOutputPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const token = getToken()
  const logoutUser = useLogout()
  const showErrorToast = useErrorToast()
  const { updateSidebar, setUpdateSidebar } = useSidebarContext()

  const emailHistoryFromState = location.state?.email

  const [emailHistory, setEmailHistory] = useState(null)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newModification, setNewModification] = useState("")
  const [error, setError] = useState(null)

  // Synchronize state when URL param or router state changes
  useEffect(() => {
    if (emailHistoryFromState && emailHistoryFromState._id === id) {
      setEmailHistory(emailHistoryFromState);
      setError(null);
      return;
    }

    const fetchEmailDetails = async () => {
      if (!id) return;
      if (!ensureAuthenticated(token, logoutUser)) return;

      setFetchLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/v1/email/${id}`);
        if (response.data.success) {
          setEmailHistory(response.data.email);
        }
      } catch (err) {
        console.error("Failed to fetch email details:", err);
        setError("Failed to load email details. Please try again.");
        showErrorToast(err, { title: "Error", fallback: "Failed to load email details." });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchEmailDetails();
  }, [id, emailHistoryFromState, token, logoutUser, toast]);

  const latestGeneratedEmail = useMemo(() => {
    if (emailHistory?.chatEmails?.length) {
      return emailHistory.chatEmails[emailHistory.chatEmails.length - 1].generatedEmail;
    }
    return emailHistory?.generatedEmail || "";
  }, [emailHistory]);

  const generateNewEmailIteration = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isGenerating) return;
    if (!newModification.trim()) return;

    if (!ensureAuthenticated(token, logoutUser)) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await api.patch(
        `/api/v1/email/update-email-history`,
        { 
          modification: newModification,
          emailId: id 
        }
      );

      if (response.data.success && response.data.updatedEmail) {
        setEmailHistory((prev) => ({
          ...prev,
          chatEmails: [
            ...(prev.chatEmails || []),
            {
              prompt: newModification,
              generatedEmail: response.data.updatedEmail,
              createdAt: new Date().toISOString()
            }
          ]
        }));
        
        setNewModification("");
        setUpdateSidebar(!updateSidebar);
        
        toast({
          title: "Success",
          description: "New email iteration generated successfully",
          variant: "success",
        });
      } else {
        throw new Error(response.data.error || "Failed to update email");
      }
    } catch (err) {
      console.error("Iteration error:", err);
      if (err.response?.status === 401) {
        logoutUser("Session expired. Please log in again.");
        return;
      }

      setError(showErrorToast(err, { title: "Error" }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen overflow-y-hidden flex flex-col relative bg-surface-900 z-0">
      <div className="absolute top-20 -left-14 w-1/2 h-48 bg-brand opacity-30 blur-3xl pointer-events-none transform-gpu will-change-transform"></div>
      <div className="absolute bottom-20 right-0 w-1/2 h-40 bg-brand opacity-30 blur-3xl pointer-events-none transform-gpu will-change-transform"></div>

      <Sidebar />
      <Header />

      <main className="relative z-20 h-full custom-scroll flex-1 px-4 py-6 md:px-8 lg:px-14 overflow-y-auto transform-gpu [contain:paint]">
        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-260px)]">
            <Loader2 className="h-12 w-12 animate-spin text-brand mb-4" />
            <p className="text-gray-200 text-lg font-medium">Loading email details...</p>
          </div>
        ) : !emailHistory ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-260px)]">
            {error ? (
              <p className="text-red-400 text-lg font-medium">{error}</p>
            ) : (
              <p className="text-gray-300 text-lg font-medium">No email history loaded.</p>
            )}
            <Button onClick={() => navigate("/generate-email")} className="mt-4 bg-brand hover:bg-brand-400">
              Go to Generator
            </Button>
          </div>
        ) : (
          <div className="w-full h-full pb-8">
            <EmailOutput
              prompt={emailHistory?.prompt || ""}
              generatedEmail={latestGeneratedEmail}
              bottomPrompt={newModification}
              setBottomPrompt={setNewModification}
              onUpdate={generateNewEmailIteration}
              loading={isGenerating}
              updating={isGenerating}
              error={error}
              onBack={() => navigate("/generate-email")}
            />
          </div>
        )}
      </main>
    </div>
  )
}
