'use client'

import authSvc from "@/lib/auth.service";
import { Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const ActivateUser = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const activateUserProfile = async () => {
        try {
            if (!token) {
                throw new Error("Activation token is missing");
            }

            await authSvc.activateUserProfile(token);
            toast.success("Thank you for registering!!!", {
                description: "Your account has been activated successfully. Please login to continue..."
            });
        } catch (error) {
            toast.error("Error while activating!!", {
                description: error instanceof Error ? error.message : "Sorry! There was problem while activating your profile. Please try after sometimes."
            });
        } finally {
            router.push('/login');
        }
    };

    useEffect(() => {
        activateUserProfile();
    }, [token]); // Add token as dependency

    return <Spin fullscreen />;
};

export default ActivateUser;