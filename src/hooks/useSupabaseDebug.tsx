
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/components/debug/UserProfilesTable';

export const useSupabaseDebug = () => {
  const { isAuthenticated, user } = useAuth();
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabaseAuthUser, setSupabaseAuthUser] = useState<any | null>(null);
  const [supabaseSession, setSupabaseSession] = useState<any | null>(null);

  const fetchUserProfiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching user profiles...');
      console.log('Authentication status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
      console.log('Current user:', user);
      
      const { data: userData } = await supabase.auth.getUser();
      const { data: sessionData } = await supabase.auth.getSession();
      
      console.log('Supabase auth user:', userData);
      console.log('Supabase session:', sessionData);
      
      setSupabaseAuthUser(userData?.user || null);
      setSupabaseSession(sessionData?.session || null);
      
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (fetchError) {
        console.error('Error fetching user profiles:', fetchError);
        setError(fetchError.message);
        toast.error(`Erreur lors de la récupération des profils : ${fetchError.message}`);
      } else {
        console.log('User profiles fetched successfully:', data);
        setUserProfiles(data || []);
        toast.success(`${data?.length || 0} profil(s) récupéré(s)`);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      toast.error('Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Initial auth state:', { 
      isAuthenticated, 
      user,
      supabaseUrl: 'https://rjbmhcoctpwmlqndzybm.supabase.co'
    });
    
    const fetchAuthState = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: sessionData } = await supabase.auth.getSession();
      
      setSupabaseAuthUser(userData?.user || null);
      setSupabaseSession(sessionData?.session || null);
      
      console.log('Component mount - Supabase auth user:', userData);
      console.log('Component mount - Supabase session:', sessionData);
    };
    
    fetchAuthState();
  }, [isAuthenticated, user]);

  return {
    userProfiles,
    isLoading,
    error,
    supabaseAuthUser,
    supabaseSession,
    fetchUserProfiles
  };
};
