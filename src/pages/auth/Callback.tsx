
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import LoadingCallback from '@/components/auth/LoadingCallback';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

console.log('🔥 Callback.tsx: composant importé avec succès');
console.log('🛠️ Forcing push of Callback.tsx');

const Callback = () => {
  console.log('Callback page component RECREATED and loaded');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    document.title = "Bienvenue - MyCrazyFamily";
    console.log('🚀 Callback.tsx: useEffect lancé');
    
    const handleCallback = async () => {
      console.log('📡 Callback.tsx: Début handleCallback');
      try {
        // Check if this is a password reset callback
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');
        
        console.log('🔍 URL params detected:', { type, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
        
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('🔑 Password reset callback detected - showing reset form');
          // Important: Don't call getSession() or setSession() here
          // This would automatically log the user in
          setIsPasswordReset(true);
          return;
        }
        
        console.log('Starting auth callback process');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('✅ Session récupérée', session);
        
        if (sessionError) {
          console.error('❌ Erreur session', sessionError.message);
          throw new Error(sessionError.message);
        }

        if (!session?.user) {
          console.warn('⚠️ Pas de user dans la session');
          throw new Error("Utilisateur non connecté.");
        }

        console.log('User authenticated:', session.user.email);

        // Check if user profile already exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select()
          .eq('id', session.user.id)
          .single();
          
        console.log('📄 Profil existant ?', existingProfile);

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
            console.error('❌ Erreur insert user_profiles', insertError.message);
            throw new Error(insertError.message);
          }
          
          console.log('✅ Profil utilisateur créé !');
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

  if (isPasswordReset) {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    return <ResetPasswordForm accessToken={accessToken} refreshToken={refreshToken} />;
  }

  return (
  <>
    {console.log("✅ Callback.tsx: le composant est bien monté (return)")}
    <LoadingCallback />
  </>
);
};

export default Callback;
