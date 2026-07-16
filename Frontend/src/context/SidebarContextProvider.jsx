import React, { useMemo, useState } from 'react'
import SidebarContext from './SidebarContext.js'

export const SidebarContextProvider = ({ children }) => {
  const [updateSidebar, setUpdateSidebar] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const value = useMemo(
    () => ({ updateSidebar, setUpdateSidebar, isSidebarOpen, setIsSidebarOpen }),
    [updateSidebar, isSidebarOpen]
  )

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}
