import React, { useState, useEffect } from 'react';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const toggleVisibility = (): void => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[9999] w-12 h-12 bg-primary-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out flex items-center justify-center hover:scale-[1.05] active:scale-[0.97] active:opacity-80"
          aria-label="Scroll to top"
          type="button"
        >
          <i className="fas fa-arrow-up text-lg transition-transform duration-200"></i>
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
