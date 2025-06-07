
import { Textarea } from "@/components/ui/textarea";

export function EmailInput({ prompt, setPrompt, onSubmit }) {
  
  return (
    <div className="w-full max-w-[750px] mx-auto px-4">
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 bg-[#1a1133] shadow-2xl rounded-full px-2 sm:px-5 py-2 mb-2 sm:mb-5">
            <img src="/white-logo.png" alt="logo" className="h-7 w-7 p-1 rounded" />
            <span className="text-sm sm:text-base text-white">ColdMailer.Ai - AI Powered Email Generator</span>
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
  );
}
