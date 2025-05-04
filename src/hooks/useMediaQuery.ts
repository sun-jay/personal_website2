import { useState, useEffect } from 'react';

/**
 * Custom hook that uses the MediaQueryList API to determine if the document
 * matches the provided media query string.
 * 
 * @param query - A media query string like '(max-width: 767px)'
 * @returns boolean indicating if the media query matches
 */
const useMediaQuery = (query: string): boolean => {
  // Initialize with a sensible default - query will be evaluated on mount
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create a media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set the initial value
    setMatches(mediaQuery.matches);

    // Define listener function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add the listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery; 