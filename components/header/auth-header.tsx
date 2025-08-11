import Image from "next/image"
import Link from "next/link"
import { FaSearch, FaShoppingCart } from "react-icons/fa"

const AuthHeader = () => {
    return (<>
    <header className="bg-gray-200">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <Link className="block text-teal-600" href="/customer">
              <span className="sr-only">Home</span>
              <Image
                src={"/images/logo.png"}
                width={60}
                height={50}
                alt="" 
                className="w-full"
              />
            </Link>
          </div>

          <div className="md:flex md:items-center md:gap-12">
            <nav aria-label="Global" className="hidden md:block">
              <ul className="flex items-center gap-6 text-sm">
                <li>
                  <Link className="text-gray-500 transition hover:text-gray-500/75" href="/about"> BECOME A SELLER </Link>
                </li>
                <li>
                  <a className="text-gray-500 transition hover:text-gray-500/75" href="#"> HELP & SUPPORT </a>
                </li>
                <li>
                  <a className="text-gray-500 transition hover:text-gray-500/75" href="#"> History </a>
                </li>
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <div className="block md:hidden">
                <button
                  className="rounded-sm bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar Row - Added below the first column */}
        <div className="flex items-center justify-center py-3">
          <div className="relative flex-1 max-w-xl mr-4">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600">
              <FaSearch />
            </button>
          </div>
          <button className="relative p-2 text-gray-700 hover:text-teal-600">
            <FaShoppingCart size={20} />
            <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
    </>)
}

export default AuthHeader;