import { Geist, Geist_Mono } from "next/font/google";
import React from "react";
import "../assets/globals.css"
import { UserProvider } from "@/context/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export default function AuthLayout({children}: Readonly<{children: React.ReactNode}>) {
    return (<>
    <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}>
            <UserProvider>
                {children}
            </UserProvider>
        </body>
    </html>
    </>)
}
