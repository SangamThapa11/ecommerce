'use client'

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CustomerLandingPage() {
    const { loggedInUser, isLoading} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            // Redirect to dashboard if user is logged in
            if (loggedInUser) {
                router.push('/customer/dashboard');
            } else {
                // If not logged in, redirect to login
                router.push('/login');
            }
        }
    }, [loggedInUser, isLoading, router]);

    return (
        <div className="emerald-500 flex items-center justify-center h-screen">
            <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-teal-600 animate-pulse"></div>
                <div className="w-4 h-4 rounded-full bg-teal-600 animate-pulse delay-100"></div>
                <div className="w-4 h-4 rounded-full bg-teal-600 animate-pulse delay-200"></div>
            </div>
        </div>
    );
}