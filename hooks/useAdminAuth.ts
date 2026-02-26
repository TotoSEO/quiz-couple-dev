import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_TOKEN_KEY = 'admin_session_token';
const ADMIN_TOKEN_EXPIRY_KEY = 'admin_session_expiry';
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if session is valid on mount
  useEffect(() => {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const expiry = sessionStorage.getItem(ADMIN_TOKEN_EXPIRY_KEY);
    
    if (token && expiry && Date.now() < parseInt(expiry)) {
      setIsAuthenticated(true);
    } else {
      // Clear expired session
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-admin', {
        body: { password }
      });

      if (fnError) {
        setError('Erreur de connexion au serveur');
        setIsLoading(false);
        return false;
      }

      if (!data.success) {
        setError(data.error || 'Mot de passe incorrect');
        setIsLoading(false);
        return false;
      }

      // Store token in sessionStorage (not localStorage for security)
      const expiry = Date.now() + SESSION_DURATION;
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      sessionStorage.setItem(ADMIN_TOKEN_EXPIRY_KEY, expiry.toString());
      
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError('Erreur inattendue');
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
    setIsAuthenticated(false);
  }, []);

  const getToken = useCallback((): string | null => {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const expiry = sessionStorage.getItem(ADMIN_TOKEN_EXPIRY_KEY);
    
    if (token && expiry && Date.now() < parseInt(expiry)) {
      return token;
    }
    
    // Session expired
    logout();
    return null;
  }, [logout]);

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    getToken
  };
};
