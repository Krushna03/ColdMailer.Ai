import { useState } from 'react';
import { Copy, CopyCheckIcon, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { TiArrowBack } from "react-icons/ti";
import { useSelector } from 'react-redux';


export function EmailOutput({
  prompt,
  generatedEmail,
  bottomPrompt,
  setBottomPrompt,
  onUpdate,
  loading,
  onBack
}) {
  
  const [copied, setCopied] = useState(false);

  const user = useSelector(state => state.auth.userData)
  let userInitial = user?.userData?.username 
  userInitial = userInitial?.slice(0, 1)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
      <div className="flex gap-8 P-2">
        <div className="w-[35%] relative">
          <Button 
            onClick={onBack}
            variant="outline" 
            className="mb-2 bg-gray-950 hover:bg-gray-950 text-gray-300 hover:text-gray-200 px-3 h-8 text-xs"
          >
            <TiArrowBack className='w-4 h-4' />
            Back to Input
          </Button>
          
          <div className="mt-2 overflow-y-auto custom-scroll h-[490px]">
            <p className="bg-[#0d0e12] shadow-xl text-lg font-normal text-gray-100 py-2 p-4 rounded-md">
             <span className='bg-[#482b9e] px-3 py-1 mr-1 rounded-full text-lg -ml-2'>{userInitial?.toUpperCase()}</span> {prompt}
            </p>
            <div className="mt-3 rounded-md text-gray-300 p-3 bg-[#0d0e12] text-sm font-normal">
              <p>Want to refine your email further? Use the input below to specify any additional requirements or modifications.</p>
            </div>
          </div>

          <div className="absolute bottom-0 left-1 w-full">
            <Textarea
              placeholder="Add any specific requirements or modifications..."
              className="bg-[#0d0e12] w-full py-3 px-3 text-white max-h-48 text-xl border border-gray-400 rounded-xl placeholder:text-base placeholder:font-medium placeholder:text-gray-500 focus:outline-blue-800 resize-none custom-scroll"
              value={bottomPrompt}
              onChange={(e) => {
                setBottomPrompt(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />

            <button
              className={`w-full py-1 text-gray-200 rounded-lg ${!bottomPrompt ? 'bg-[#2e137a] text-gray-300' : 'bg-[#3b1cab] text-gray-50'} text-lg font-normal mt-2`}
              onClick={onUpdate}
              disabled={!bottomPrompt}
            >
              Update Email
            </button>
          </div>
        </div>

        <div className="w-[65%] flex flex-col">
          <div className="flex justify-end">
            {!loading && (
              <Button onClick={copyToClipboard} className="p-0 bg-none">
                {copied ? (
                  <>
                    Copied <CopyCheckIcon className="ml-2 w-4 h-4 text-gray-200" />
                  </>
                ) : (
                  <>
                    Copy <Copy className="ml-2 w-4 p-0" />
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="bg-gray-300 p-4 rounded-lg w-full h-[610px] overflow-y-auto custom-scroll relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-900" />
                  <p className="text-blue-900 font-medium">Generating your email...</p>
                </div>
              </div>
            ) : (
              <pre className="text-black whitespace-pre-wrap">{generatedEmail}</pre>
            )}
          </div>
        </div>
      </div>
  );
}