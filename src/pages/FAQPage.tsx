// FAQPage.tsx v1.2
// v1.2: formulations "artisanales" (fini "créé") ; retrait Q "création IA" et Q "cadeau" (pas encore vrai) ; Q "adaptées aux enfants" enrichie (collège de relecteurs)
// v1.1: prix réels dans la réponse tarifs + CTA vers /abonnement ; timing "en début de mois"
// v1.0: FAQ MCF, accordéon auto-contenu (useState, sans dépendance externe), gabarit aligné sur APropos.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';

type QA = { question: string; answer: string; cta?: { label: string; to: string } };

const faqs: QA[] = [
  {
    question: `Qu'est-ce que My Crazy Family ?`,
    answer: `My Crazy Family est un service par abonnement qui imagine, chaque mois, un livre personnalisé et unique dans lequel votre enfant devient le héros de sa propre histoire.`,
  },
  {
    question: `Pour quel âge sont conçus les livres ?`,
    answer: `Nos livres sont pensés pour les enfants de 0 à 10 ans. Le format et la longueur des histoires s'adaptent à l'âge de l'enfant : des histoires courtes et très illustrées pour les tout-petits, des récits plus longs et porteurs d'une morale pour les plus grands.`,
  },
  {
    question: `Comment le livre est-il personnalisé ?`,
    answer: `Chaque livre est imaginé et façonné sur mesure à partir des informations que vous nous fournissez : le prénom et la description de votre enfant, ses passions, ses proches, ses animaux, son doudou et ses lieux de vie. L'histoire comme les illustrations sont uniques, pensées rien que pour lui.`,
  },
  {
    question: `Dois-je envoyer une photo de mon enfant ?`,
    answer: `Non. Les illustrations sont réalisées uniquement à partir des descriptions que vous fournissez. Aucune photo de votre enfant n'est nécessaire ni collectée.`,
  },
  {
    question: `À quelle fréquence vais-je recevoir un livre ?`,
    answer: `Chaque mois, en début de mois, un nouveau livre personnalisé est façonné avec soin puis expédié dans le cadre de votre abonnement.`,
  },
  {
    question: `Les histoires sont-elles adaptées aux enfants ?`,
    answer: `Oui. Nos thèmes sont conçus avec le concours d'une psychologue pour enfants, et chaque livre est relu par un collège de professeurs des écoles et d'auteurs jeunesse, pour garantir sa justesse pédagogique et sa richesse narrative.`,
  },
  {
    question: `Puis-je résilier mon abonnement ?`,
    answer: `Oui, à tout moment depuis votre espace personnel. La résiliation prend effet à la fin de la période de facturation en cours.`,
  },
  {
    question: `Combien coûte l'abonnement ?`,
    answer: `Deux formules sont disponibles : l'abonnement mensuel à 29,99 €/mois, et l'abonnement annuel à 299,99 €/an, soit 24,99 €/mois.`,
    cta: { label: `Voir les formules`, to: `/abonnement` },
  },
];

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-left">
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
              Foire aux questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Tout ce qu'il faut savoir sur le fonctionnement de My Crazy Family.
            </p>
          </div>

          {/* Accordéon */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-foreground">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-mcf-primary transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 -mt-1 text-muted-foreground leading-relaxed">
                      <p>{faq.answer}</p>
                      {faq.cta && (
                        <Link
                          to={faq.cta.to}
                          className="inline-flex items-center gap-1 mt-3 text-mcf-primary font-medium hover:underline"
                        >
                          {faq.cta.label}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
