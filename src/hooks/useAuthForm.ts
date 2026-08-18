// useAuthForm v1.4
// Changelog v1.4 : paramètre `initialEmail`, pour pré-remplir l'adresse quand le
//   parent arrive depuis /check-email par le lien « Vous aviez déjà un compte ».
// useAuthForm v1.3
// Changelog v1.3 :
//   (a) « MOT DE PASSE OUBLIÉ » NE FAISAIT RIEN. La branche de succès de
//       handleResetPassword était littéralement vide : le mail partait, l'écran
//       ne bougeait pas. Le parent recliquait et tombait sur le message de
//       limitation de Supabase, en anglais. On expose maintenant resetEmailSent.
//   (b) URL DE CONFIRMATION DYNAMIQUE. emailRedirectTo était codé en dur sur
//       mycrazyfamily.lovable.app, absent de la liste blanche Supabase : les
//       liens repartaient donc vers my-crazy-reads.vercel.app. window.location.origin.
//   (c) RÈGLES DE MOT DE PASSE (@/utils/passwordRules), partagées avec l'écran
//       de réinitialisation. Supabase n'imposait que 6 caractères.
//   (d) MESSAGES SUPABASE TRADUITS, y compris ceux de la connexion, qui
//       affichaient le message brut en anglais.
//   (e) L'adresse saisie est transmise à /check-email, qui la rappelle au parent.
// useAuthForm v1.2
// Changelog v1.2 : le paramètre `redirectPath` était déclaré mais jamais lu — la destination
//   post-connexion était écrite en dur. Un appel du type useAuthForm('/abonnement') aurait été
//   ignoré EN SILENCE. Il est désormais utilisé par handleLogin et handleSkip (les deux chemins
//   qui mènent l'utilisateur « après authentification »). Aucun changement de comportement
//   aujourd'hui : l'unique appelant, Authentication.tsx, appelle useAuthForm() sans argument, donc
//   la valeur par défaut '/espace-famille' s'applique — vérifié par recherche dans le repo.
//   handleRegister garde '/check-email' en dur : c'est une étape de vérification d'e-mail, pas la
//   destination finale de l'utilisateur.
// useAuthForm v1.1
// Changelog v1.1 (D4 — retour arrière après connexion) : les redirections post-authentification
//   empilaient une entrée d'historique, donc « précédent » depuis l'espace famille ramenait sur
//   /authentification — formulaire vide, impression d'être déconnecté alors que la session est
//   active. Elles utilisent désormais { replace: true } : la page de connexion sort de
//   l'historique et « précédent » ramène là où l'utilisateur était avant de se connecter
//   (convention standard). Appliqué à la connexion, à l'inscription et au mode temporaire.
// NOTE (non corrigé volontairement) : le paramètre `redirectPath` de ce hook n'est utilisé nulle
//   part — handleLogin écrit '/espace-famille' en dur. Le corriger changerait la destination pour
//   tout appelant qui passerait une valeur ; à trancher séparément.
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { motDePasseValide, messageMotDePasse } from '@/utils/passwordRules';

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
    // v1.3 — messages renvoyés en anglais par Supabase, vus par le parent tels
    // quels. « For security purposes, you can only request this after 50
    // seconds » s'affichait en anglais sur la page de connexion le 18/08.
    'For security purposes': "Vous venez de faire cette demande. Patientez une minute avant de réessayer.",
    'over_email_send_rate_limit': "Trop de messages envoyés. Patientez quelques minutes avant de réessayer.",
    'Email rate limit exceeded': "Trop de messages envoyés. Patientez quelques minutes avant de réessayer.",
    'Email not confirmed': "Votre adresse n'a pas encore été confirmée. Cherchez notre email de confirmation, y compris dans vos indésirables.",
    'same_password': "Votre nouveau mot de passe doit être différent de l'ancien.",
  };

  for (const [key, message] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) return message;
  }

  return `Une erreur inattendue est survenue : ${errorMessage}`;
};

/**
 * v1.4 — `initialEmail` pré-remplit le champ adresse.
 * Sert au parcours « vous aviez déjà un compte » : depuis /check-email, le
 * parent revient sur la connexion avec son adresse déjà saisie, il n'a plus que
 * son mot de passe à taper.
 * Aucune fuite d'information : le lien s'affiche pour TOUT LE MONDE et
 * pré-remplit toujours, que le compte existe ou non.
 */
export const useAuthForm = (redirectPath = '/espace-famille', initialEmail = '') => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  // v1.3 — adresse à laquelle un lien de réinitialisation vient d'être envoyé.
  // null tant qu'aucune demande n'a abouti ; le composant s'en sert pour
  // remplacer le formulaire par une confirmation.
  const [resetEmailSent, setResetEmailSent] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthFormData>({
    email: initialEmail,
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
        // v1.3 : on traduit au lieu d'afficher le message brut de Supabase.
        toast.error(mapSupabaseSignupError(error.message || ''));
        return;
      }
      
      console.log('auth.user', await supabase.auth.getUser());
      console.log('auth.session', await supabase.auth.getSession());
      
      if (data.user) {
        login({
          email: data.user.email || formData.email,
          isAuthenticated: true,
        });
        
        // D4 : replace → la page de connexion ne reste pas dans l'historique
        // v1.2 : on respecte enfin le paramètre redirectPath du hook
        navigate(redirectPath, { replace: true });
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
      // v1.3 — règles de mot de passe. Supabase n'imposait que 6 caractères,
      // sans contrainte de composition : « azerty » passait.
      if (!motDePasseValide(formData.password)) {
        toast.error(messageMotDePasse(formData.password));
        setIsLoading(false);
        return;
      }
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
          // v1.3 — l'URL était codée en dur sur mycrazyfamily.lovable.app, un
          // domaine absent de la liste blanche Supabase. Résultat : Supabase la
          // REFUSAIT et retombait sur sa Site URL (my-crazy-reads.vercel.app).
          // Le parent recevait donc un lien vers un déploiement Vercel, pas vers
          // mycrazyfamily.com. window.location.origin suit le domaine réel, en
          // production comme en préproduction.
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        const errorMessage = mapSupabaseSignupError(error.message);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      // v1.3 : l'adresse est transmise à /check-email, qui la rappelle au parent.
      // C'est ce qui attrape les fautes de frappe, première cause de « je n'ai
      // rien reçu ».
      // D4 : replace → « précédent » ne revient pas sur le formulaire d'inscription
      navigate('/check-email', { replace: true, state: { email: cleanedEmail } });
      
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

    const cleanedResetEmail = formData.email.trim().toLowerCase();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanedResetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('Erreur de réinitialisation:', error);
        toast.error(mapSupabaseSignupError(error.message || ''));
        return;
      }

      // v1.3 — LA BRANCHE DE SUCCÈS ÉTAIT VIDE. Le parent cliquait sur « Mot de
      // passe oublié », le mail partait, et l'écran ne bougeait pas d'un pixel :
      // il recliquait, et tombait sur le message de limitation en anglais.
      // On expose désormais l'état au composant, qui affiche une confirmation.
      // Formulation volontairement conditionnelle : elle ne révèle pas si un
      // compte existe à cette adresse, sinon n'importe qui pourrait tester des
      // adresses pour savoir qui est client.
      setResetEmailSent(cleanedResetEmail);
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
    // D4 : replace, même raison que pour la connexion
    // v1.2 : idem, on respecte redirectPath
    navigate(redirectPath, { replace: true });
  };

  return {
    formData,
    isLoading,
    resetEmailSent,
    clearResetEmailSent: () => setResetEmailSent(null),
    handleInputChange,
    handleLogin,
    handleRegister,
    handleResetPassword,
    handleSkip
  };
};
