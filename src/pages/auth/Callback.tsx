
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import LoadingCallback from '@/components/auth/LoadingCallback';

const Callback = () => {
  console.log('Callback page component RECREATED and loaded');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Bienvenue - MyCrazyFamily";
    console.log('Callback page effect running');
    
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback process');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error(sessionError.message);
        }

        if (!session?.user) {
          console.error('No user in session');
          throw new Error("Utilisateur non connecté.");
        }

        console.log('User authenticated:', session.user.email);

        // Check if user profile already exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select()
          .eq('id', session.user.id)
          .single();

        // Only create profile if it doesn't exist
        if (!existingProfile) {
          console.log('Creating new user profile');
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: session.user.id,
                family_id: null,
                role: 'Parent',
                created_at: new Date().toISOString()
              }
            ]);

          if (insertError) {
            console.error('Profile creation error:', insertError);
            throw new Error(insertError.message);
          }
        }

        // Update auth context
        login({
          email: session.user.email || '',
          isAuthenticated: true,
        });

        console.log('Authentication successful - redirecting to family dashboard');
        toast.success("Bienvenue dans l'aventure !");
        navigate('/espace-famille');
      } catch (error) {
        console.error('Error in auth callback:', error);
        const message = error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.";
        setError(message);
        toast.error(message);
        navigate('/authentification');
      }
    };

    handleCallback();
  }, [login, navigate]);

  if (error) {
    return null;
  }

  return (
  <>
    {console.log("✅ Callback.tsx: le composant est bien monté")}
    <LoadingCallback />
  </>
);
};

export default Callback;
