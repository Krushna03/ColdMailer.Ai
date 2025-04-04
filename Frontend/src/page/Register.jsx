import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "../components/ui/input"
import { MovingDots } from "@/components/moving-dots"
import axios from "axios"
import { useForm } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"
import { NavLink, useNavigate } from "react-router-dom"
import { Toaster } from "../components/ui/toaster"
import { useDispatch } from "react-redux"
import { login } from "../context/authSlice"

export default function RegisterPage() {
  
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await axios.post('/api/v1/user/register', data, { withCredentials: true })

      console.log("response", res.data?.data.user);

      if (res.status === 200) { 
        toast({
          title: "Registeration Successfull !",
          description: "User Registered successfully!",
        });
        
        setTimeout(() => {
          navigate("/generate-email")
        }, 1300)
      }
      localStorage.setItem('token', JSON.stringify(res.data?.data.accessToken))
      reset()

    } catch (error) {
      console.log("Error in signup", error);
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
      reset()
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-y-hidden flex flex-col bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(121,120,240,0.2),rgba(255,255,255,0))]">
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden ">
      <MovingDots />

        {/* Login card */}
        <div className="relative z-10 w-full max-w-md rounded-3xl bg-zinc-900/80 px-8 py-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full">
                <img src="/white-logo.png" alt="login-logo" height={40} width={40} />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-white">ColdMailer.Ai</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                type="username"
                placeholder="Username"
                className="h-12 bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500"
                {...register("username", {
                  minLength: {
                    value: 2,
                    message: "Username must be at least 2 characters",
                  },
                  required: "Username is required",
                })}
              />
              {errors.username && <p role="alert" className="text-red-500">{errors.username.message}</p>}
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email"
                className="h-12 bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500"
                {...register("email", {
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Enter a valid email address",
                  },
                  required: "Email is required",
                })}
                />
                {errors.email && <p role="alert" className="text-red-500">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="h-12 bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                {...register("password", {
                  pattern: {
                    value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/,
                    message: "Weak password, make it strong",
                  },
                  required: "Password is required",
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <p role="alert" className="text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="h-12 w-full rounded-xl bg-zinc-800 text-white hover:bg-zinc-700">
                {loading ? "Signing up..." : "Sign up"}
            </Button>
          </form>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <h1 className="text-gray-300">Or continue with Google</h1>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <div className="mt-6">
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-800">
              <svg width="16" height="16" viewBox="0 0 20 20">
                <path
                  d="M18.9892 10.1871C18.9892 9.36767 18.9246 8.76973 18.7847 8.14966H9.68848V11.848H15.0277C14.9201 12.767 14.3388 14.1512 13.047 15.0812L13.0289 15.205L15.905 17.4969L16.1042 17.5173C17.9342 15.7789 18.9892 13.221 18.9892 10.1871Z"
                  fill="#4285F4"
                />
                <path
                  d="M9.68813 19.9314C12.3039 19.9314 14.4999 19.0455 16.1039 17.5174L13.0467 15.0813C12.2286 15.6682 11.1306 16.0779 9.68813 16.0779C7.12612 16.0779 4.95165 14.3395 4.17651 11.9366L4.06289 11.9465L1.07231 14.3273L1.0332 14.4391C2.62638 17.6946 5.89889 19.9314 9.68813 19.9314Z"
                  fill="#34A853"
                />
                <path
                  d="M4.17667 11.9366C3.97215 11.3165 3.85378 10.6521 3.85378 9.96562C3.85378 9.27905 3.97215 8.6147 4.16591 7.99463L4.1605 7.86257L1.13246 5.44363L1.03339 5.49211C0.37677 6.84302 0 8.36005 0 9.96562C0 11.5712 0.37677 13.0881 1.03339 14.4391L4.17667 11.9366Z"
                  fill="#FBBC05"
                />
                <path
                  d="M9.68807 3.85336C11.5073 3.85336 12.7344 4.66168 13.4342 5.33718L16.1684 2.59107C14.4892 0.985496 12.3039 0 9.68807 0C5.89885 0 2.62637 2.23672 1.0332 5.49214L4.16573 7.99466C4.95162 5.59183 7.12608 3.85336 9.68807 3.85336Z"
                  fill="#EB4335"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
            <h1 className="text-center text-gray-300 mt-5">Already a user ?
              <NavLink to={"/sign-in"}>
              <span className="text-blue-500 ml-2">Signin</span> 
              </NavLink>
            </h1>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

