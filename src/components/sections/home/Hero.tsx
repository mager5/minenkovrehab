import React from 'react';
import Image from 'next/image';

interface HeroProps {
  title: string;
  subtitle?: string;
  desktopImage: string;
  mobileImage: string;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle, desktopImage, mobileImage }) => {
  return (
    <div className="hero-section relative">
      {/* Desktop Image */}
      <Image
        src={desktopImage}
        alt={title}
        fill
        className="hidden md:block object-cover"
        priority
      />
      
      {/* Mobile Image */}
      <Image
        src={mobileImage}
        alt={title}
        fill
        className="block md:hidden object-cover"
        priority
      />
      
      <div className="container mx-auto px-4 relative z-10 py-20 md:py-32">
        <h1 className="hero-title text-white text-center mb-4">{title}</h1>
        {subtitle && (
          <p className="text-white text-center text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default Hero; 