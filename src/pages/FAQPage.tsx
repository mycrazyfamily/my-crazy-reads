// ContactPage.tsx v1.0
// v1.0: page Contact (lien e-mail direct vers robin@mycrazyfamily.com), gabarit aligné sur APropos.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Mail } from 'lucide-react';

const CONTACT_EMAIL = 'robin@mycrazyfamily.com';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl text-left">
          {/* Header */}
          <div className="mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-mcf-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-mcf-primary mb-4">
              Contact
            </h1>
            <p className="text-lg text-muted-foreground">
              Une question, une demande ou un souci avec votre abonnement ? Écrivez-nous,
              nous vous répondons dans les meilleurs délais.
            </p>
          </div>

          {/* Carte contact */}
          <div className="bg-card rounded-2xl p-8 card-shadow border border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-mcf-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-mcf-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">
                  Par e-mail
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  C'est le moyen le plus rapide de nous joindre.
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-mcf-primary text-white rounded-full font-medium hover:bg-mcf-primary/90 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
