import { useMemo, useState } from 'react'
import SidebarContext from './SidebarContext.js'

export const SidebarContextProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const value = useMemo(
    () => ({ isSidebarOpen, setIsSidebarOpen }),
    [isSidebarOpen]
  )

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}
