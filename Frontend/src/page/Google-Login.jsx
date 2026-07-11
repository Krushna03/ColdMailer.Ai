import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useErrorToast } from "@/hooks/useErrorToast"
import { GoogleLogin } from '@react-oauth/google';
import { api } from "@/utils"

const Googlelogin = () => {

  const { toast } = useToast()
  const showErrorToast = useErrorToast()
  const navigate = useNavigate()

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await api.get(
        `/api/v1/user/google/callback?token=${credentialResponse.credential}`
      );
  
      if (res.data.success) {
        localStorage.setItem('token', JSON.stringify(res.data.token));
        
        toast({
          title: "Login Successful!",
          description: "You've successfully logged in with Google!",
        });
      
        setTimeout(() => {
          navigate("/generate-email");
        }, 1300);
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      showErrorToast(error, { title: "Google Login Failed", fallback: "Failed to login with Google" });
    } 
  };

  return (
    <GoogleLogin
      theme="filled_black"
      shape="circle"
      logo_alignment="center"
      onSuccess={handleLoginSuccess}
      onError={() => toast.error("Login Failed")}
    />
  )
}

export default Googlelogin