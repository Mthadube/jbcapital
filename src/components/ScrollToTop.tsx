import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * 
 * This component automatically scrolls to the top of the page when:
 * 1. The route changes (using the location from react-router-dom)
 * 2. The component mounts
 *
 * Usage: Simply add this component to your app's root component
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

/**
 * Utility function to scroll to top
 * 
 * Can be used for:
 * - Tab changes within a component
 * - Manual scrolling within a page
 * 
 * @param smooth Whether to animate the scroll (smooth) or jump instantly (auto)
 */
export const scrollToTop = (smooth: boolean = true) => {
  window.scrollTo({ 
    top: 0, 
    behavior: smooth ? 'smooth' : 'auto' 
  });
}; 