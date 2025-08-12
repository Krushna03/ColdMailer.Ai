import React, { useState } from 'react'
import SidebarContext from './SidebarContext.js'

export const SidebarContextProvider = ({ children }) => {
  const [updateSidebar, setUpdateSidebar] = useState(false)
  
  return (
    <SidebarContext.Provider value={{ updateSidebar, setUpdateSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}
