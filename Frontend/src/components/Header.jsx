import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { ShimmerButton } from "./ui/spinner-button"
import { User } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "../context/authSlice"
import { useEffect, useState } from "react"
import axios from "axios"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger} from "../components/ui/dropdown-menu"
import { PlanUsageNotice } from "./PlanUsageNotice"
import { isTokenExpired, useLogout } from "../Helper/tokenValidation"

export function Header() {

  const { toast } = useToast()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [planUsage, setPlanUsage] = useState(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const user = useSelector(state => state.auth.userData)
  const storedToken = localStorage.getItem('token')
  let token = null
  try {
    token = storedToken ? JSON.parse(storedToken) : null
  } catch {
    token = storedToken
  }
  const url = import.meta.env.VITE_BASE_URL
  const location = useLocation()
  const textToShow = location.pathname === "/payment" ? "Generate Email" : "Manage Plan"
  const logoutUser = useLogout()

  useEffect(() => {
    if (!token) {
      setPlanUsage(null)
      return
    }

    if (isTokenExpired(token)) {
      logoutUser()
      return
    }

    let isMounted = true

    const fetchPlanUsage = async () => {
      setUsageLoading(true)
      try {
        const response = await axios.get(`${url}/api/v1/email/usage`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (response.data.success && isMounted) {
          setPlanUsage(response.data.data)
        }
      } catch (error) {
        if (error.response?.status === 401) {
          logoutUser()
        } else {
          console.error("Failed to fetch plan usage", error)
        }
      } finally {
        if (isMounted) {
          setUsageLoading(false)
        }
      }
    }

    fetchPlanUsage()

    return () => {
      isMounted = false
    }
  }, [token, url, logoutUser])
  
  const handleLogout = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post(`${url}/api/v1/user/logout`, {}, {
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
    <header className="sticky top-0 z-50 backdrop-blur-3xl shadow-lg group-hover:shadow-blue-900/50">
      <div className="flex h-16 items-center px-2 md:px-10">
        <NavLink to="/" className="flex items-center gap-1 md:mr-6 group">
          <div className="p-2 md:px-4 rounded-xl transition-shadow flex items-center gap-2">
            <img src="/white-logo.png" alt="logo" className="h-9 w-9 md:h-11 md:w-11 p-1 rounded" />
            <span className="font-medium text-gray-100 text-xl md:text-2xl">
              𝐂𝐨𝐥𝐝𝐌𝐚𝐢𝐥𝐞𝐫.𝐀𝐢
            </span>
          </div>
        </NavLink>
        <div className="ml-auto flex items-center gap-4 mt-1">
          {
            token ? (
              <>
              <NavLink to={location.pathname === "/payment" ? "/generate-email" : "/payment"}>
                <ShimmerButton background="#6f34ed" className="hidden sm:block shadow-2xl hover:scale-[1.01]">
                  <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none text-white lg:text-base tracking-wider">
                    {
                      textToShow
                    }
                  </span>
                </ShimmerButton>
              </NavLink>

              <DropdownMenu className="ml-3">
                <DropdownMenuTrigger asChild>
                  <User className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-0 rounded-full bg-[#4a465bd3] text-white p-2 cursor-pointer"/>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[298px] bg-[#24232bf3] text-white border-none mr-5 mt-2">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      Name
                      <DropdownMenuShortcut>{user?.userData?.username}</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="gap-2">
                      Email
                      <DropdownMenuShortcut>
                        {user?.userData?.email}
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  <div className="px-2 py-2">
                    <PlanUsageNotice
                      usage={planUsage}
                      loading={usageLoading}
                      onUpgrade={() => navigate('/payment')}
                      className="w-full"
                    />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-white hover:text-black hover:rounded-md">
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

