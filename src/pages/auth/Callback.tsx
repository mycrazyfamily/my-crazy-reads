
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
  const [resetTokens, setResetTokens] = useState<{ accessToken: string | null; refreshToken: string | null }>({
    accessToken: null,
    refreshToken: null
  });

  useEffect(() => {
    // Don't run auth logic if we already detected a password reset
    if (isPasswordReset) {
      return;
    }
    
    document.title = "Bienvenue - MyCrazyFamily";
    console.log('🚀 Callback.tsx: useEffect lancé');
    
    const handleCallback = async () => {
      console.log('📡 Callback.tsx: Début handleCallback');
      try {
        // Check if this is a password reset callback
        console.log('🔍 Full URL:', window.location.href);
        console.log('🔍 URL search:', window.location.search);
        console.log('🔍 URL hash:', window.location.hash);
        
        // Check both query string and hash fragment for parameters
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        let accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        let refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
        let type = urlParams.get('type') || hashParams.get('type');
        
        console.log('🔍 URL params detected:', { 
          type, 
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing',
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken 
        });
        
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('🔑 Password reset callback detected - showing reset form');
          // Store tokens to prevent losing them when URL changes
          setResetTokens({ accessToken, refreshToken });
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
  }, [login, navigate, isPasswordReset]);

  if (error) {
    return null;
  }

  if (isPasswordReset) {
    return <ResetPasswordForm accessToken={resetTokens.accessToken} refreshToken={resetTokens.refreshToken} />;
  }

  return (
  <>
    {console.log("✅ Callback.tsx: le composant est bien monté (return)")}
    <LoadingCallback />
  </>
);
};

export default Callback;
