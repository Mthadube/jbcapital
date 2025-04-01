import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppData } from './AppDataContext';
import { toast } from 'sonner';

/**
 * A hook to protect routes that require authentication
 * @param requireAdmin If true, checks if the user has an admin role
 * @returns boolean indicating if user is authenticated (and is admin if requireAdmin is true)
 */
export const useRequireAuth = (requireAdmin = false) => {
  const { currentUser, isAuthenticated, logout, checkAuth } = useAppData();
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      setIsChecking(true);
      // Verify token on route change
      const isValid = await checkAuth();
      
      if (!isValid) {
        toast.error('Authentication required', {
          description: requireAdmin ? 'Admin login required to access this page' : 'Please log in to access this page',
          duration: 5000
        });
        
        navigate('/login', { 
          state: { from: location, adminRequired: requireAdmin },
          replace: true 
        });
      } else if (requireAdmin && (!currentUser || currentUser.role !== 'admin')) {
        toast.error('Access denied', { 
          description: 'You need admin privileges to access this page. Please log in with an admin account.',
          duration: 5000
        });
        
        // Log out current user and redirect to admin login
        logout();
        navigate('/login', { 
          state: { adminRequired: true },
          replace: true 
        });
      }
      
      setIsChecking(false);
    };
    
    verifyAuth();
  }, [currentUser, navigate, location, requireAdmin, logout, checkAuth]);

  // Return whether the user is authenticated and has required permissions
  if (isChecking) return false;
  if (!isAuthenticated) return false;
  if (requireAdmin) return currentUser?.role === 'admin';
  return true;
}; 