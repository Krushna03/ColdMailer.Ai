import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { GoSidebarCollapse } from "react-icons/go";
import { useToast } from "@/hooks/use-toast"
import { BsThreeDotsVertical } from "react-icons/bs";
import SidebarLoader from "../loader/SidebarLoader";
import { useNavigate } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger} from "../components/ui/dropdown-menu"
import { MdDelete } from "react-icons/md";
import sidebarContext from "../context/SidebarContext";
const url = import.meta.env.VITE_BASE_URL

export default function Sidebar() {
  const [sidebarActive, setSidebarActive] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const [emailDeleted, setEmailDeleted] = useState(false)
  const [emailHistory, setEmailHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem('data') || null)
  const userID = userData?.userData?._id || null
  const { updateSidebar } = useContext(sidebarContext)

  const sidebarRef = useRef(null);
  
  const handleMouseEnter = () => {
    setSidebarActive(true);
  };

  const handleMouseLeave = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.relatedTarget)) {
      setSidebarActive(false);
    }
  };

  useEffect(() => {
    const fetchUserEmailHistory = async () => {
      setLoading(true)
        try {
          const res = await axios.get(`${url}/api/v1/email/get-user-email-history`, {
            params: { userID },
            withCredentials: true
          });
  
          if(res.status === 200){
            setEmailHistory(res.data?.emails)
          }
  
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
              title: "Error Occurred !!",
              description: "An unexpected error occurred. Please try again later.",
              variant: "destructive",
            });
          }
        } finally {
          setLoading(false)
        }
    }
    fetchUserEmailHistory()
  }, [userID, emailDeleted, setEmailDeleted, updateSidebar])


  const handleEmailDelete = async (emailId) => {
    setLoading(true)
    try {
      const res = await axios.delete(`${url}/api/v1/email/delete-email`, {
        data: { emailId },
        withCredentials: true,
      });      

      if(res.status === 200){
        setEmailDeleted(true)
      }

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
          title: "Error Occurred !!",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false)
    }
  }


  const handleMailNavigation = (email) => () => {
    navigate(`/email/${email._id}`, {state: { email }})
  }

  return (
    <>
    {/* Sidebar Toggle Button */}
      <div
        className="fixed left-0 w-8 h-full z-50 md:flex items-end justify-center hidden"
        onMouseOver={handleMouseEnter}>
        <GoSidebarCollapse className="h-5 w-5 mb-4 text-gray-400" />
      </div>

      <div 
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 h-full w-72 bg-[#16161c] text-white z-50 transform transition-transform duration-300 ${
          sidebarActive ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 font-semibold text-center text-lg border-b border-gray-700">Email History</div>
          
          <ul className="h-[86%] overflow-y-auto sidebar-scroll p-4 px-3 space-y-4">
            {
              !loading ? (
                emailHistory?.length > 0 ? (
                  emailHistory?.map((email) => (    
                    <li 
                      key={email._id} 
                      className="sidebar-font cursor-pointer text-sm text-[#d7d7db] hover:bg-[#2f2f37bc] rounded-lg px-2 py-1 flex items-center justify-between" 
                    >
                      <span 
                        onClick={handleMailNavigation(email)} 
                        className="text-sm truncate w-[90%] p-1"
                        title={email.prompt}
                      >
                        {email.prompt.charAt(0).toUpperCase() + email.prompt.slice(1)}
                      </span>
  
                      <DropdownMenu className="ml-3">
                        <DropdownMenuTrigger asChild>
                          <BsThreeDotsVertical className="w-4 h-4 text-[#d7d7db]" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-24 bg-[#44434af3] text-white border-none mt-2">
                          <DropdownMenuGroup>
                            <DropdownMenuItem 
                              onClick={() => handleEmailDelete(email._id)} className="flex gap-2 cursor-pointer"
                            >
                              <MdDelete color="#de473c"/> Delete
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ))
                ) : (
                  <>
                    <div className="text-center py-10 px-4 rounded-lg shadow-md">
                      <p className="text-xl font-semibold text-gray-300 mb-2">
                        No Email History
                      </p>
                      <p className="text-md text-gray-400 dark:text-gray-400">
                        Please create your first Cold Email to get started.
                      </p>
                    </div>
                  </>
                )
              ) : 
              <SidebarLoader />
            }
          </ul>

          <div className=" bg-[#16161c] pt-3 text-sm font-normal text-gray-300 border-t border-gray-700 text-center">Powered By ColmailerAi</div>
      </div>
    </>
  )
}
