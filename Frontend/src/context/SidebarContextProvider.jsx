import React, { useState } from 'react'
import SidebarContext from './SidebarContext.js'

export const SidebarContextProvider = ({ children }) => {
  const [updateSidebar, setUpdateSidebar] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <SidebarContext.Provider value={{ updateSidebar, setUpdateSidebar, isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}
