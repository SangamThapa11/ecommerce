'use client'
import { useAuth } from "@/context/AuthContext"
import { Gender, UserRoles } from "@/config/constants"
import { Status } from "@/lib/constants"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const UserProfilePage = () => {
  const { loggedInUser } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (!loggedInUser) {
      router.push('/login')
    }
  }, [loggedInUser, router])

  
  const getRoleDisplay = (role: string) => {
    switch(role) {
      case UserRoles.ADMIN: return "Admin";
      case UserRoles.SELLER: return "Seller";
      case UserRoles.CUSTOMER: return "Customer";
      default: return role;
    }
  }

  const getGenderDisplay = (gender: string) => {
    switch(gender) {
      case Gender.MALE: return "Male";
      case Gender.FEMALE: return "Female";
      case Gender.OTHER: return "Other";
      default: return gender;
    }
  }

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case Status.ACTIVE: return "Active";
      case Status.INACTIVE: return "Inactive";
      default: return status;
    }
  }

  if (!isClient || !loggedInUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={loggedInUser.image || "/images/default-avatar.png"}
                  alt={loggedInUser.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-6 md:mt-0 md:ml-8 text-center md:text-left">
                <h1 className="text-3xl font-bold">{loggedInUser.name}</h1>
                <p className="text-purple-100 mt-2">{loggedInUser.email}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start mt-4 gap-2">
                  <span className="bg-purple-700 bg-opacity-70 px-3 py-1 rounded-full text-sm">
                    {getRoleDisplay(loggedInUser.role)}
                  </span>
                  <span className="bg-purple-700 bg-opacity-70 px-3 py-1 rounded-full text-sm">
                    {getGenderDisplay(loggedInUser.gender)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    loggedInUser.status === Status.ACTIVE 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {getStatusDisplay(loggedInUser.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          
          <div className="px-6 py-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="mt-1 text-lg text-gray-900">{loggedInUser.name}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                <p className="mt-1 text-lg text-gray-900">{loggedInUser.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                <p className="mt-1 text-lg text-gray-900">
                  {loggedInUser.phone || "Not provided"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                <p className="mt-1 text-lg text-gray-900">{getGenderDisplay(loggedInUser.gender)}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 text-lg text-gray-900">
                  {loggedInUser.address || "Not provided"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                <p className="mt-1 text-lg text-gray-900">{getStatusDisplay(loggedInUser.status)}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">User Role</h3>
                <p className="mt-1 text-lg text-gray-900">{getRoleDisplay(loggedInUser.role)}</p>
              </div>
            </div>
          </div>

          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => router.push('/profile/edit')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage