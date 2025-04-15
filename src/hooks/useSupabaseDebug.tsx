
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

  const createUserProfile = async (firstName: string, role: string, familyId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!supabaseAuthUser) {
        throw new Error('Vous devez être connecté pour créer un profil');
      }
      
      const { data, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: supabaseAuthUser.id,
          first_name: firstName,
          role: role,
          family_id: familyId
        })
        .select();
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        setError(insertError.message);
        toast.error(`Erreur lors de la création du profil : ${insertError.message}`);
        return null;
      } else {
        console.log('User profile created successfully:', data);
        toast.success('Profil créé avec succès');
        
        // Rafraîchir la liste des profils
        await fetchUserProfiles();
        return data;
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      toast.error('Une erreur inattendue est survenue');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (id: string, firstName: string, role: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!supabaseAuthUser) {
        throw new Error('Vous devez être connecté pour modifier un profil');
      }
      
      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          first_name: firstName,
          role: role
        })
        .eq('id', id)
        .select();
      
      if (updateError) {
        console.error('Error updating user profile:', updateError);
        setError(updateError.message);
        toast.error(`Erreur lors de la mise à jour du profil : ${updateError.message}`);
        return null;
      } else {
        console.log('User profile updated successfully:', data);
        toast.success('Profil mis à jour avec succès');
        
        // Rafraîchir la liste des profils
        await fetchUserProfiles();
        return data;
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      toast.error('Une erreur inattendue est survenue');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUserProfile = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!supabaseAuthUser) {
        throw new Error('Vous devez être connecté pour supprimer un profil');
      }
      
      const { error: deleteError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Error deleting user profile:', deleteError);
        setError(deleteError.message);
        toast.error(`Erreur lors de la suppression du profil : ${deleteError.message}`);
        return false;
      } else {
        console.log('User profile deleted successfully');
        toast.success('Profil supprimé avec succès');
        
        // Rafraîchir la liste des profils
        await fetchUserProfiles();
        return true;
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      toast.error('Une erreur inattendue est survenue');
      return false;
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
    fetchUserProfiles,
    createUserProfile,
    updateUserProfile,
    deleteUserProfile
  };
};
