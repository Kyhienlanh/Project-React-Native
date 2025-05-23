// ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react'

const LightTheme = {
  background: '#F9F9F9',
  card: '#FFFFFF',
  text: '#333333',
}

const DarkTheme = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
}

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: LightTheme,
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  const theme = isDarkMode ? DarkTheme : LightTheme

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
