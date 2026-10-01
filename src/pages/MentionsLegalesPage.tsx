// MentionsLegalesPage.tsx v1.0 — 01/10/2026
// Page « Mentions légales » (point 0.5 de la check-list de lancement), meme gabarit que
// CGUPage.tsx. Contenu decide avec Robin le 01/10/2026 :
//   · editeur : My Crazy Family, adresse de Lyon, telephone et e-mail de contact ;
//   · directeur de la publication : Robin du Fayet ;
//   · hebergeur : Lovable Labs Incorporated (partie contractante des conditions de
//     Lovable). Son adresse postale reste a ajouter (facture Lovable), et cette section
//     changera si le site quitte Lovable ;
//   · A COMPLETER A LA CREATION DE LA SOCIETE : forme juridique, capital, RCS et SIREN,
//     numero de TVA intracommunautaire le cas echeant.
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';

type Block =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'sub'; text: string };

type Section = { id: string; title: string; blocks: Block[] };

const LAST_UPDATED = 'octobre 2026';
const CONTACT_EMAIL = 'hello@mycrazyfamily.com';

const sections: Section[] = [
  {
    id: 'editeur',
    title: '1. Éditeur du site',
    blocks: [
      { type: 'p', text: `Le site www.mycrazyfamily.com est édité par My Crazy Family.` },
      { type: 'list', items: [
        `adresse : 12 rue de la Part-Dieu, 69003 Lyon ;`,
        `téléphone : 06 24 59 66 70 ;`,
        `e-mail : ${CONTACT_EMAIL}.`,
      ] },
    ],
  },
  {
    id: 'publication',
    title: '2. Directeur de la publication',
    blocks: [
      { type: 'p', text: `Robin du Fayet.` },
    ],
  },
  {
    id: 'hebergement',
    title: '3. Hébergement',
    blocks: [
      { type: 'p', text: `Le site est hébergé par Lovable Labs Incorporated (lovable.dev), joignable à l'adresse support@lovable.dev.` },
      { type: 'p', text: `Les données du service sont hébergées par Supabase, sur des serveurs situés dans l'Union européenne (Paris).` },
    ],
  },
  {
    id: 'propriete',
    title: '4. Propriété intellectuelle',
    blocks: [
      { type: 'p', text: `L'ensemble des contenus de ce site (textes, illustrations, logos et marque My Crazy Family) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation préalable est interdite.` },
      { type: 'p', text: `Les conditions d'utilisation des livres personnalisés sont précisées dans les conditions générales d'utilisation (CGU).` },
    ],
  },
  {
    id: 'donnees',
    title: '5. Données personnelles',
    blocks: [
      { type: 'p', text: `Le traitement de vos données personnelles est décrit dans notre politique de confidentialité, accessible en bas de chaque page du site.` },
    ],
  },
  {
    id: 'contact',
    title: '6. Contact',
    blocks: [
      { type: 'p', text: `Pour toute question relative au site, écrivez-nous à ${CONTACT_EMAIL}.` },
    ],
  },
];

const renderBlock = (block: Block, index: number) => {
  if (block.type === 'sub') {
    return (
      <h3 key={index} className="text-base font-semibold text-foreground mt-4">
        {block.text}
      </h3>
    );
  }
  if (block.type === 'list') {
    return (
      <ul key={index} className="list-disc pl-5 space-y-1">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p key={index}>{block.text}</p>;
};

const MentionsLegalesPage: React.FC = () => {
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
            <h1 className="text-4xl md:text-5xl font-bold text-mcf-primary mb-3">
              Mentions légales
            </h1>
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : {LAST_UPDATED}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl md:text-2xl font-bold text-mcf-primary mb-3">
                  {section.title}
                </h2>
                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  {section.blocks.map((block, index) => renderBlock(block, index))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MentionsLegalesPage;
