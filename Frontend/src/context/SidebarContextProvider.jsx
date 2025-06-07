import React, { useState } from 'react'
import sidebarContext from './SidebarContext.js'

export const SidebarContextProvider = ({ children }) => {

  const [updateSidebar, setUpdateSidebar] = useState(false)
  
  return (
    <sidebarContext.Provider value={{ updateSidebar, setUpdateSidebar}}>
      {children}
    </sidebarContext.Provider>
  )
}