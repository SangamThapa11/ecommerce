'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IBanner } from '@/lib/banner.service';

export default function BannerSlider({ banners }: { banners: IBanner[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Validate banners data
    useEffect(() => {
        if (!banners || banners.length === 0) {
            setError('No banners available');
            setIsLoading(false);
            return;
        }

        // Check if all images are valid
        const invalidBanners = banners.filter(b => !b.image?.imageUrl);
        if (invalidBanners.length > 0) {
            console.warn('Some banners have invalid images:', invalidBanners);
        }

        setIsLoading(false);
    }, [banners]);

    // Auto-rotation effect
    useEffect(() => {
        if (banners.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length]);

    if (isLoading) return <div className="flex justify-center"><BannerSkeleton /></div>;
    if (error) return <div className="flex justify-center"><BannerError message={error} /></div>;
    if (banners.length === 0) return null;

    return (
        <div className="flex justify-center w-full">
            <div className="relative w-full max-w-4xl aspect-[16/9] max-h-[40vh] overflow-hidden rounded-lg shadow-md my-6">
                {banners.map((banner, index) => {
                    if (!banner.image?.imageUrl) return null;
                    
                    return (
                        <Link 
                            key={banner._id} 
                            href={banner.url || '#'}
                            className={`absolute inset-0 transition-opacity duration-1000 flex justify-center items-center ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                            <div className="relative w-full h-full">
                                <Image
                                    src={banner.image.imageUrl}
                                    alt={banner.title || 'Promotional banner'}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                    onError={(e) => {
                                        console.error('Error loading banner image:', banner.image.imageUrl);
                                        e.currentTarget.src = '/default-banner.jpg';
                                    }}
                                />
                            </div>
                            {banner.title && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center p-6">
                                    <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold text-center">
                                        {banner.title}
                                    </h2>
                                </div>
                            )}
                        </Link>
                    );
                })}
                
                {/* Navigation controls */}
                {banners.length > 1 && (
                    <>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                            aria-label="Previous slide"
                        >
                            &lt;
                        </button>
                        <button 
                            onClick={() => setCurrentIndex(prev => (prev + 1) % banners.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                            aria-label="Next slide"
                        >
                            &gt;
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// Helper components
function BannerSkeleton() {
    return (
        <div className="w-full max-w-4xl aspect-[16/9] bg-gray-200 animate-pulse rounded-lg" />
    );
}

function BannerError({ message }: { message: string }) {
    return (
        <div className="w-full max-w-4xl aspect-[16/9] bg-gray-100 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">{message}</p>
        </div>
    );
}