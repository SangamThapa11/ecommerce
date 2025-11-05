import { Geist, Geist_Mono } from "next/font/google";
import React from "react";
import "../assets/globals.css"
import { UserProvider } from "@/context/UserContext";
import AuthHeader from "@/components/header/auth-header";
import AuthFooter from "@/components/footer/auth-footer";
import Sidebar from "@/components/sidebar/sidebar";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (<>
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-purple-300`}>
        <AuthProvider>
          <UserProvider>
            <AuthHeader/>
            {children}
            <Sidebar />
            <AuthFooter />
         </UserProvider>
        </AuthProvider>
      </body>
    </html>
  </>)
}