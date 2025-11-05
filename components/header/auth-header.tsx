'use client'
import { Dropdown, Space } from "antd"
import Image from "next/image"
import Link from "next/link"
import { AiOutlinePoweroff, AiOutlineUser } from "react-icons/ai"
import { FaSearch, FaShoppingCart } from "react-icons/fa"
import { createContext, Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import catSvc, { IProduct } from "@/lib/category"
import { Gender, UserRoles } from "@/config/constants"
import { Status } from "@/lib/constants"
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"


export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: UserRoles;
  gender: Gender;
  status: Status;
  address: string;
  phone: string,
  image: string,
}
interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  afterDiscount: number;
  discount: number;
  imageUrl: string;
  quantity: number;
  stock: number;
}
export const AuthContext = createContext({
  loggedInUser: null as UserProfile | null,
  setLoggedInUser: (() => { }) as Dispatch<SetStateAction<UserProfile | null>>
})
const AuthHeader = ({ role }: Readonly<{ role: UserRoles }>) => {
  const { loggedInUser, setLoggedInUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<IProduct[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter();

  // Handle search input changes with debounce
  const handleSearch = (query: string) => {
    setSearchQuery(query)

    // Clear previous timeout
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Only search if query has more than 2 characters
    if (query.length > 2) {
      setIsSearching(true)
      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await catSvc.searchProducts(query)
          const filteredResults = results.filter((product: IProduct) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(query.toLowerCase())) ||
            product.category.some((cat: { name: string; slug: string }) =>
              cat.name.toLowerCase().includes(query.toLowerCase())
            )
          )
          setSearchResults(filteredResults)
          setShowResults(true)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 1000)
    } else {
      setSearchResults([])
      setShowResults(false)
      setIsSearching(false)
    }
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getCategorySlug = (product: IProduct) => {
    // Simple fallback to first category
    return product.category[0]?.slug || 'all-products'
  }

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      const handleStorageChange = () => {
        const updatedCart = localStorage.getItem("cart");
        if (updatedCart) {
          setCartItems(JSON.parse(updatedCart));
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);
  return (<>
    <header className="bg-purple-500 ">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <Link className="block text-teal-600" href="/customer">
              <span className="sr-only">Home</span>
              <div className="relative w-16 h-12 md:w-20 md:h-14">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 64px, 80px"
                />
              </div>
            </Link>

          </div>

          <div className="md:flex md:items-center md:gap-12">
            <nav aria-label="Global" className="hidden md:block">
              <ul className="flex items-center gap-6 text-sm">
                <li>
                  <a className="text-white transition hover:text-gray-500/75" href="#"> HELP & SUPPORT </a>
                </li>
                <li>
                  <a className="text-white transition hover:text-gray-500/75" href="/order"> Your Orders </a>
                </li>
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <div className="block md:hidden">
                <button
                  className="rounded-sm bg-gray-100 p-2 text-white transition hover:text-gray-600/75"
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
            <Dropdown
              className="hover:cursor-pointer transition hover:scale-96 text-white"
              menu={{
                items: [
                  { key: "profile", label: <Link href="/profile">User Profile</Link>, icon: <AiOutlineUser /> },
                  //{ key: "logout", label: <Link href="/login">Logout</Link>, icon: <AiOutlineLogout /> }
                  {
                    key: "logout", label: <span onClick={() => {
                      localStorage.clear();
                      setLoggedInUser(null);
                      router.push('/login');
                    }}>Logout</span>, icon: <AiOutlinePoweroff />
                  }
                ]
              }}
            >
              <Space>
                <AiOutlineUser />
                {loggedInUser?.name || "User"}
              </Space>
            </Dropdown>
          </div>
        </div>

        {/* Search Bar Row */}
        <div className="flex items-center justify-center py-3">
          <div className="relative flex-1 max-w-xl mr-4" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 rounded-md text-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length > 2 && setShowResults(true)}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                ) : (
                  <FaSearch />
                )}
              </button>
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-center text-white">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <Link
                      key={product._id}
                      href={`/category/${getCategorySlug(product)}`}
                      className="flex items-center p-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                      onClick={() => setShowResults(false)}
                    >
                      <div className="flex-shrink-0 h-12 w-12">
                        <Image
                          src={product.images[0]?.imageUrl || "/placeholder-product.jpg"}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-teal-600">
                          Rs. {product.afterDiscount.toLocaleString()}
                          {product.discount > 0 && (
                            <span className="ml-2 text-xs text-red-500">
                              {product.discount}% OFF
                            </span>
                          )}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : searchQuery.length > 2 ? (
                  <div className="p-3 text-sm text-black">
                    No products found for "{searchQuery}"
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <Link href="/cart" className="relative p-2 text-black hover:text-rose-600">
            <FaShoppingCart size={20} />
            <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          </Link>
        </div>
      </div>
    </header>
  </>)
}

export default AuthHeader;