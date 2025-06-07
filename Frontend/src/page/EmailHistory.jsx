import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Copy, CopyCheckIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Header } from "../components/Header"
import { useLocation, useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { TiArrowBack } from "react-icons/ti"
import axios from "axios"
const url = import.meta.env.VITE_BASE_URL

const parseEmail = (emailStr = "") => {
  const [subjectLine, ...bodyLines] = emailStr.split('\n')
  return {
    subject: subjectLine.replace(/^Subject:\s*/i, '').trim(),
    body: bodyLines.join('\n').split('Additional suggestions')[0].trim(),
  }
}

export default function EmailHistory() {
  const [newModification, setNewModification] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const { toast } = useToast()
  const location = useLocation()
  const emailHistory = location.state?.email
  const emailId = emailHistory?._id || location.state?.emailHistory?._id || null
  const original = useMemo(() => parseEmail(emailHistory?.generatedEmail || ""), [emailHistory])
  const navigate = useNavigate();

  const [iterations, setIterations] = useState([])

  useEffect(() => {
    if (emailHistory?.chatEmails?.length) {
      const mapped = emailHistory.chatEmails.map((item, index) => {
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
  }, [emailHistory])
  
  const generateNewEmailIteration = async (e) => {
    e.preventDefault();
    if (!newModification.trim()) return;
  
    try {
      setIsGenerating(true);

      const response = await axios.patch(
        `${url}/api/v1/email/update-email-history`,
        { 
          modification: newModification,
          baseprompt: emailHistory?.generatedEmail,
          prevchats: (emailHistory?.chatEmails || []).slice(-5) || [],
          emailId 
        },
        { withCredentials: true }
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
        
        toast({
          title: "Success",
          description: "New email iteration generated successfully",
          variant: "success",
        });
      }
    } catch (err) {
      console.error("Axios error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setNewModification("");
    }
  };
  
  
  const handleClipboardCopy = async ({ text, id, setCopiedId }) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }


  return (
    <div className="h-full overflow-y-hidden flex flex-col relative bg-[#0d0e12] z-0">
      <div className="absolute top-20 -left-14 w-1/2 h-48 bg-[#6f34ed] opacity-30 blur-3xl"></div>
      <div className="absolute bottom-20 right-0 w-1/2 h-40 bg-[#6f34ed] opacity-30 blur-3xl"></div>

      <Sidebar />
      <Header />

      <div className="relative z-10 container mx-auto px-2 sm:px-8 lg:px-14 py-6">
        <div className="mb-4">
          <h2 className="text-sm md:text-xl font-bold text-white mb-2">
            {emailHistory?.prompt?.charAt(0).toUpperCase() + emailHistory?.prompt?.slice(1)}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleClipboardCopy({
                            text: `Subject: ${iteration.subject}\n\n${iteration.body}`,
                            id: iteration.id,
                            setCopiedId,
                          })
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
              <Card key={emailHistory?._id} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">Original</Badge>
                      <span className="text-xs sm:text-sm text-slate-500">
                        {new Date(emailHistory?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleClipboardCopy({
                          text: `Subject: ${original.subject}\n\n${original.body}`,
                          id: 'original',
                          setCopiedId,
                        })
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
              onClick={() => navigate("/generate-email")}
              variant="outline" 
              className="hidden lg:inline-flex bg-gray-950 hover:bg-gray-950 text-gray-300 hover:text-gray-200 px-1 h-6 text-xs mb-4"
            >
              <TiArrowBack className='h-2 w-2 sm:w-5 sm:h-5' />
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
                      className="min-h-[15px] lg:min-h-[130px] resize-none sm:placeholder:text-base border border-gray-400 rounded-xl placeholder:text-sm placeholder:font-medium placeholder:text-gray-500 focus:outline-none custom-scroll"
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-1 text-gray-200 rounded-lg ${!newModification.trim() ? 'bg-[#2e137a] text-gray-300' : 'bg-[#3b1cab] text-gray-50 cursor-pointer'} text-sm sm:text-lg font-normal mt-2 mb-6 sm:mb-0`}
                  >
                    {isGenerating ? (
                      <>
                        {/* <EmailUpdateLoader /> */}
                        Generating.....
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
      </div>
    </div>
  )
}