// CheckEmail v2.0
// Changelog v2.0 :
//   (a) MENTION DES INDÉSIRABLES. C'était l'objet du chantier : le parent qui ne
//       voit rien arriver n'a aucune piste. La phrase vient APRÈS l'essentiel et
//       ne dramatise pas, comme le font les sites de référence.
//   (b) L'ADRESSE EST RAPPELÉE, transmise par useAuthForm via l'état de
//       navigation. C'est ce qui attrape les fautes de frappe, première cause de
//       « je n'ai rien reçu ». Si l'adresse manque (accès direct à l'URL), le
//       texte reste correct sans elle.
//   (c) DOUBLON D'ENVELOPPE CORRIGÉ. Deux icônes étaient superposées en absolu,
//       la seconde révélée au survol : sur mobile, sans survol possible, le
//       comportement était erratique, et sur ordinateur les deux se voyaient
//       pendant la transition. Une seule icône désormais.
//   (d) VOUVOIEMENT, pour s'aligner sur le reste du site.
//   (e) « Vous aviez déjà un compte ? » — Supabase n'envoie AUCUN mail quand
//       l'adresse a déjà un compte confirmé, et ne le dit pas, pour empêcher de
//       tester des adresses et découvrir qui est client. Le parent concerné
//       attend donc un mail qui ne viendra jamais. Cette ligne s'affiche pour
//       TOUT LE MONDE : elle n'apprend rien à un inconnu, mais donne à celui qui
//       est concerné exactement l'indice qu'il lui faut.
//   (f) La balise <head> imbriquée a été retirée : elle n'a aucun effet dans un
//       composant React, seul document.title fonctionnait.
// CheckEmail v1.0
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const CheckEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;

  useEffect(() => {
    document.title = "Vérifiez votre email - My Crazy Family";
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="max-w-md w-full space-y-8">
        <Button
          variant="ghost"
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate('/');
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-mcf-primary hover:bg-mcf-mint/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-none">
          <CardContent className="pt-6 px-6 pb-8 space-y-6">
            {/* v2.0 (c) — une seule icône. Les deux enveloppes superposées en
                absolu se chevauchaient pendant la transition, et le survol
                n'existe pas sur mobile. */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-mcf-mint/30 flex items-center justify-center">
                <MailCheck className="h-8 w-8 text-mcf-secondary" strokeWidth={2.5} />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-mcf-primary">
                Vérifiez votre boîte mail
              </h1>

              <p className="text-gray-600 leading-relaxed">
                {email ? (
                  <>
                    Nous venons d'envoyer un lien de confirmation à{' '}
                    <span className="font-semibold text-mcf-primary break-all">{email}</span>.
                    Cliquez dessus pour activer votre compte.
                  </>
                ) : (
                  <>
                    Nous venons d'envoyer un lien de confirmation à votre adresse email.
                    Cliquez dessus pour activer votre compte.
                  </>
                )}
              </p>

              {/* v2.0 (a) — après l'essentiel, sans dramatiser. */}
              <p className="text-sm text-gray-500 leading-relaxed">
                Le message arrive en général en moins d'une minute. Il lui arrive de se glisser
                dans les indésirables : pensez à y jeter un œil.
              </p>
            </div>

            {/* v2.0 (e) — voir l'explication en tête de fichier. */}
            <div className="pt-4 border-t border-mcf-mint/40 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Vous aviez déjà un compte ?{' '}
                <Link
                  to="/authentification"
                  className="font-semibold text-mcf-primary hover:underline"
                >
                  Connectez-vous
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                Ce n'est pas la bonne adresse ? Revenez en arrière pour la corriger.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckEmail;
