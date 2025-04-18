
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AuthLoader from '@/components/AuthLoader';

const Callback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Connexion en cours - MyCrazyFamily";
    
    const handleCallback = async () => {
      try {
        // Get session after email confirmation
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!session?.user) {
          throw new Error("Utilisateur non connecté.");
        }

        // Check if user profile already exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select()
          .eq('id', session.user.id)
          .single();

        // Only create profile if it doesn't exist
        if (!existingProfile) {
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
            throw new Error(insertError.message);
          }
        }

        // Update auth context
        login({
          email: session.user.email || '',
          isAuthenticated: true,
        });

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

  return (
    <>
      <head>
        <meta name="description" content="Confirmation de votre compte MyCrazyFamily en cours..." />
      </head>

      <AuthLoader 
        message={error || "Connexion en cours..."}
      />
    </>
  );
};

export default Callback;
