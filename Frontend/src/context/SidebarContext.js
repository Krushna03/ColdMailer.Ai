import { createContext, useContext } from "react";

const SidebarContext = createContext();

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used inside SidebarContextProvider");
  }
  return context;
};

export default SidebarContext;
