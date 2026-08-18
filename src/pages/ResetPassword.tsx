// ResetPassword v2.0
// Changelog v2.0 — LE LIEN DE RÉINITIALISATION NE FONCTIONNAIT PAS.
//   La v1 lisait les jetons dans la CHAÎNE DE REQUÊTE (searchParams). Supabase
//   ne les met jamais là : le lien du mail pointe vers /auth/v1/verify, qui
//   vérifie le jeton puis redirige ici en plaçant les identifiants dans le
//   FRAGMENT, après le dièse. useSearchParams ne voit rien après le dièse, donc
//   accessToken valait null, la garde échouait, et la page affichait « Lien
//   invalide » avant de rediriger. C'est le symptôme du 18/08 : la page apparaît
//   une seconde puis disparaît.
//   Deuxième défaut : le client Supabase consomme ce fragment TOUT SEUL au
//   chargement et nettoie l'URL. Même en lisant au bon endroit, on pouvait
//   arriver après lui. Chercher les jetons à la main était doublement voué à
//   l'échec : v2.0 DEMANDE la session et écoute PASSWORD_RECOVERY.
//   Aussi : règles de mot de passe partagées avec l'inscription, affichées en
//   direct, et un écran explicite quand le lien est périmé au lieu d'une
//   redirection sèche.
// ResetPassword v1.0
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { REGLES_MOT_DE_PASSE, motDePasseValide, messageMotDePasse } from '@/utils/passwordRules';

type EtatLien = 'verification' | 'valide' | 'invalide';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [etatLien, setEtatLien] = useState<EtatLien>('verification');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    document.title = "Réinitialiser le mot de passe - MyCrazyFamily";
    let annule = false;

    // Le client Supabase consomme le fragment de lui-même : on l'écoute plutôt
    // que de courir après les jetons.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (annule) return;
      if (event === 'PASSWORD_RECOVERY' || (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION'))) {
        setEtatLien('valide');
      }
    });

    const verifier = async () => {
      // 1. La session est-elle deja etablie ?
      const { data: { session } } = await supabase.auth.getSession();
      if (annule) return;
      if (session) { setEtatLien('valide'); return; }

      // 2. Tolerance : des jetons trainent-ils dans l'URL ? Fragment d'abord,
      //    puis chaine de requete, pour couvrir les deux formats de gabarit.
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const query = new URLSearchParams(window.location.search);
      const accessToken = hash.get('access_token') || query.get('access_token');
      const refreshToken = hash.get('refresh_token') || query.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (annule) return;
        setEtatLien(error ? 'invalide' : 'valide');
        return;
      }

      // 3. Delai de grace : le client peut etre en train de traiter le fragment.
      setTimeout(async () => {
        if (annule) return;
        const { data: { session: tardive } } = await supabase.auth.getSession();
        if (annule) return;
        setEtatLien(tardive ? 'valide' : 'invalide');
      }, 1500);
    };

    verifier();
    return () => { annule = true; subscription.unsubscribe(); };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!motDePasseValide(formData.password)) {
      toast.error(messageMotDePasse(formData.password));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        toast.error(error.message || "Erreur lors de la mise à jour du mot de passe");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        login({ email: session.user.email || '', isAuthenticated: true });
        toast.success("Votre mot de passe a bien été modifié.");
        navigate('/espace-famille', { replace: true });
      } else {
        toast.success("Mot de passe modifié. Connectez-vous avec votre nouveau mot de passe.");
        navigate('/authentification', { replace: true });
      }
    } catch (err) {
      console.error('Erreur inattendue:', err);
      toast.error("Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (etatLien === 'verification') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Loader2 className="h-6 w-6 animate-spin text-mcf-primary" aria-label="Vérification du lien" />
      </div>
    );
  }

  // v2.0 — on explique au lieu de rediriger sèchement. Un lien périmé est le cas
  // le plus courant, et le parent doit comprendre qu'il lui suffit d'en
  // redemander un, pas croire que son compte a un problème.
  if (etatLien === 'invalide') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Ce lien n'est plus valable</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Les liens de réinitialisation expirent au bout d'une heure et ne peuvent servir
              qu'une seule fois. Demandez-en un nouveau depuis la page de connexion, il arrivera
              dans la minute.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/authentification', { replace: true })}
              className="w-full bg-mcf-primary hover:bg-mcf-primary-dark text-white"
            >
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Nouveau mot de passe</CardTitle>
          <CardDescription>
            Veuillez saisir votre nouveau mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* v2.0 — les règles passent au vert à mesure. Plus efficace qu'une
                  erreur après coup : le parent voit ce qu'il lui reste à faire. */}
              <ul className="space-y-1 pt-1">
                {REGLES_MOT_DE_PASSE.map((regle) => {
                  const ok = regle.verifie(formData.password);
                  return (
                    <li key={regle.cle} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-mcf-secondary' : 'text-muted-foreground'}`}>
                      {ok ? <Check className="h-3 w-3 flex-shrink-0" /> : <X className="h-3 w-3 flex-shrink-0 opacity-40" />}
                      {regle.libelle}
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Retapez votre mot de passe"
                  className="pl-10 pr-10"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-mcf-orange hover:bg-mcf-orange-dark"
              disabled={isLoading || !motDePasseValide(formData.password) || formData.password !== formData.confirmPassword}
            >
              {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
