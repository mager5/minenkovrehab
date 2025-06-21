import { useState, useEffect } from 'react';

export function useRetina(): boolean {
  const [isRetina, setIsRetina] = useState(false);

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      // Check for retina display
      const isRetinaDisplay = window.devicePixelRatio > 1;
      setIsRetina(isRetinaDisplay);
    }
  }, []);

  return isRetina;
}
