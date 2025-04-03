import { useState } from 'react';
import { Copy, CopyCheckIcon, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full">
      <div className="flex gap-8">
        <div className="w-[35%] relative">
          <Button 
            onClick={onBack}
            variant="outline" 
            className="mb-4 bg-gray-950 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Input
          </Button>
          
          <div className="mt-2 overflow-y-auto custom-scroll h-[490px]">
            <p className="bg-[#1a1a1a] shadow-xl text-base font-normal text-gray-200 py-2 p-4 rounded-xl">
              {prompt}
            </p>
            <div className="mt-3 rounded-xl text-gray-300 p-4 bg-[#1a1a1a] text-sm font-normal">
              <p>Want to refine your email further? Use the input below to specify any additional requirements or modifications you&apos;d like to make to the generated email.</p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full bg-black">
            <Textarea
              placeholder="Add any specific requirements or modifications..."
              className="bg-gray-950 w-full py-3 px-3 text-white max-h-48 text-xl border border-gray-400 rounded-xl placeholder:text-base placeholder:font-medium placeholder:text-gray-500 focus:outline-blue-800 resize-none custom-scroll"
              value={bottomPrompt}
              onChange={(e) => {
                setBottomPrompt(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />

            <button
              className="w-full py-1 text-gray-200 rounded-lg bg-blue-900 text-lg font-normal mt-2"
              onClick={onUpdate}
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
    </div>
  );
}