import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState<boolean>(window.innerWidth > 768 && window.innerWidth <= 1024);
  const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
      setIsDesktop(window.innerWidth > 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet, isDesktop };
};

export const useViewportHeight = (): void => {
  useEffect(() => {
    const updateVH = (): void => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    updateVH();
    
    const handleResize = (): void => updateVH();
    const handleOrientation = (): void => {
      setTimeout(updateVH, 100);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientation);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, []);
};
