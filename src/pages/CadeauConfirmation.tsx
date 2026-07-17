// CadeauConfirmation.tsx v1.3
// v1.3: nuages non tronqués (boîte fixe, positions sûres) — rendu proche du mockup
// v1.2: mention email rétablie (workflow n8n cadeau désormais en place)
// v1.1: carte cadeau enrichie (dégradé + nuages) ; retrait de la mention email (workflow pas encore créé)
// v1.0: confirmation d'achat cadeau ; interroge get-gift-by-session (webhook asynchrone) puis affiche la carte cadeau réelle
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

type Gift = {
  code: string;
  durationMonths: number;
  purchaserName: string | null;
  giftMessage: string | null;
};

const MAX_ATTEMPTS = 12;
const POLL_INTERVAL_MS = 2000;

const Cloud: React.FC<{ style: React.CSSProperties; scale?: number }> = ({ style, scale = 1 }) => {
  const w = (n: number) => n * scale;
  const blob: React.CSSProperties = { position: 'absolute', borderRadius: '50%', background: 'rgba(255,255,255,0.92)' };
  return (
    <div aria-hidden style={{ position: 'absolute', width: w(96), height: w(48), pointerEvents: 'none', ...style }}>
      <div style={{ ...blob, width: w(42), height: w(42), left: w(27), top: w(4) }} />
      <div style={{ ...blob, width: w(28), height: w(28), left: w(56), top: w(14) }} />
      <div style={{ ...blob, width: w(28), height: w(28), left: w(10), top: w(16) }} />
      <div style={{ position: 'absolute', background: 'rgba(255,255,255,0.92)', borderRadius: w(14), width: w(84), height: w(18), left: w(6), top: w(28) }} />
    </div>
  );
};

const GiftCard: React.FC<{ gift: Gift }> = ({ gift }) => {
  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 520,
        margin: '0 auto',
        background: 'linear-gradient(160deg, #5AA0EA 0%, #4A90E2 55%, #3B82D6 100%)',
        borderRadius: 24,
        padding: '36px 28px',
        color: '#FFFFFF',
        textAlign: 'center',
        overflow: 'hidden',
        boxShadow: '0 18px 40px rgba(74,144,226,0.35)',
      }}
    >
      <Cloud style={{ top: 16, left: 28, opacity: 0.9 }} scale={1} />
      <Cloud style={{ top: 12, right: 24, opacity: 0.85 }} scale={0.85} />
      <Cloud style={{ bottom: 16, left: 22, opacity: 0.8 }} scale={0.8} />
      <Cloud style={{ bottom: 12, right: 28, opacity: 0.82 }} scale={0.95} />

      <div
        style={{
          position: 'absolute',
          inset: 12,
          border: '1px solid rgba(255,255,255,0.35)',
          borderRadius: 16,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 24, fontWeight: 700, margin: 0 }}>
          My Crazy Family
        </p>
        <p style={{ fontSize: 13, letterSpacing: 3, color: '#DCEBFB', margin: '6px 0 22px' }}>Carte cadeau</p>

        <p style={{ fontSize: 40, fontWeight: 500, margin: '0 0 20px' }}>{gift.durationMonths} mois offerts</p>

        <p style={{ fontSize: 12, letterSpacing: 1.5, color: '#DCEBFB', margin: '0 0 8px' }}>Code cadeau</p>
        <div style={{ background: '#FFFFFF', borderRadius: 12, padding: '14px 12px', margin: '0 auto 22px', maxWidth: 320 }}>
          <span
            style={{
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 2,
              color: '#185FA5',
            }}
          >
            {gift.code}
          </span>
        </div>

        {gift.purchaserName && (
          <p style={{ fontSize: 15, margin: '0 0 6px' }}>Un cadeau de la part de {gift.purchaserName}</p>
        )}
        {gift.giftMessage && (
          <p style={{ fontSize: 14, color: '#E6F1FB', fontStyle: 'italic', margin: '0 auto', maxWidth: 380, lineHeight: 1.5 }}>
            « {gift.giftMessage} »
          </p>
        )}
      </div>
    </div>
  );
};

const CadeauConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [gift, setGift] = useState<Gift | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'timeout' | 'error'>('loading');
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    if (!sessionId) {
      setStatus('error');
      return;
    }

    const poll = async (attempt: number) => {
      if (cancelledRef.current) return;
      try {
        const { data, error } = await supabase.functions.invoke('get-gift-by-session', {
          body: { session_id: sessionId },
        });
        if (cancelledRef.current) return;

        if (!error && data?.ready) {
          setGift({
            code: data.code,
            durationMonths: data.durationMonths,
            purchaserName: data.purchaserName,
            giftMessage: data.giftMessage,
          });
          setStatus('ready');
          return;
        }
      } catch (e) {
        /* on retente */
      }

      if (attempt >= MAX_ATTEMPTS) {
        setStatus('timeout');
        return;
      }
      setTimeout(() => poll(attempt + 1), POLL_INTERVAL_MS);
    };

    poll(1);
    return () => {
      cancelledRef.current = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {status === 'loading' && (
              <div className="py-16">
                <Loader2 className="w-12 h-12 text-mcf-secondary animate-spin mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-mcf-primary mb-2">Préparation de votre cadeau...</h1>
                <p className="text-muted-foreground">Nous générons votre code, cela prend quelques secondes.</p>
              </div>
            )}

            {status === 'ready' && gift && (
              <>
                <div className="mb-6 flex justify-center">
                  <CheckCircle className="h-20 w-20 text-mcf-secondary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-mcf-primary mb-3">Merci, votre cadeau est prêt !</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Voici la carte à transmettre. Le code est aussi envoyé par email.
                </p>

                <GiftCard gift={gift} />

                <div className="bg-mcf-mint/20 rounded-2xl p-6 mt-8 text-left">
                  <h2 className="font-bold text-mcf-primary mb-3">Comment l'offrir ?</h2>
                  <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                    <li>Transmettez ce code à la personne de votre choix.</li>
                    <li>Elle crée son compte et ajoute son enfant sur My Crazy Family.</li>
                    <li>
                      Au moment de s'abonner, elle choisit la formule <strong>mensuelle</strong> et saisit
                      le code : ses {gift.durationMonths} premiers mois sont offerts.
                    </li>
                  </ol>
                </div>

                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-mcf-primary font-medium hover:underline mt-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à l'accueil
                </Link>
              </>
            )}

            {status === 'timeout' && (
              <div className="py-16">
                <h1 className="text-2xl font-bold text-mcf-primary mb-2">Votre paiement est bien reçu</h1>
                <p className="text-muted-foreground mb-6">
                  La génération de votre code prend un peu plus de temps que prévu. Vous le recevrez par
                  email dans quelques instants.
                </p>
                <Link to="/" className="text-mcf-primary font-medium hover:underline">
                  Retour à l'accueil
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="py-16">
                <h1 className="text-2xl font-bold text-mcf-primary mb-2">Lien invalide</h1>
                <p className="text-muted-foreground mb-6">Nous n'avons pas retrouvé votre commande cadeau.</p>
                <Link to="/cadeau" className="text-mcf-primary font-medium hover:underline">
                  Retour aux cadeaux
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CadeauConfirmation;
