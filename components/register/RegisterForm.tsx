'use client'

import { useForm } from "react-hook-form";
import { EmailInput, FileUpload, PasswordInput, RadioOption, SelectOption, TextAreaInput, TextInput } from "@/components/form/input";
import { yupResolver } from "@hookform/resolvers/yup";
import authSvc from "@/lib/auth.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IRegisterData, RegisterDTO } from "./auth.contracts";
import { AxiosSuccessResponse } from "@/config/axios.config";



const RegisterForm = () => {
    const router = useRouter();
    const { control, handleSubmit, formState: { errors, isSubmitting }, setValue, setError } = useForm<IRegisterData>({
        resolver: yupResolver(RegisterDTO) as any
    });

    const submitForm = async (data: IRegisterData) => {
        try {
            await authSvc.registerUser(data) as unknown as AxiosSuccessResponse;
            toast.success("Register Success", { description: 'Please check your email for further activation process...' })
            router.push('/login')
        } catch (exception: any) {
            if (exception.code === 400) {
                Object.keys(exception.error.error).map((field) => {
                    setError(field as keyof IRegisterData, { message: exception.error.error[field] })
                })
            }
            toast.error("Cannot Register!!!", {
                description: "Please try again later..."
            })
        }
    };

    return (
        <form onSubmit={handleSubmit(submitForm)} className="w-full max-w-2xl space-y-4">
            {/* Name Field */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <label className="md:col-span-2 text-sm font-medium">Full Name</label>
                <div className="md:col-span-3">
                    <TextInput
                        name="name"
                        control={control}
                        errMsg={errors?.name?.message}
                    />
                </div>
            </div>

            {/* Email Field */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <label className="md:col-span-2 text-sm font-medium">Email</label>
                <div className="md:col-span-3">
                    <EmailInput
                        name="email"
                        control={control}
                        errMsg={errors?.email?.message}
                    />
                </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <label className="md:col-span-2 text-sm font-medium">Password</label>
                <div className="md:col-span-3">
                    <PasswordInput
                        name="password"
                        control={control}
                        errMsg={errors?.password?.message}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <label className="md:col-span-2 text-sm font-medium">Confirm Password</label>
                <div className="md:col-span-3">
                    <PasswordInput
                        name="confirmPassword"
                        control={control}
                        errMsg={errors?.confirmPassword?.message}
                    />
                </div>
            </div>

            {/* Role Field */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <label className="md:col-span-2 text-sm font-medium">Role</label>
                <div className="md:col-span-3">
                    <SelectOption
                        name="role"
                        control={control}
                        errMsg={errors?.role?.message}
                        options={[
                            { label: "Customer", value: "customer" }
                        ]}
                    />
                </div>
            </div>

            {/* Gender Field */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <label className="md:col-span-2 text-sm font-medium">Gender</label>
                <div className="md:col-span-3">
                    <RadioOption
                        name="gender"
                        control={control}
                        errMsg={errors?.gender?.message}
                        options={[
                            { label: "Male", value: "male" },
                            { label: "Female", value: "female" },
                            { label: "Other", value: "other" }
                        ]}
                    />
                </div>
            </div>

            {/* Address Field */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <label className="md:col-span-2 text-sm font-medium">Address</label>
                <div className="md:col-span-3">
                    <TextAreaInput
                        name="address"
                        control={control}
                         errMsg={errors?.address?.message}
                    />
                </div>
            </div>

            {/* Phone Field */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <label className="md:col-span-2 text-sm font-medium">Phone</label>
                <div className="md:col-span-3">
                    <TextInput
                        name="phone"
                        control={control}
                        errMsg={errors?.phone?.message}
                    />
                </div>
            </div>

            {/* Image Field */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <label className="md:col-span-2 text-sm font-medium">Profile Image</label>
                <div className="md:col-span-3">
                    <FileUpload
                        name="image"
                        setValue={(name, value) => setValue(name as any, value)}
                        control={control}
                        errMsg={errors?.image?.message as string}
                    />
                </div>
            </div>

            {/* Submit Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4">
                <div className="md:col-start-3 md:col-span-3 flex gap-4">
                    <button
                        type="reset"
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Registering..." : "Register"}
                    </button>
                </div>
            </div>

            <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-teal-600 hover:underline">
                    Login here
                </Link>
            </div>
        </form>
    );
};

export default RegisterForm;