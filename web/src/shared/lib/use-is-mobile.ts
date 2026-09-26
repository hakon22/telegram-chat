import { useEffect, useState } from 'react';

const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

const readIsMobile = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
};

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(readIsMobile);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);
    const onChange = (): void => {
      setIsMobile(mediaQueryList.matches);
    };

    mediaQueryList.addEventListener('change', onChange);

    return () => {
      mediaQueryList.removeEventListener('change', onChange);
    };
  }, []);

  return isMobile;
};
