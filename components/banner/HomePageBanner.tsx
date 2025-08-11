'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BanSvc, { IBanner } from '@/lib/banner.service';

const HomePageBanner = () => {
  const [data, setBanners] = useState<IBanner[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setStatus('loading');
        const result = await BanSvc.getAllBannerList();
        setBanners(result);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to load banners');
      }
    };

    fetchData();
  }, []);

  if (status === 'loading') {
    return <div className="w-full h-64 md:h-96 flex items-center justify-center">Loading banners...</div>;
  }

  if (status === 'error') {
    return <div className="w-full h-64 md:h-96 flex items-center justify-center">Error: {error}</div>;
  }

  if (!data.length) {
    return <div className="w-full h-64 md:h-96 flex items-center justify-center">No banners found</div>;
  }

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg shadow">
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {
        data && data.map((banner: IBanner) => (
          <div key={banner._id} className="w-full flex-shrink-0 h-full relative">
            <Link href={banner.url || '#'} className="block h-full">
              <Image
                src={banner.image?.thumbUrl}
                alt={banner.title}
                fill
                quality={85}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </Link>
          </div>
        ))}

      </div>

    </div>
  );
};

export default HomePageBanner;
