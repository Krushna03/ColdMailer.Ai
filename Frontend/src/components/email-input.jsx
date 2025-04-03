
import { Textarea } from "@/components/ui/textarea";

export function EmailInput({ prompt, setPrompt, onSubmit }) {
  
  return (
    <div className="w-full max-w-[700px] mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-white bg-transparent border p-1 mb-6 text-sm font-light bg-gray-950 border-gray-600 max-w-sm rounded-2xl mx-auto flex gap-2 items-center justify-center">
          <img src="/white-logo.png" alt="logo" className="h-7 w-7 p-1 rounded" />
            <span className="text-gray-200">ColdMailer.Ai - AI Powered Email Generator</span> 
        </h1>
        <h1 className="text-5xl font-bold tracking-wide mb-4 text-gray-200">
          Craft Perfect Cold Emails
        </h1>
        <p className="text-xl text-gray-300">
          Generate personalized, engaging emails with AI assistance
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Textarea
          placeholder="Describe your email (e.g., 'Cold email to a potential client about our new SaaS product')"
          className="p-3 px-4 max-w-[670px] bg-black text-white min-h-32 text-xl border border-gray-400 rounded-xl placeholder:text-base placeholder:font-medium placeholder:text-gray-500 focus:outline-blue-800 custom-scroll"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          disabled={!prompt}
          className={`w-full ${!prompt ? 'bg-[#2c1679] text-gray-300' : 'bg-[#3b1cab] text-gray-50'} text-lg font-medium py-2 rounded-xl`}
        >
          Generate Email
        </button>
      </form>
    </div>
  );
}
