
import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";
export const generateMetadata = async(): Promise<Metadata> => {
    return {
        title: "Register Page || E-Pasal",
        description: "Unlock a world of convenience, exclusive deals, and seamless shopping at E-Pasal!"
    }
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-300">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-teal-900">Register Now!!!</h1>
          <hr className="my-4 border-gray-200" />
        </div>
       <RegisterForm/>
      </div>
    </div>
  );
}