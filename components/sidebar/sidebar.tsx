'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowUp } from 'lucide-react'
import catSvc, { ICatData } from '@/lib/category'

const Sidebar = () => {
    const [categories, setCategories] = useState<ICatData[]>([])
    const [showCategories, setShowCategories] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Fetch categories
        const fetchCategories = async () => {
            try {
                const data = await catSvc.getAllCatList()
                setCategories(data)
            } catch (error) {
                console.error('Error fetching categories:', error)
            }
        }
        fetchCategories()

        // Scroll visibility handler
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        })
    }

    return (
        <div className="fixed right-6 bottom-6 z-50 flex flex-col items-start gap-4">
            {/* Categories Button and Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setShowCategories(!showCategories)}
                    className="p-3 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-colors"
                >
                    Categories
                </button>

                {showCategories && (
                    <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden">
                        {categories.map((category) => (
                            <Link
                                key={category._id}
                                href={`/category/${category.slug}`}
                                className="block px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                                onClick={() => setShowCategories(false)}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Scroll Buttons - Only show when scrolled down */}
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                    title="Scroll to top"
                >
                    <ArrowUp size={20} />
                </button>
            )}

            <button
                onClick={scrollToBottom}
                className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                title="Scroll to bottom"
            >
                <ArrowDown size={20} />
            </button>
        </div>
    )
}

export default Sidebar