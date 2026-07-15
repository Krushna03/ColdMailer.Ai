
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const MAX_TEXTAREA_HEIGHT = 140;

export function EmailInput({ prompt, setPrompt, onSubmit }) {

  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [prompt]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleViewport = () => {
      const overlap = window.innerHeight - (vv.height + vv.offsetTop);
      setKeyboardOffset(overlap > 0 ? overlap : 0);
    };

    handleViewport();
    vv.addEventListener("resize", handleViewport);
    vv.addEventListener("scroll", handleViewport);
    return () => {
      vv.removeEventListener("resize", handleViewport);
      vv.removeEventListener("scroll", handleViewport);
    };
  }, []);

  return (
    <div className="w-full max-w-[750px] mx-auto px-0 flex flex-col">
      {/* Mobile: ChatGPT-style layout (centered text + fixed bottom input) */}
      <div className="sm:hidden flex flex-1 flex-col pb-36">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-0.5">
          <div className="inline-flex items-center gap-2 bg-[#1a1133] shadow-2xl rounded-full px-3 py-1 mb-3">
            <img src="/white-logo.png" alt="logo" className="h-7 w-7 p-1 rounded" />
            <span className="text-sm text-white">ColdMailerAI - AI Powered Email Generator</span>
          </div>
          <h1 className="text-[26px] font-bold tracking-wide mb-2 text-gray-200">
            Craft Perfect Cold Emails
          </h1>
          <p className="text-md sm:text-xl text-gray-300">
            Generate personalized, <br className="sm:hidden block" /> engaging emails with AI assistance
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          style={{ bottom: keyboardOffset, paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
          className="fixed inset-x-0 z-30 px-3 pt-2 transition-[bottom] duration-10"
        >
          <div className="flex items-end gap-2 bg-[#16161c] border border-gray-700 rounded-[26px] px-2 py-2 focus-within:border-gray-500 transition-colors">
            <textarea
              ref={textareaRef}
              rows={2}
              placeholder="Describe your email..."
              className="flex-1 resize-none bg-transparent text-gray-200 text-base placeholder:text-gray-500 px-2 py-2 max-h-40 overflow-y-auto focus:outline-none custom-scroll"
              aria-label="Describe your email"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              aria-label="Generate email"
              className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-full transition-colors active:scale-95 ${!prompt.trim() ? 'bg-[#2e137a] text-gray-400' : 'bg-[#3b1cab] text-white'}`}
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Desktop / Tablet: unchanged centered layout */}
      <div className="hidden sm:block">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1a1133] shadow-2xl rounded-full px-2 sm:px-5 py-2 mb-2 sm:mb-5">
              <img src="/white-logo.png" alt="logo" className="h-7 w-7 p-1 rounded" />
              <span className="text-sm sm:text-base text-white">ColdMailerAI - AI Powered Email Generator</span>
          </div>
          <h1 className="text-[26px] md:text-5xl font-bold tracking-wide mb-3 sm:mb-4 text-gray-200">
            Craft Perfect Cold Emails
          </h1>
          <p className="text-lg sm:text-xl text-gray-300">
            Generate personalized, <br className="sm:hidden block" /> engaging emails with AI assistance
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Textarea
            placeholder="Describe your email (e.g. 'Cold email to a potential client about our new SaaS product')"
            className="p-3 px-4 max-w-[750px] bg-[#0d0e12] min-h-24 sm:min-h-36 text-gray-200 sm:text-2xl border border-gray-400 rounded-xl placeholder:text-sm sm:placeholder:text-base placeholder:font-medium placeholder:text-gray-500 focus:outline-blue-800 custom-scroll"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            className={`w-full ${!prompt.trim() ? 'bg-[#2e137a] text-gray-300' : 'bg-[#3b1cab] text-gray-50'} sm:text-lg font-medium py-2 rounded-xl`}
          >
            Generate Email
          </button>
        </form>
      </div>
    </div>
  );
}
