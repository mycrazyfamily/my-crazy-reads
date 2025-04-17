
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';

// Define the missing interface
interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const mapSupabaseSignupError = (errorMessage: string) => {
  const errorMap: { [key: string]: string } = {
    'User already exists': 'Un compte existe déjà avec cette adresse email.',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
    'invalid_email': 'Adresse email invalide. Veuillez vérifier votre saisie.',
    'rate_limit': 'Trop de tentatives. Veuillez réessayer plus tard.',
    'Invalid login credentials': 'Les identifiants sont invalides.',
  };

  for (const [key, message] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) return message;
  }

  return `Une erreur inattendue est survenue : ${errorMessage}`;
};

export const useAuthForm = (redirectPath = '/espace-famille') => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        console.error('Erreur de connexion:', error);
        toast.error(error.message || "Erreur lors de la connexion");
        return;
      }
      
      console.log('auth.user', await supabase.auth.getUser());
      console.log('auth.session', await supabase.auth.getSession());
      
      if (data.user) {
        login({
          email: data.user.email || formData.email,
          isAuthenticated: true,
        });
        
        toast.success("Connexion réussie !");
        navigate('/debug-supabase');
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      toast.error("Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('[Signup] Tentative d\'inscription avec email:', formData.email);
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        }
      });
      
      console.log('[Signup] Data retournées par signUp:', JSON.stringify(signUpData, null, 2));
      console.log('[Signup] Erreur retournée par signUp:', JSON.stringify(signUpError, null, 2));
      
      if (signUpError) {
        console.error('[Signup] Erreur d\'inscription:', signUpError);
        const userFriendlyMessage = mapSupabaseSignupError(signUpError.message);
        toast.error(userFriendlyMessage);
        return;
      }
      
      const user = signUpData?.user;
      
      if (!user) {
        toast.error("Un problème est survenu lors de la création de votre compte. Veuillez réessayer.");
        return;
      }
      
      const { error: insertError } = await supabase.from('user_profiles').insert({
        id: user.id,
        created_at: new Date().toISOString(),
        family_id: crypto.randomUUID(), // Génère un UUID côté client
      });
      
      if (insertError) {
        console.error('Erreur insertion user_profiles :', insertError);
        toast.error('Erreur lors de la création de votre profil. Veuillez contacter le support.');
        return;
      }
      
      console.log('[Signup] Profil utilisateur créé avec succès');
      
      login({
        email: user.email || formData.email,
        isAuthenticated: true,
      });
      
      toast.success('Compte et profil créés avec succès ✅');
      navigate('/debug-supabase');
    } catch (err) {
      console.error('[Signup] Erreur inattendue:', err);
      toast.error("Une erreur inattendue est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Veuillez saisir une adresse email valide.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        }
      });
      
      if (error) {
        console.error('Erreur d\'envoi du lien magique:', error);
        toast.error(error.message || "Erreur lors de l'envoi du lien magique");
        return;
      }
      
      setMagicLinkSent(true);
      toast.success("Un lien de connexion a été envoyé à votre adresse email.");
    } catch (err) {
      console.error('Erreur inattendue:', err);
      toast.error("Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    login({
      email: 'guest',
      isAuthenticated: true,
      isTemporary: true
    });
    toast.success("Compte temporaire créé. Vous pourrez le sauvegarder plus tard.");
    navigate('/debug-supabase');
  };

  return {
    formData,
    isLoading,
    magicLinkSent,
    setMagicLinkSent,
    handleInputChange,
    handleLogin,
    handleRegister,
    handleMagicLink,
    handleSkip
  };
};
