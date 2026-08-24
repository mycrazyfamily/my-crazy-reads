// ContactPage.tsx v1.1
// Changelog v1.1 (chantier I) : l'adresse de contact passe de robin@mycrazyfamily.com a
//   hello@mycrazyfamily.com. Une adresse nominative sur une page Contact publique dit au
//   visiteur qu'il ecrit a une personne ; un alias dit qu'il ecrit a un service, ce qui est
//   plus rassurant sur un abonnement et permet de rediriger le jour ou quelqu'un d'autre
//   traite les demandes. Un seul point de verite dans ce fichier, la constante CONTACT_EMAIL :
//   elle alimente a la fois le lien mailto: et le libelle affiche sur le bouton.
//   NOTE : la meme adresse existe aussi dans ConfidentialitePage.tsx (constante CONTACT_EMAIL,
//   ligne 19). Elle n'est PAS modifiee ici, c'est une page legale ou l'adresse engage le
//   responsable de traitement : changement a decider separement.
// ContactPage.tsx v1.0
// v1.0: page Contact (lien e-mail direct vers l'adresse de contact), gabarit aligné sur APropos.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Mail } from 'lucide-react';

const CONTACT_EMAIL = 'hello@mycrazyfamily.com';

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
