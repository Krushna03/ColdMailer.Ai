import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { GoSidebarCollapse } from "react-icons/go";
import { useToast } from "@/hooks/use-toast";
import { BsThreeDotsVertical } from "react-icons/bs";
import SidebarLoader from "../loader/SidebarLoader";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { MdDelete } from "react-icons/md";
import sidebarContext from "../context/SidebarContext";
import { MoreVertical } from "lucide-react";
import { Button } from "../components/ui/button";

const url = import.meta.env.VITE_BASE_URL;

export default function Sidebar() {
  const [sidebarActive, setSidebarActive] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [emailDeleted, setEmailDeleted] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const userData = JSON.parse(localStorage.getItem("data") || null);
  const userID = userData?.userData?._id || null;
  const { updateSidebar } = useContext(sidebarContext);

  const sidebarRef = useRef(null);
  const sidebarScrollRef = useRef(null);

  const handleMouseEnter = () => {
    setSidebarActive(true);
  };

  const handleMouseLeave = (e) => {
    if (
      sidebarRef?.current && e?.relatedTarget instanceof Node &&
      !sidebarRef.current.contains(e.relatedTarget)
    ) {
      setSidebarActive(false);
    }
  };

  const fetchUserEmailHistory = async (currentPage) => {
    if (!userID || loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/v1/email/get-user-email-history`, {
        params: {
          userID,
          limit: 15,
          page: currentPage,
        },
        withCredentials: true,
      });

      if (res.status === 200) {
        const newEmails = res.data.emails;

        if (newEmails.length === 0) {
          setHasMore(false);
        }

        setEmailHistory((prev) =>
          currentPage === 0 ? newEmails : [...prev, ...newEmails]
        );
      }
    } catch (error) {
      console.error("Email fetch error:", error);
      const message =
        error?.response?.data?.message ||
        "An unexpected error occurred. Please try again later.";

      toast({
        title: "Error Occurred !!",
        description: message,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUserEmailHistory(page);
  }, [userID, page, emailDeleted, updateSidebar]);


  const handleEmailDelete = async (emailId) => {
    setLoading(true);
    try {
      const res = await axios.delete(`${url}/api/v1/email/delete-email`, {
        data: { emailId },
        withCredentials: true,
      });

      if (res.status === 200) {
        setEmailDeleted(true);
        setEmailHistory([]);
        setPage(0);
        setHasMore(true);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "An unexpected error occurred. Please try again later.";

      toast({
        title: "Error Occurred !!",
        description: message,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };


  const handleMailNavigation = (email) => () => {
    navigate(`/email/${email._id}`, { state: { email } });
  };


  useEffect(() => {
    const scrollContainer = sidebarScrollRef.current;
    if (!scrollContainer) return;

    const handleSidebarScroll = () => {
      if (loading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (nearBottom) {
        setPage((prev) => prev + 1);
      }
    };

    scrollContainer.addEventListener("scroll", handleSidebarScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleSidebarScroll);
    };
  }, [loading, hasMore]);


  return (
    <>
      {/* Sidebar Toggle Button */}
      <div
        className="fixed left-0 w-8 h-full z-50 md:flex items-end justify-center hidden"
        onMouseOver={handleMouseEnter}
      >
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
        <div className="p-4 font-semibold text-center text-lg border-b border-gray-700 flex gap-2 justify-start">
          <img src="/white-logo.png" alt="logo" className="ml-5 h-8 w-8 p-1 rounded" /> Your Email History
        </div> 

        <ul
          ref={sidebarScrollRef}
          className="h-[83%] overflow-y-auto sidebar-scroll p-4 px-3 space-y-4"
        >
          {emailHistory.length > 0 ? (
            emailHistory.map((email) => (
              <li
                key={email._id}
                className="group sidebar-font cursor-pointer text-sm text-[#f0f0f6] hover:bg-[#2f2f37bc] rounded-lg px-2 py-1 flex items-center justify-between"
              >
                <span
                  onClick={handleMailNavigation(email)}
                  className="text-base truncate w-[100%] p-1"
                  title={email.prompt}
                >
                  {email.prompt.charAt(0).toUpperCase() + email.prompt.slice(1)}
                </span>

                <DropdownMenu className="ml-3">
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-6 p-0 text-slate-400 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-24 bg-[#44434af3] text-white border-none mt-2">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => handleEmailDelete(email._id)}
                        className="flex gap-1 cursor-pointer text-red-200"
                      >
                        <MdDelete color="#de473c" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))
          ) : !loading ? (
            <div key="error-message" className="text-center py-10 px-4 rounded-lg shadow-md">
              <p className="text-xl font-semibold text-gray-300 mb-2">
                No Email History
              </p>
              <p className="text-md text-gray-400 dark:text-gray-400">
                Please create your first Cold Email to get started.
              </p>
            </div>
          ) : null}

          {loading && <SidebarLoader />}
        </ul>

        <div className="p-3 border-t border-white/10">
          <div className="text-center">
            <p className="text-slate-400 text-xs">Powered By</p>
            <p className="text-white font-medium text-sm">ColmailerAi</p>
          </div>
        </div>
      </div>
    </>
  );
}
