import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Header } from "../components/Header"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import Sidebar from "../components/Sidebar"
import { TiArrowBack } from "react-icons/ti"
import { ensureAuthenticated, useLogout } from "../helpers/tokenValidation"
import { useErrorToast } from "../hooks/useErrorToast"
import { useCopyToClipboard, parseEmail, getToken, capitalizeFirstLetter, openGmailCompose, getUserInitial } from "../utils"
import { useKeyboardOffset } from "../hooks/useKeyboardOffset"
import { EmailHistoryCard } from "../components/EmailHistoryCard"
import { useEmail, useUpdateEmailIteration } from "../hooks/useEmail"

export default function EmailHistory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const token = getToken()
  const logoutUser = useLogout()
  const showErrorToast = useErrorToast()

  const emailHistoryFromState = location.state?.email
  const initialData = emailHistoryFromState?._id === id ? emailHistoryFromState : undefined

  const { data: emailDetails, isLoading: fetchLoading } = useEmail(id, { initialData })
  const { mutate: iterateEmail, isPending: isGenerating } = useUpdateEmailIteration()

  const [newModification, setNewModification] = useState("")
  const [copiedId, setCopiedId] = useState(null)
  const keyboardOffset = useKeyboardOffset()
  const mobileTextareaRef = useRef(null)

  const handleClipboardCopy = useCopyToClipboard(setCopiedId)
  const isGenerateDisabled = !newModification.trim() || isGenerating

  // Auto-resize the sticky mobile textarea
  useLayoutEffect(() => {
    const el = mobileTextareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 110)}px`
  }, [newModification])

  const user = useSelector((state) => state.auth.userData)
  const userEmail = user?.email || ""
  const userInitial = getUserInitial(user?.username)

  const handleGmailCompose = useCallback((subject, body) => {
    openGmailCompose({ to: userEmail, subject, body, userEmail })
  }, [userEmail])

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
  
  const generateNewEmailIteration = (e) => {
    e.preventDefault();
    if (isGenerating) return;
    if (!newModification.trim()) return;

    if (!ensureAuthenticated(token, logoutUser)) return;

    iterateEmail(
      { emailId: id, modification: newModification },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "New email iteration generated successfully",
            variant: "success",
          });
        },
        onError: (err) => {
          console.error("Axios error:", err);
          if (err.response?.status === 401) {
            logoutUser("Session expired. Please log in again.");
          }
          showErrorToast(err, { title: "Error" });
        },
        onSettled: () => {
          setNewModification("");
        },
      }
    );
  };
  
  return (
    <div className="h-full min-h-screen overflow-y-hidden flex flex-col relative bg-surface-900 z-0">
      <div className="absolute top-20 -left-14 w-1/2 h-48 bg-brand opacity-30 blur-3xl pointer-events-none transform-gpu will-change-transform"></div>
      <div className="absolute bottom-20 right-0 w-1/2 h-40 bg-brand opacity-30 blur-3xl pointer-events-none transform-gpu will-change-transform"></div>

      <Sidebar />
      <Header />

      <div className="relative z-10 container mx-auto px-3 sm:px-8 lg:px-14 py-6 flex-1 overflow-y-auto custom-scroll transform-gpu [contain:paint]">
        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-260px)]">
            <Loader2 className="h-12 w-12 animate-spin text-brand mb-4" />
            <p className="text-gray-200 text-lg font-medium">Loading history...</p>
          </div>
        ) : !emailDetails ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-260px)]">
            <p className="text-red-400 text-lg font-medium">History not found or access denied.</p>
            <Button onClick={() => navigate("/generate-email")} className="mt-4 bg-brand hover:bg-brand-400">
              Go to Generator
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile: prompt as a chat bubble with the user's avatar */}
            <div className="lg:hidden flex items-start gap-2.5 mb-4">
              <span className="shrink-0 h-8 w-8 flex items-center justify-center bg-brand-deep rounded-full text-sm font-semibold text-white">
                {userInitial?.toUpperCase()}
              </span>
              <div className="flex-1 bg-surface-800 border border-gray-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                <p className="text-[15px] leading-relaxed text-gray-200 break-words">
                  {capitalizeFirstLetter(emailDetails?.prompt || '')}
                </p>
              </div>
            </div>

            {/* Desktop: heading */}
            <div className="hidden lg:block mb-3 max-w-4xl">
              <h2 className="text-lg font-semibold text-white mb-2">
                {capitalizeFirstLetter(emailDetails?.prompt || '')}
              </h2>
            </div>

            <div className="w-full lg:flex">
              <div className="flex flex-col lg:w-[65%] lg:mr-6 z-0">
                {/* Email versions as dark cards (matches the generated email UI) */}
                <div className="space-y-4 lg:space-y-6 overflow-y-auto max-h-[calc(100vh-160px)] lg:max-h-[calc(100vh-10rem)] pb-14 sm:pb-4 custom-scroll">
                  {iterations?.map((iteration) => (
                    <EmailHistoryCard
                      key={iteration.id}
                      id={iteration.id}
                      badge="Latest"
                      badgeClass="bg-green-500/15 text-green-300"
                      date={iteration.createdAt}
                      subject={iteration.subject}
                      body={iteration.body}
                      modifications={iteration.modifications}
                      copiedId={copiedId}
                      onCopy={handleClipboardCopy}
                      onGmailCompose={handleGmailCompose}
                    />
                  ))}
                  <EmailHistoryCard
                    id="original"
                    badge="Original"
                    badgeClass="bg-purple-500/15 text-purple-300"
                    date={emailDetails?.createdAt}
                    subject={original.subject}
                    body={original.body}
                    copiedId={copiedId}
                    onCopy={handleClipboardCopy}
                    onGmailCompose={handleGmailCompose}
                  />
                </div>
              </div>

              {/* Desktop input panel */}
              <div className="hidden lg:block lg:w-[35%] sticky bottom-2">
                <Button 
                  onClick={() => navigate(`/generate-email`)}
                  className="inline-flex bg-none text-gray-300 hover:text-gray-200 px-3 h-8 text-sm mb-4 gap-1 hover:bg-none border border-gray-600 rounded-full"
                >
                  <TiArrowBack className='h-5 w-5' />
                  Back to Input
                </Button>

                <form onSubmit={generateNewEmailIteration}>
                  <div className="flex flex-col bg-surface-850 border border-gray-700 rounded-2xl p-2.5 shadow-lg focus-within:border-gray-500 transition-colors">
                    <textarea
                      placeholder="Generate more cold mail..."
                      value={newModification}
                      onChange={(e) => setNewModification(e.target.value)}
                      disabled={isGenerating}
                      className="w-full min-h-[110px] resize-none bg-transparent text-gray-200 text-sm px-2 pt-1.5 placeholder:text-gray-500 focus:outline-none custom-scroll disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isGenerateDisabled}
                        aria-label="Generate email"
                        className={`shrink-0 h-9 w-9 flex items-center justify-center rounded-full transition-colors active:scale-95 ${isGenerateDisabled ? 'bg-brand-800 text-gray-400 cursor-not-allowed' : 'bg-brand-700 hover:bg-brand-600 text-white cursor-pointer'}`}
                      >
                        {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Sticky mobile/tablet input (ChatGPT-style pill) */}
            <form
              onSubmit={generateNewEmailIteration}
              style={{ bottom: keyboardOffset, paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
              className="lg:hidden fixed inset-x-0 z-30 px-3 pt-3 bg-gradient-to-t from-surface-900 via-surface-900 to-transparent transition-[bottom] duration-10"
            >
              <div className="flex items-end gap-2 bg-surface-800 border border-gray-700 rounded-[26px] px-2 py-2 focus-within:border-gray-500 transition-colors">
                <textarea
                  ref={mobileTextareaRef}
                  rows={1}
                  placeholder="Generate more cold mail..."
                  className="flex-1 resize-none bg-transparent text-gray-200 text-base placeholder:text-gray-500 px-2 py-2 max-h-36 overflow-y-auto focus:outline-none custom-scroll disabled:opacity-60"
                  value={newModification}
                  onChange={(e) => setNewModification(e.target.value)}
                  disabled={isGenerating}
                />
                <button
                  type="submit"
                  disabled={isGenerateDisabled}
                  aria-label="Generate email"
                  className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-full transition-colors active:scale-95 ${isGenerateDisabled ? 'bg-brand-800 text-gray-400' : 'bg-brand-700 text-white'}`}
                >
                  {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}