import React, { createContext, useContext } from 'react'

export const LayoutContext = createContext({
  layoutMode: 'horizontal'
})

export function LayoutProvider({ layoutMode, children }) {
  return (
    <LayoutContext.Provider value={{ layoutMode }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  return useContext(LayoutContext)
}
