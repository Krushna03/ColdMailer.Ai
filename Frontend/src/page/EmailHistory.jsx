import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Copy, CopyCheckIcon, MailOpen, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Header } from "../components/Header"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import Sidebar from "../components/Sidebar"
import { TiArrowBack } from "react-icons/ti"
import axios from "axios"
import EmailUpdateLoader from "../loader/loader"
import { isTokenExpired, useLogout } from "../Helper/tokenValidation"
import { useCopyToClipboard, parseEmail, getToken, capitalizeFirstLetter, openGmailCompose } from "../utils"
import { useSidebarContext } from "../context/SidebarContext"

const url = import.meta.env.VITE_BASE_URL

export default function EmailHistory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const token = getToken()
  const logoutUser = useLogout()
  const { updateSidebar, setUpdateSidebar } = useSidebarContext()
  
  const emailHistoryFromState = location.state?.email

  const [emailDetails, setEmailDetails] = useState(null)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [newModification, setNewModification] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  
  const handleClipboardCopy = useCopyToClipboard(setCopiedId)
  const user = useSelector((state) => state.auth.userData)
  const userEmail = user?.userData?.email || ""

  const handleGmailCompose = (subject, body) => {
    openGmailCompose({ to: userEmail, subject, body, userEmail })
  }

  // Fetch email details if not present in location state (e.g. on page refresh)
  useEffect(() => {
    if (emailHistoryFromState && emailHistoryFromState._id === id) {
      setEmailDetails(emailHistoryFromState);
      return;
    }

    const fetchEmailDetails = async () => {
      if (!id) return;
      if (!token) {
        logoutUser("No authentication token found.");
        return;
      }
      if (isTokenExpired(token)) {
        logoutUser("Session expired. Please log in again.");
        return;
      }

      setFetchLoading(true);
      try {
        const response = await axios.get(`${url}/api/v1/email/${id}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setEmailDetails(response.data.email);
        }
      } catch (err) {
        console.error("Failed to fetch email details:", err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to load email details.",
          variant: "destructive"
        });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchEmailDetails();
  }, [id, emailHistoryFromState, token, logoutUser, toast]);

  const original = useMemo(() => parseEmail(emailDetails?.generatedEmail || ""), [emailDetails])

  const [iterations, setIterations] = useState([])

  useEffect(() => {
    if (emailDetails?.chatEmails?.length) {
      const mapped = emailDetails.chatEmails.map((item, index) => {
        const { subject, body } = parseEmail(item.generatedEmail)
        return {
          id: item?._id,
          version: index + 2,
          subject,
          body,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          modifications: item.prompt,
        }
      })
      const sortedMapped = mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setIterations(sortedMapped)
    } else {
      setIterations([])
    }
  }, [emailDetails])
  
  const generateNewEmailIteration = async (e) => {
    e.preventDefault();
    if (isGenerating) return;
    if (!newModification.trim()) return;
  
    if (!token) {
      logoutUser("No authentication token found.");
      return;
    }

    if (isTokenExpired(token)) {
      logoutUser("Session expired. Please log in again.");
      return;
    }

    try {
      setIsGenerating(true);

      const response = await axios.patch(
        `${url}/api/v1/email/update-email-history`,
        { 
          modification: newModification,
          emailId: id 
        },
        { 
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const generatedEmail = parseEmail(response.data?.updatedEmail || "");
  
      if (generatedEmail) {
        const newIteration = {
          id: response.data._id,
          version: iterations.length + 2,
          subject: generatedEmail.subject,
          body: generatedEmail.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          modifications: newModification,
        };
        
        setIterations((prev) => [newIteration, ...prev]);
        
        setEmailDetails((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            chatEmails: [
              ...(prev.chatEmails || []),
              {
                prompt: newModification,
                generatedEmail: response.data.updatedEmail,
                createdAt: new Date().toISOString()
              }
            ]
          };
        });

        setUpdateSidebar(!updateSidebar);
        
        toast({
          title: "Success",
          description: "New email iteration generated successfully",
          variant: "success",
        });
      }
    } catch (err) {
      console.error("Axios error:", err);
      if (err.response?.status === 401) {
        logoutUser("Session expired. Please log in again.");
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
      setIsGenerating(false);
      setNewModification("");
    }
  };
  
  return (
    <div className="h-full min-h-screen overflow-y-hidden flex flex-col relative bg-[#0d0e12] z-0">
      <div className="absolute top-20 -left-14 w-1/2 h-48 bg-[#6f34ed] opacity-30 blur-3xl"></div>
      <div className="absolute bottom-20 right-0 w-1/2 h-40 bg-[#6f34ed] opacity-30 blur-3xl"></div>

      <Sidebar />
      <Header />

      <div className="relative z-10 container mx-auto px-2 sm:px-8 lg:px-14 py-6 flex-1 overflow-y-auto custom-scroll">
        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-260px)]">
            <Loader2 className="h-12 w-12 animate-spin text-[#6f34ed] mb-4" />
            <p className="text-gray-200 text-lg font-medium">Loading history...</p>
          </div>
        ) : !emailDetails ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-260px)]">
            <p className="text-red-400 text-lg font-medium">History not found or access denied.</p>
            <Button onClick={() => navigate("/generate-email")} className="mt-4 bg-[#6f34ed] hover:bg-[#7c3ffc]">
              Go to Generator
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-3 max-w-4xl mx-left">
              <h2 className="text-sm md:text-lg font-semibold text-white mb-2">
                {capitalizeFirstLetter(emailDetails?.prompt || '')}
              </h2>
            </div>

            <div className="w-full lg:flex">
              <div className="flex flex-col lg:w-[64%] lg:mr-10 gap-8 z-0">
                <div className="lg:col-span-2 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-300px)] lg:max-h-[calc(100vh-10rem)] pb-10 custom-scroll">
                  {/* Render iterations first (latest at top) */}
                  {iterations?.map((iteration) => (
                    <Card key={iteration?.id} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Latest
                            </Badge>
                            <span className="text-sm text-slate-500">
                              {new Date(iteration?.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGmailCompose(iteration.subject, iteration.body)}
                              className="gap-2 text-xs sm:text-sm"
                            >
                              Send to Gmail <MailOpen className="mt-1 h-2 w-2 sm:w-4 sm:h-4 p-0" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleClipboardCopy(
                                  `Subject: ${iteration.subject}\n\n${iteration.body}`,
                                  iteration.id
                                )
                              }
                              className="gap-2 text-xs sm:text-sm"
                            >
                              {copiedId === iteration.id ? (
                                <>
                                  Copied <CopyCheckIcon className="mt-1 h-2 w-2 sm:w-4 sm:h-4 text-black" />
                                </>
                              ) : (
                                <>
                                  Copy <Copy className="mt-1 h-2 w-2 sm:w-4 sm:h-4 p-0" />
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        {iteration.modifications && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <p className="text-sm text-blue-700">
                              <strong>Modifications:</strong> {iteration.modifications}
                            </p>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold text-slate-700 mb-2 ml-1">Subject:</h4>
                          <p className="text-xs sm:text-base text-slate-950 font-medium bg-slate-50 p-3 rounded-lg">{iteration.subject}</p>
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-semibold text-slate-700 mb-2 ml-1">Body:</h4>
                          <div className="text-slate-950 font-medium bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-xs sm:text-sm">
                            {iteration.body}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Original email at the bottom */}
                  <Card key={emailDetails?._id} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">Original</Badge>
                          <span className="text-xs sm:text-sm text-slate-500">
                            {new Date(emailDetails?.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGmailCompose(original.subject, original.body)}
                            className="gap-2 text-xs sm:text-sm"
                          >
                            Send to Gmail <MailOpen className="mt-1 h-2 w-2 sm:w-4 sm:h-4 p-0" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleClipboardCopy(
                                `Subject: ${original.subject}\n\n${original.body}`,
                                'original'
                              )
                            }
                            className="gap-2 text-xs sm:text-sm"
                          >
                            {copiedId === 'original' ? (
                              <>
                                Copied <CopyCheckIcon className="mt-1 h-2 w-2 sm:w-4 sm:h-4 text-black" />
                              </>
                            ) : (
                              <>
                                Copy <Copy className="mt-1 h-1 w-1 sm:w-4 sm:h-4 p-0" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-slate-700 mb-2 ml-1">Subject:</h4>
                        <p className="text-xs sm:text-base text-slate-950 font-medium bg-slate-50 p-3 rounded-lg">{original.subject}</p>
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-slate-700 mb-2 ml-1">Body:</h4>
                        <div className="text-slate-950 font-medium bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-xs sm:text-sm">
                          {original.body}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="lg:w-[34%] sticky bottom-2 border-t-8 sm:border-none border-gray-900">
                <Button 
                  onClick={() => navigate(`/generate-email`)}
                  variant="outline" 
                  className="hidden lg:inline-flex bg-[#2f2f37bc] hover:bg-[#3a3a44] text-gray-300 hover:text-gray-200 px-3 h-8 text-sm mb-4 gap-1"
                >
                  <TiArrowBack className='h-5 w-5' />
                  Back to Input
                </Button>

                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="space-y-4">
                    <form onSubmit={generateNewEmailIteration}>
                      <div className="pt-2 sm:pt-4">
                        <Textarea
                          placeholder="Generate more cold mail..."
                          value={newModification}
                          onChange={(e) => setNewModification(e.target.value)}
                          disabled={isGenerating}
                          className="min-h-[15px] lg:min-h-[130px] resize-none sm:placeholder:text-base border border-gray-400 rounded-xl placeholder:text-sm placeholder:font-medium placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-none custom-scroll text-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!newModification.trim() || isGenerating}
                        className={`w-full py-2 text-gray-200 rounded-lg ${(!newModification.trim() || isGenerating) ? 'bg-[#2e137a] text-gray-300 cursor-not-allowed' : 'bg-[#3b1cab] text-gray-50 cursor-pointer'} flex justify-center items-center gap-1 text-sm sm:text-lg font-normal mt-3 mb-6 sm:mb-0`}
                      >
                        {isGenerating ? (
                          <>
                            Generating...
                            <EmailUpdateLoader />
                          </>
                        ) : (
                          <>
                            Generate Email
                          </>
                        )}
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}