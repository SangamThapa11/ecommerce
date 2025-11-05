'use client';

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EmailInput } from "@/components/form/input";
import authSvc from "@/lib/auth.service";
import type { ICredentials } from "@/components/login/LoginForm";
import { Loader2 } from "lucide-react"; 

const ForgetPasswordPage = () => {
  const router = useRouter();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ICredentials>({
    defaultValues: { email: "" }
  });

  const submitForm = async (credentials: ICredentials) => {
    try {
      await authSvc.forgetPasswordRequest(credentials.email);

      toast.success("Reset link sent!", {
        description: "A password reset link has been sent to your email."
      });
    } catch (exception: any) {
      console.error(exception);
      const errorMessage = exception.response?.data?.message || "Error sending reset link";

      toast.error("Request failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-teal-900">Reset Password</h1>
          <hr className="my-4 border-gray-200" />
        </div>

        <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address:
            </label>
            <EmailInput
              name="email"
              control={control}
              errMsg={errors?.email?.message}
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
              className="w-full flex items-center justify-center gap-2 bg-teal-800 py-2 text-white font-semibold rounded-lg hover:bg-teal-900 transition disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center">
          <div className="h-px flex-1 bg-gray-300"></div>
          <span className="shrink-0 px-4 text-gray-900">OR</span>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>

        <p className="text-sm text-center">
          Remember your password?{" "}
          <button
            onClick={() => router.push("/login")}
            className="font-light text-teal-700 text-sm hover:underline hover:text-teal-800 hover:font-normal transition"
          >
            Login here!
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
