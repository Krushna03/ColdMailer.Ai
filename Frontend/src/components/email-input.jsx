
import { Textarea } from "@/components/ui/textarea";

export function EmailInput({ prompt, setPrompt, onSubmit }) {
  
  return (
    <div className="w-full max-w-[750px] mx-auto px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#1a1133] shadow-2xl rounded-full px-5 py-2 mb-5">
            <img src="/white-logo.png" alt="logo" className="h-7 w-7 p-1 rounded" />
            <span className="text-base text-white">ColdMailer.Ai - AI Powered Email Generator</span>
        </div>
        <h1 className="text-5xl font-bold tracking-wide mb-3 text-gray-200">
          Craft Perfect Cold Emails
        </h1>
        <p className="text-xl text-gray-300">
          Generate personalized, engaging emails with AI assistance
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Textarea
          placeholder="Describe your email (e.g. 'Cold email to a potential client about our new SaaS product')"
          className="p-3 px-4 max-w-[750px] bg-[#0d0e12] min-h-32 text-gray-200 text-2xl border border-gray-400 rounded-xl placeholder:text-base placeholder:font-medium placeholder:text-gray-500 focus:outline-blue-800 custom-scroll"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          disabled={!prompt}
          className={`w-full ${!prompt ? 'bg-[#2e137a] text-gray-300' : 'bg-[#3b1cab] text-gray-50'} text-lg font-medium py-2 rounded-xl`}
        >
          Generate Email
        </button>
      </form>
    </div>
  );
}
