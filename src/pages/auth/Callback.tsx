
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Callback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session after email confirmation
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!session?.user) {
          toast.error("Erreur : utilisateur non connecté.");
          navigate('/authentification');
          return;
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
        toast.error("Une erreur est survenue lors de la confirmation.");
        navigate('/authentification');
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mcf-cream">
      <div className="p-8 rounded-lg bg-white shadow-md text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-mcf-orange" />
            <p className="text-gray-600">Confirmation de votre compte en cours...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Callback;
