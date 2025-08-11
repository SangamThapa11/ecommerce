'use client'
import { createContext, useContext } from "react";

export const UserContext = createContext({
    detail: null
})

export const UserProvider = ({children}: Readonly<{children: React.ReactNode}>) => {
    return (<>
    <UserContext.Provider value={{
        detail: null
    }}>
        {children}
    </UserContext.Provider>
    </>)
}

export const useUser = () => {
    const {detail} = useContext(UserContext)
    return {detail}
}