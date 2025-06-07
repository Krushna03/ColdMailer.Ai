import { useState } from "react"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "../components/ui/toaster"


export default function Contact() {

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const url = import.meta.env.VITE_BASE_URL

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    formData.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    setLoading(true)

    try {
      const res = await axios.post(`${url}/api/v1/contact/new-contact`, formData, { withCredentials : true });
  
      if (res.status === 200) {
        toast({
          title: "Message Sent !!",
          description: "Thanks for sending messsage, we will love to reply you.",
        });
        setFormData({email: "", name: "", message: ""})
      }

      if (res.status === 500) { 
        toast({
          title: "Error !!",
          description: res.data.message,
        });
        setFormData({email: "", name: "", message: ""})
        return;
      }


    } catch (error) {
      console.log("Error in contact", error);
      if (error.response && error.response.data) {
        const backendErrorMessage = error.response.data.message || "An error occurred.";
        console.error("Backend Error:", backendErrorMessage);
        toast({
          title: "Error",
          description: backendErrorMessage,
          status: "error",
          variant: "destructive",
          duration: 5000,
          isClosable: true,
        });
      } else {
        console.error("Unexpected Error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 p-8 relative">

      <div className="absolute top-1/3 -rotate-12 w-full h-24 bg-[#6f34ed] opacity-30 blur-3xl"></div>

      {/* Left side - Text content */}
      <div className="lg:w-1/2 space-y-6 sm:space-y-8">
        <h1 className="text-2xl md:text-5xl font-bold leading-tight text-white">Ask whatever you have in your mind</h1>
        <p className="text-gray-400 text-base md:text-lg">
          Whether you have questions or want to boost your outreach, we're here to help. Let's connect today.
        </p>

        <div className="space-y-2 md:pt-8">
          <p className="text-gray-400">krushnasakhare965@gmail.com</p>
          <p className="text-gray-400">7385664978</p>
          <p className="text-gray-400">Nagpur India, Maharashtra</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="lg:w-1/2 z-50">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-gray-200 block text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Jane Smith"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#3f1cbc]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-gray-200 block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="jane@smith@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#3f1cbc]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-gray-200 block text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Hi, I am reaching out for..."
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#3f1cbc] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading ||
              !formData.name.trim() ||
              !formData.email.trim() ||
              !formData.message.trim()}
            className="w-full py-2 md:py-3 md:px-4 bg-[#3f1cbc] hover:bg-[#2c1679] text-white font-medium rounded-md transition-colors"
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  )
}

