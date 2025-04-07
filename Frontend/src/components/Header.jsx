import { NavLink, useNavigate } from "react-router-dom"
import { ShimmerButton } from "./ui/spinner-button"
import { User } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "../context/authSlice"
import { useState, useEffect } from "react"
import axios from "axios"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger} from "../components/ui/dropdown-menu"

export function Header() {

  const { toast } = useToast()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const user = useSelector(state => state.auth.userData)
  const token = localStorage.getItem('token') || null;
  

  const handleLogout = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post('/api/v1/user/logout', {}, {
        withCredentials: true
      })
      if (response.status === 200) {
        toast({
          title: "Logout Done !!",
          description: "You logout successfully.!!",
        });

        dispatch(logout())
        localStorage.removeItem("token")
        navigate('/')
      }
    } catch (error) {
      console.error(`Error in logout`, error);
      toast({
        title: "Logout failed",
        description: `Something went wrong while logout ${error.message}`,
        variant: "destructive",
      });
    }
    finally {
      setLoading(false)
    }
  }
  
  return (
    <header className="backdrop-blur-md shadow-lg shadow-blue-900/0 group-hover:shadow-blue-900/50">
      <div className="container flex h-16 items-center px-10">
        <NavLink to="/" className="flex items-center gap-1 mr-6 group">
          <div className="p-2 px-4 rounded-xl transition-shadow flex items-center gap-2">
            <img src="/white-logo.png" alt="logo" className="h-11 w-11 p-1 rounded" />
            <span className="font-medium text-gray-100 text-2xl">
              𝐂𝐨𝐥𝐝𝐌𝐚𝐢𝐥𝐞𝐫.𝐀𝐢
            </span>
          </div>
        </NavLink>
        <div className="ml-auto flex items-center gap-4 mt-1">
          {
            token ? (
              <>
              <NavLink to={"/sign-in"}>
                <ShimmerButton className="shadow-2xl" onClick={handleLogout}>
                  <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none text-white dark:from-white dark:to-slate-900/10 lg:text-base tracking-wider">
                  {loading ? "Loading...." : "Logout"} 
                  </span>
                </ShimmerButton>
              </NavLink>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <User className="h-10 w-10 rounded-full bg-[#4a465bd3] text-white p-2 cursor-pointer"/>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-52 bg-[#24232bf3] text-white border-none mr-5 mt-2">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      Name
                      <DropdownMenuShortcut>{user?.userData?.username}</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      Email
                      <DropdownMenuShortcut className="ml-5">{user?.userData?.email}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : null
          }
        </div>
      </div>
    </header>
  )
}

