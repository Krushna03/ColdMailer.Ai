import { useState } from 'react';
import { Copy, CopyCheckIcon, Loader2, MailOpen } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { TiArrowBack } from "react-icons/ti";
import { useSelector } from 'react-redux';
import { formatBulletPoints, processGeneratedEmail } from '../lib/processGeneratedEmail';
import { useCopyToClipboard, getUserInitial, parseEmail, openGmailCompose } from '../utils';

export function EmailOutput({
  prompt,
  generatedEmail,
  bottomPrompt,
  setBottomPrompt,
  onUpdate,
  loading,
  onBack,
  planUsage,
  error
}) {

  const [copied, setCopied] = useState(false);
  const [readMorePrompt, setReadMorePrompt] = useState(false);
  const user = useSelector(state => state.auth.userData);
  const userInitial = getUserInitial(user?.userData?.username);
  
  const handleCopyToClipboard = useCopyToClipboard(setCopied);
  
  const { email, content } = processGeneratedEmail(generatedEmail);

  const formatAdditionalContent = (content) => {
    return formatBulletPoints(content);
  };

  const { subject, body } = parseEmail(email);

  const handleGmailCompose = () => {
    openGmailCompose({
      to: user?.userData?.email || "",
      subject,
      body,
      userEmail: user?.userData?.email,
    });
  };  

  return (
      <div className="flex flex-col sm:flex sm:flex-row gap-7 P-2 mt-6 sm:mt-1">

        <div className="sm:w-[63%] flex flex-col mt-9 sm:mt-0">
          
          <div className="sm:hidden mb-3 sm:mb-0 overflow-y-auto custom-scroll max-h-[350px] sm:h-[490px]">
            <p className="bg-[#0d0e12] border border-gray-400 p-2 text-sm sm:text-lg font-normal text-gray-100 py-2 rounded-xl flex items-start gap-3">
              <span className="bg-[#482b9e] px-2 py-1 sm:px-3 sm:py-1 rounded-full text-sm sm:text-lg">
                {userInitial}
              </span>
              <span className="flex-1">{prompt}</span>
            </p>
          </div>
          
          <div className="flex justify-between items-center sm:justify-start">
            <Button onClick={() => handleCopyToClipboard(email)} className="px-2 bg-none text-xs sm:text-base" disabled={!!error || !email}>
              {copied ? (
                <>
                  Copied <CopyCheckIcon className="mt-1 h-2 w-2 sm:w-4 sm:h-4 text-gray-200" />
                </>
              ) : (
                <>
                  Copy <Copy className="mt-1 h-2 w-2 sm:w-4 sm:h-4 p-0" />
                </>
              )}
            </Button>
            
            <Button onClick={handleGmailCompose} className="px-2 bg-none text-xs sm:text-base" disabled={!!error || !email}>
              Send over Gmail <MailOpen className="mt-1 h-2 w-2 sm:w-4 sm:h-4 p-0" />
            </Button>

            <Button 
              onClick={onBack}
              variant="outline" 
              className="sm:hidden bg-gray-950 hover:bg-gray-950 text-gray-300 hover:text-gray-200 px-1 h-5 text-xs"
            >
              <TiArrowBack className='h-2 w-2 sm:w-4 sm:h-4' />
              Back to Input
            </Button>
          </div>

          <div className="bg-gray-300 p-4 rounded-lg w-full min-h-[300px] sm:h-[610px] overflow-y-auto custom-scroll relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-900" />
                  <p className="text-blue-900 font-medium">Generating your email...</p>
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-6 text-center rounded-lg">
                <div className="max-w-md">
                  <h3 className="text-[#482b9e] font-bold text-lg mb-1">Email Generation Failed</h3>
                  <p className="text-[#482b9e] text-sm whitespace-pre-wrap">{error}</p>
                </div>
              </div>
            ) : (
              <pre className="text-black whitespace-pre-wrap text-xs sm:text-base">{email}</pre>
            )}
          </div>

        </div>

        <div className="w-full sm:w-[37%] relative">
          <Button 
            onClick={onBack}
            variant="outline" 
            className="hidden sm:flex mt-10 mb-2 bg-gray-950 hover:bg-gray-950 text-gray-300 hover:text-gray-200 px-2 h-6 text-xs font-bold"
          >
            <TiArrowBack className='w-4 h-4' />
            Back to Input
          </Button>
          
          <div className={`hidden sm:flex flex-col ${content ? "h-[435px]" : "h-[435px]"} border border-gray-400 p-2 pb-0 rounded-xl ${readMorePrompt ? "overflow-y-auto custom-scroll" : "overflow-hidden"}`}>
            <p className="bg-[#252628] p-2 text-sm sm:text-lg font-normal text-gray-100 rounded-xl flex items-start gap-2 shadow-xl">
              <span className="bg-[#482b9e] px-3 py-1 rounded-full text-sm sm:text-lg">
                {userInitial?.toUpperCase()}
              </span>
              <span className="flex-1 sm:text-[16px]">
                {!readMorePrompt ? `${prompt.slice(0, 170)}...` : prompt}
                {prompt?.length > 170 && (readMorePrompt ? (
                  <button onClick={() => setReadMorePrompt(false)} className='text-blue-500 text-xs sm:text-base'>
                    Read Less
                  </button>
                ) : (
                  <button onClick={() => setReadMorePrompt(true)} className='text-blue-500 text-xs sm:text-base'>
                    Read More
                  </button>
                ))}
              </span>
            </p>

            <div className={`hidden sm:block mt-3 bg-[#1c1f23] shadow-xl p-2 rounded-xl ${readMorePrompt ? "h-auto" : "flex-1 min-h-0 overflow-y-auto custom-scroll"}`}>
              <p className='text-white whitespace-pre-wrap text-xs sm:text-[14.5px] tracking-wide leading-[1.7] z-10'>
                {
                  error 
                    ? "Could not generate additional suggestions due to the error." 
                    : (content?.trim()?.length > 0 ? formatAdditionalContent(content) : "No additional content needed, the email is already generated. Or your request is not clear!")
                }
              </p>
            </div>
          </div>

          <div className="absolute sm:bottom-0 w-full">
            <Textarea
              placeholder="Add any specific requirements or modifications..."
              className="bg-[#14151b] w-full py-2 px-3 text-white min-h-16 placeholder:text-sm md:text-base border border-gray-400 rounded-xl sm:placeholder:text-base placeholder:font-medium placeholder:text-gray-500 focus:outline-blue-800 resize-none custom-scroll"
              value={bottomPrompt}
              onChange={(e) => {
                setBottomPrompt(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              disabled={!!error}
            />

            <button
              className={`w-full py-1 text-gray-200 rounded-lg ${(!bottomPrompt.trim() || error) ? 'bg-[#2e137a] text-gray-300' : 'bg-[#3b1cab] text-gray-50'} text-sm sm:text-lg font-normal mt-3 mb-6 sm:mb-0`}
              onClick={onUpdate}
              disabled={!bottomPrompt.trim() || !!error}
            >
              Update Email
            </button>
            {planUsage && (
              <p className="text-center text-xs text-gray-400 mb-6 sm:mb-0 sm:mt-1">
                {typeof planUsage?.capabilities?.maxRegenerationsPerEmail === 'number' &&
                planUsage.capabilities.maxRegenerationsPerEmail >= 0
                  ? `You can apply up to ${planUsage.capabilities.maxRegenerationsPerEmail} updates per email on the ${planUsage.plan?.name || 'current'}.`
                  : 'Unlimited updates with your current plan.'}
              </p>
            )}
          </div>
        </div>
      </div>
  );
}


