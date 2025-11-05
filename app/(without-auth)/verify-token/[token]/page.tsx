'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import authSvc from "@/lib/auth.service";


const TokenVerificationPage = () => {
  const params = useParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      const token = params.token as string;
      
      if (!token) {
        setError("No verification token found");
        setIsVerifying(false);
        toast.error("Invalid reset link");
        return;
      }

      try {
        const decodedToken = decodeURIComponent(token);
        console.log("Verifying token:", decodedToken);
        
        await authSvc.verifyForgetToken(decodedToken);
        setIsVerified(true);
        toast.success("Token verified successfully!");
        
        setTimeout(() => {
          router.push(`/reset-password?token=${encodeURIComponent(decodedToken)}`);
        }, 2000);
        
      } catch (exception: any) {
        console.error("Token verification error:", exception);
        const errorMessage = exception.response?.data?.message || "Token verification failed";
        setError(errorMessage);
        toast.error("Verification failed", {
          description: errorMessage,
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [params.token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-teal-900">Verifying Token</h1>
          <hr className="my-4 border-gray-200" />
        </div>

        <div className="flex flex-col items-center gap-5 py-5">
          {isVerifying && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-800"></div>
              <p className="text-gray-700">Verifying your token...</p>
            </>
          )}

          {!isVerifying && isVerified && (
            <>
              <div className="text-green-600 text-6xl">✓</div>
              <p className="text-green-800 font-semibold">Token verified successfully!</p>
              <p className="text-gray-600">Redirecting to password reset page...</p>
            </>
          )}

          {!isVerifying && error && (
            <>
              <div className="text-red-600 text-6xl">✗</div>
              <p className="text-red-800 font-semibold">Verification Failed</p>
              <p className="text-gray-600 text-center">{error}</p>
              
              <button
                onClick={() => router.push("/forget-password")}
                className="mt-4 bg-teal-800 px-6 py-2 text-white font-semibold rounded-lg hover:bg-teal-900 transition"
              >
                Request New Link
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenVerificationPage;