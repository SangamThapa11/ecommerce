'use client';

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Spin } from "antd";
import authService from "@/lib/auth.service";


const ActivateUser = () => {
  const params = useParams();
  const router = useRouter();

  const activateUserProfile = async () => {
    try {
      await authService.activateUserProfile(params.token as string);
      toast.success("Thank you for registering!!!", {
        description: "Your account has been activated successfully. Please login to continue..."
      });
    } catch {
      toast.error("Error while activating!!", {
        description: "Sorry! There was problem while activating your profile. Please try after sometimes."
      });
    } finally {
      router.push("/auth/login");
    }
  };

  useEffect(() => {
    activateUserProfile();
  }, []);

  return <Spin fullscreen />;
};

export default ActivateUser;