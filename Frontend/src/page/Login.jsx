import { useState } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MovingDots } from "@/components/moving-dots"
import axios from "axios"
import { NavLink, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "../components/ui/toaster"
import Googlelogin from "./Google-Login"

export default function LoginPage() {

  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const url = import.meta.env.VITE_BASE_URL

  const submit = async (data) => {
    setLoading(true)
    try {
      const res = await axios.post(`${url}/api/v1/user/login`, data, { withCredentials: true })

      if (res.status === 200) { 
        toast({
          title: "Login Successfull !",
          description: "User login successfully!",
        });

        setTimeout(() => {
          navigate("/generate-email")
        }, 1300)
      }
      if (res.status === 500) { 
        toast({
          title: "Error !!",
          description: res.data.message,
        });
        return;
      }

      localStorage.setItem('token', JSON.stringify(res.data?.accessToken))
      reset()

    } catch (error) {
      console.log("Error in login", error);
      if (error.response && error.response.data) {
        const backendErrorMessage = error.response.data.message || "An error occurred.";
        console.error("Backend Error:", backendErrorMessage);
        toast({
          title: "Error Occurred !!",
          description: backendErrorMessage,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        console.error("Unexpected Error:", error);
        toast({
          title: "Erro Occurred !!",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      }
      reset()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-y-hidden flex flex-col bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(121,120,240,0.2),rgba(255,255,255,0))]">
      <div className="relative flex min-h-screen flex-col items-center sm:justify-center overflow-hidden mt-20 sm:mt-0 px-3">
        <MovingDots />
        <div className="relative z-10 w-full max-w-md rounded-3xl bg-zinc-900/80 px-8 py-8 backdrop-blur-sm">
          
          <NavLink to="/">
            <div className="mb-6 flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full">
                <img src="/white-logo.png" alt="login-logo" height={40} width={40} />
              </div>
              <h1 className="mt-4 text-2xl font-semibold text-white">ColdMailer.Ai</h1>
            </div>
          </NavLink>
          
          <form className="space-y-6" onSubmit={handleSubmit(submit)}>
            <div>
              <Input
                type="email"
                placeholder="Email"
                className="h-12 bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="h-12 bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="h-12 w-full rounded-xl bg-zinc-800 text-white hover:bg-zinc-700" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <h1 className="font-normal text-gray-300">Or continue with Google</h1>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          
          <div className="w-full flex flex-col items-center mt-6">
            <Googlelogin />
            <h1 className="text-center text-gray-300 mt-5">
              Don't have an account?
              <NavLink to="/sign-up">
                <span className="text-blue-500 ml-2">Signup</span>
              </NavLink>
            </h1>
          </div>

        </div>
      </div>
      <Toaster />
    </div>
  )
}
