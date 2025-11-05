'use client';

import { Flex } from "antd";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { PasswordInput } from "@/components/form/input";
import authSvc from "@/lib/auth.service";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedToken, setVerifiedToken] = useState("");

  const {control, handleSubmit, formState: { errors, isSubmitting },} = useForm<ResetPasswordFormData>({
    defaultValues: { password: "", confirmPassword: "" },
    resolver: yupResolver(ResetPasswordSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await authSvc.verifyForgetToken(token);
          setVerifiedToken(response.data.verifyToken);
          setIsTokenVerified(true);
          toast.success("Reset link verified successfully");
        } catch (error: any) {
          console.error("Token verification error:", error);
          const errorMessage = error.response?.data?.message || "Invalid or expired reset link";
          toast.error(errorMessage);
          setIsTokenVerified(false);
        } finally {
          setIsVerifying(false);
        }
      } else {
        setIsVerifying(false);
        toast.error("No reset token provided");
        setIsTokenVerified(false);
      }
    };

    verifyToken();
  }, [token]);

  const submitForm = async (data: ResetPasswordFormData) => {
    if (!isTokenVerified || !verifiedToken) { 
      toast.error("Please verify your token first");
      return;
    }

    try {
      await authSvc.resetPassword(verifiedToken, data.password); 
      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (error: any) {
      console.error("Reset password error:", error);
      const errorMessage = error.response?.data?.message || "Password reset failed";
      toast.error(errorMessage);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-teal-900">Reset Password</h1>
            <hr className="my-4 border-gray-200" />
          </div>
          <div className="flex justify-center items-center py-10">
            <div className="text-lg">Verifying reset link...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isTokenVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-teal-900">Reset Password</h1>
            <hr className="my-4 border-gray-200" />
          </div>
          <div className="flex flex-col items-center py-10 gap-5">
            <div className="text-lg text-red-600">Invalid or expired reset link</div>
            <button
              onClick={() => router.push("/forget-password")}
              className="bg-teal-800 px-6 py-2 text-white font-semibold rounded-lg hover:bg-teal-900 transition"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-teal-900">Reset Password</h1>
          <hr className="my-4 border-gray-200" />
        </div>

        <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              New Password:
            </label>
            <PasswordInput
              name="password"
              control={control}
              errMsg={errors?.password?.message}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password:
            </label>
            <PasswordInput
              name="confirmPassword"
              control={control}
              errMsg={errors?.confirmPassword?.message}
            />
          </div>

          <div className="flex gap-5">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full bg-red-800 py-2 text-white font-semibold rounded-lg hover:bg-red-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-800 py-2 text-white font-semibold rounded-lg hover:bg-teal-900 transition disabled:opacity-70"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;