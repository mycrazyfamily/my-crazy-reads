
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';

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
        
        navigate('/espace-famille');
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
    setIsLoading(true);
    
    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Les mots de passe ne correspondent pas.");
        setIsLoading(false);
        return;
      }
      
      const rawEmail = formData.email;
      const cleanedEmail = typeof rawEmail === 'string'
        ? rawEmail.trim().toLowerCase().replace(/^"+|"+$/g, '')
        : '';

      const { data, error } = await supabase.auth.signUp({
        email: cleanedEmail,
        password: formData.password,
        options: {
          emailRedirectTo: 'https://mycrazyfamily.lovable.app/auth/callback',
        }
      });

      if (error) {
        const errorMessage = mapSupabaseSignupError(error.message);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      navigate('/check-email');
      
      setFormData({
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('❌ Erreur inscription:', err);
      toast.error("Une erreur inattendue est survenue lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Veuillez saisir une adresse email valide.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('Erreur de réinitialisation:', error);
        toast.error(error.message || "Erreur lors de l'envoi du lien de réinitialisation");
        return;
      }
      
      
    } catch (err) {
      console.error('Erreur inattendue:', err);
      toast.error("Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    login({
      email: 'Ma famille',
      isAuthenticated: true,
      isTemporary: true
    });
    navigate('/espace-famille');
  };

  return {
    formData,
    isLoading,
    handleInputChange,
    handleLogin,
    handleRegister,
    handleResetPassword,
    handleSkip
  };
};
