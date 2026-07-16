
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";

const MAX_TEXTAREA_HEIGHT = 200;

const PROMPT_SUGGESTIONS = [
  "Cold email to a SaaS founder pitching our analytics tool",
  "Follow-up after a job interview for a frontend role",
  "Reach out to a marketing manager about a collaboration",
  "Introduce our design agency to a potential client",
];

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
      {/* Mobile Layout */}
      <div className="sm:hidden flex flex-1 flex-col pb-36">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-0.5">
          <div className="inline-flex items-center gap-2 bg-brand-900 shadow-2xl rounded-full px-3 py-1 mb-3">
            <img src="/white-logo.png" alt="logo" className="h-7 w-7 p-1 rounded" />
            <span className="text-sm text-white">ColdMailerAI - AI Powered Email Generator</span>
          </div>
          <h1 className="text-[24px] font-bold tracking-wide mb-2 text-gray-200">
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
          <div className="flex items-end gap-2 bg-surface-800 border border-gray-700 rounded-[26px] px-2 py-2 focus-within:border-gray-500 transition-colors">
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
              className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-full transition-colors active:scale-95 ${!prompt.trim() ? 'bg-brand-800 text-gray-400' : 'bg-brand-700 text-white'}`}
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex sm:flex-col w-full max-w-[760px] mx-auto mb-6">
        <div className="text-center mb-7 shrink-0">
          <div className="inline-flex items-center gap-2 bg-brand-900/80 border border-white/10 shadow-2xl rounded-full px-4 py-1.5 mb-4">
            <img src="/white-logo.png" alt="logo" className="h-7 w-7 p-1 rounded" />
            <span className="text-xs sm:text-sm font-medium text-gray-200">ColdMailerAI · AI Powered Email Generator</span>
          </div>
          <h1 className="text-[34px] md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-b from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Craft Perfect Cold Emails
          </h1>
          <p className="text-lg text-gray-400">
            Describe your goal and let AI write a ready-to-send email
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col">
          {/* Gradient ring wrapper */}
          <div className="relative h-[20vh] flex flex-col rounded-[24px] p-[1.5px] bg-gradient-to-br from-brand-400/50 via-gray-700/40 to-gray-800/20 focus-within:from-brand-400 focus-within:via-brand-500/40 transition-colors shadow-2xl shadow-brand-900/40">
            <div className="flex-1 min-h-0 flex items-stretch gap-2 rounded-[22px] bg-surface-850/95 backdrop-blur-sm px-4 py-3">
              <textarea
                placeholder="Describe your email — who it's for, the goal, and any key details…"
                className="flex-1 min-h-0 resize-none bg-transparent text-gray-100 text-md leading-relaxed overflow-y-auto placeholder:text-gray-500 focus:outline-none custom-scroll"
                aria-label="Describe your email"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                type="submit"
                disabled={!prompt.trim()}
                aria-label="Generate email"
                className={`self-end shrink-0 h-10 w-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${!prompt.trim() ? 'bg-brand-800/70 text-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 cursor-pointer'}`}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </form>

        {/* Example prompt chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-5 shrink-0">
          {PROMPT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setPrompt(suggestion)}
              className="text-xs text-gray-300 bg-surface-800/80 hover:bg-surface-700 border border-gray-700 hover:border-brand-500/60 rounded-full px-4 py-1.5 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
