import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { GoogleLogin } from '@react-oauth/google';
const url = import.meta.env.VITE_BASE_URL

const Googlelogin = () => {

  const { toast } = useToast()
  const navigate = useNavigate()

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await axios.get(
        `${url}/api/v1/user/google/callback?token=${credentialResponse.credential}`, 
        { withCredentials: true }
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
      toast({
        title: "Google Login Failed",
        description: error.response?.data?.message || "Failed to login with Google",     
        variant: "destructive",
      });
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