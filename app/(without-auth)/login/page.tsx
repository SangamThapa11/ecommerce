
import LoginForm from "@/components/login/LoginForm";
import { Metadata } from "next";
export const generateMetadata = async(): Promise<Metadata> => {
    return {
        title: "Login Page || E-Pasal",
        description: "Securely log in to your account to shop faster, track your orders, manage your wishlist, and enjoy exclusive deals. Your trusted online shopping experience starts here."
    }
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-300">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-teal-900">Login Here!!!</h1>
          <hr className="my-4 border-gray-200" />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

