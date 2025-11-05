'use client'
import React, { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Gender, Status, UserRoles } from "../config/constants";

import { Spin } from "antd";
import authSvc from "@/lib/auth.service";

export interface IAuthProviderProps {
    children: React.ReactNode
}
export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: UserRoles;
    gender: Gender;
    status: Status;
    address: string;
    phone: string,
    image: string,
    token?: string
}
// context hook
export const AuthContext = createContext({
    loggedInUser: null as UserProfile | null,
    setLoggedInUser: (() => { }) as Dispatch<SetStateAction<UserProfile | null>>
})

// context provider
export const AuthProvider = ({ children }: Readonly<IAuthProviderProps>) => {
    const [loggedInUser, setLoggedInUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState<boolean>(true);
    const getLoggedInUserProfile = async () => {
        try {
            const response = await authSvc.getLoggedInUser()
            setLoggedInUser(response.data as UserProfile)
        } catch {
           // const { loggedInUser } = useAuth();
           setLoggedInUser(null)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        const token = localStorage.getItem("token_43") || null
        if (token) {
            getLoggedInUserProfile()
        } else {
            setLoading(false)
        }
    }, [])

    return (
        <>
            {loading ? (
                <Spin fullscreen />
            ) : (
                <AuthContext.Provider value={{
                    loggedInUser: loggedInUser,
                    setLoggedInUser: setLoggedInUser
                }}>
                    {children}
                </AuthContext.Provider>
            )
            }
        </>)
}
// custom hook
export const useAuth = () => {
    const { loggedInUser, setLoggedInUser } = useContext(AuthContext)

    return { loggedInUser, setLoggedInUser };
}

