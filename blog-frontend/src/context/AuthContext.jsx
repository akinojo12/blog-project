import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const register = (userData) => {
        setUser(userData)
    }
    const login = (userData) => {
        setUser(userData)
    }
    const logout = () => {
        setUser(null)
    }
  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
        {children}
    </AuthContext.Provider>
  )
}

export default AuthContext