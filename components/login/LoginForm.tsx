'use client';

import { EmailInput, PasswordInput } from "@/components/form/input";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { Flex } from "antd";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import authSvc from "@/lib/auth.service";

export interface ICredentials {
  email: string;
  password: string;
}

const LoginDTO = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().required()
});

const LoginForm = () => {
  const { setLoggedInUser } = useAuth();
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ICredentials>({
    defaultValues: {
      email: '',
      password: ''
    },
    resolver: yupResolver(LoginDTO)
  });

  const onSubmit = async (credentials: ICredentials) => {
    setIsLoggingIn(true);
    try {
      console.log("Attempting login with:", credentials);

      const response = await authSvc.loginUser(credentials);

      // Store tokens
      localStorage.setItem("token_43", response.data.accessToken)
      localStorage.setItem("refresh_43", response.data.refreshToken)

      // Get user profile
      const loggedInUser = await authSvc.getLoggedInUser();

      setLoggedInUser(loggedInUser.data as UserProfile);

      toast.success("Welcome to" + loggedInUser.data.role + " panel!!", {
        description: "You are now accessing " + loggedInUser.data.role + " Panel....."
      })
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');
      router.push("/customer/dashboard");

    } catch (error: any) {
      toast.error("Error while login!!", {
        description: "Cannot login at this moment. Check your credentials before submission."
      })
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleReset = () => {
    setIsResetting(true);
    reset({ email: '', password: '' });
    setTimeout(() => setIsResetting(false), 300);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Flex>
        <label htmlFor="email" className="w-2/5 text-lg font-semibold">
          Username (Email):
        </label>
        <Flex className="w-3/5 flex flex-col">
          <EmailInput
            name="email"
            control={control}
            errMsg={errors?.email?.message}

          />
        </Flex>
      </Flex>

      <Flex>
        <label htmlFor="password" className="w-2/5 text-lg font-semibold">
          Password:
        </label>
        <Flex className="w-3/5 flex flex-col">
          <PasswordInput
            name="password"
            control={control}
            errMsg={errors?.password?.message}

          />
        </Flex>
      </Flex>

      <Flex className="flex w-full justify-end">
        <Link
          href="/forget-password"
          className="font-light text-teal-700 italic text-sm hover:underline hover:cursor-pointer hover:text-teal-800 hover:font-normal transition hover:scale-97"
        >
          Forgot Password
        </Link>
      </Flex>

      <Flex>
        <div className="flex w-2/5"></div>
        <Flex className="w-3/5 gap-5">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoggingIn} // Disable during loading
            className="w-full bg-red-800 py-2 text-white font-semibold rounded-lg hover:bg-red-900 transition hover:cursor-pointer hover-scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? 'Resetting...' : 'Reset'}
          </button>

          <button
            type="submit"
            disabled={isLoggingIn} // Disable during loading
            className="w-full bg-teal-800 py-2 text-white font-semibold rounded-lg hover:bg-teal-900 transition hover:cursor-pointer hover-scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoggingIn ? (
              // Add your loading indicator here (spinner or text)
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : 'Login'}
          </button>
        </Flex>
      </Flex>

      {Object.keys(errors).length > 0 && (
        <div className="text-red-500 text-center">
          Please fix form errors
        </div>
      )}
    </form>
  );
};

export default LoginForm;