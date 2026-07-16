// CGUPage.tsx v1.0
// v1.0: page Conditions générales d'utilisation (contenu fidèle au document MCF), gabarit aligné sur APropos.tsx
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

const LAST_UPDATED = 'juillet 2026';

const sections: Section[] = [
  {
    id: 'presentation',
    title: '1. Présentation de la plateforme',
    blocks: [
      { type: 'p', text: `My Crazy Family (ci-après « MCF ») est une plateforme éditoriale et technologique exploitée par la société MY CRAZY FAMILY, société par actions simplifiée unipersonnelle, ayant son siège social au 12 rue de la Part-Dieu, 69003 Lyon.` },
      { type: 'p', text: `MCF propose des services de création, personnalisation, production et livraison de contenus éditoriaux, notamment des livres personnalisés, destinés à un usage familial, ludique, éducatif ou émotionnel.` },
    ],
  },
  {
    id: 'acces',
    title: '2. Accès à la plateforme',
    blocks: [
      { type: 'sub', text: `2.1 Conditions d'accès` },
      { type: 'p', text: `L'utilisation de la plateforme est strictement réservée aux personnes majeures disposant de la capacité juridique.` },
      { type: 'p', text: `Toute utilisation effectuée pour le compte d'un enfant se fait sous la responsabilité exclusive d'un adulte.` },
      { type: 'sub', text: `2.2 Création de compte` },
      { type: 'p', text: `L'accès aux services de MCF nécessite la création obligatoire d'un compte utilisateur.` },
      { type: 'p', text: `L'utilisateur s'engage à :` },
      { type: 'list', items: [
        `fournir des informations exactes, sincères et à jour ;`,
        `ne pas créer plusieurs comptes frauduleusement ;`,
        `conserver la confidentialité de ses identifiants.`,
      ] },
      { type: 'p', text: `L'utilisateur est seul responsable de l'utilisation de son compte.` },
    ],
  },
  {
    id: 'utilisation',
    title: '3. Utilisation des services',
    blocks: [
      { type: 'sub', text: `3.1 Principe général` },
      { type: 'p', text: `MCF permet à l'utilisateur de fournir des informations personnelles et créatives (textes, descriptions, préférences, éléments narratifs, etc.) afin de produire des contenus personnalisés.` },
      { type: 'p', text: `L'utilisateur reconnaît que :` },
      { type: 'list', items: [
        `les contenus sont créés à partir des informations qu'il fournit ;`,
        `la personnalisation implique un traitement automatisé, notamment via des technologies d'intelligence artificielle.`,
      ] },
      { type: 'sub', text: `3.2 Contenus interdits` },
      { type: 'p', text: `Il est strictement interdit d'utiliser la plateforme pour créer, demander ou diffuser des contenus :` },
      { type: 'list', items: [
        `à caractère politique ou partisan ;`,
        `à caractère religieux ou prosélyte ;`,
        `violents, haineux ou discriminatoires ;`,
        `sexuels ou à caractère adulte ;`,
        `faisant référence au suicide, à l'automutilation ou à des comportements dangereux ;`,
        `portant atteinte aux droits de tiers ;`,
        `contraires à l'ordre public ou aux bonnes mœurs.`,
      ] },
      { type: 'p', text: `MCF se réserve le droit de refuser, suspendre ou supprimer tout contenu ne respectant pas ces règles.` },
    ],
  },
  {
    id: 'responsabilite-utilisateur',
    title: '4. Responsabilité de l\u2019utilisateur',
    blocks: [
      { type: 'p', text: `L'utilisateur garantit :` },
      { type: 'list', items: [
        `être autorisé à utiliser les informations fournies ;`,
        `que les contenus transmis concernent exclusivement son cercle familial ou personnel ;`,
        `que les informations fournies ne portent pas atteinte aux droits de tiers.`,
      ] },
      { type: 'p', text: `L'utilisateur demeure seul responsable des contenus qu'il transmet et de leur utilisation finale.` },
    ],
  },
  {
    id: 'propriete-intellectuelle',
    title: '5. Propriété intellectuelle',
    blocks: [
      { type: 'sub', text: `5.1 Droits de l'utilisateur` },
      { type: 'p', text: `L'utilisateur demeure propriétaire des contenus personnalisés finaux générés pour son usage personnel.` },
      { type: 'p', text: `MCF ne revendique aucun droit de propriété intellectuelle sur les œuvres finales produites pour le compte de l'utilisateur.` },
      { type: 'sub', text: `5.2 Licence technique accordée à MCF` },
      { type: 'p', text: `L'utilisateur concède à MCF une licence strictement nécessaire, non exclusive et limitée, permettant :` },
      { type: 'list', items: [
        `la production ;`,
        `l'impression ;`,
        `la personnalisation ;`,
        `la livraison ;`,
        `l'exécution technique des services.`,
      ] },
      { type: 'p', text: `Cette licence est limitée à la durée nécessaire à l'exécution des services.` },
      { type: 'sub', text: `5.3 Contenus générés par intelligence artificielle` },
      { type: 'p', text: `L'utilisateur reconnaît que les contenus peuvent être générés ou assistés par des outils d'intelligence artificielle et :` },
      { type: 'list', items: [
        `peuvent comporter des approximations ou erreurs ;`,
        `ne constituent pas une œuvre humaine originale au sens du droit français ;`,
        `ne sauraient engager la responsabilité de MCF quant à leur exactitude ou leur conformité à des faits réels.`,
      ] },
    ],
  },
  {
    id: 'produits-personnalises',
    title: '6. Produits personnalisés',
    blocks: [
      { type: 'p', text: `Les contenus produits par MCF sont personnalisés, uniques et créés sur mesure à partir des informations fournies par l'utilisateur.` },
      { type: 'p', text: `Une fois la commande validée :` },
      { type: 'list', items: [
        `les éléments transmis ne peuvent plus être modifiés ;`,
        `les contenus sont considérés comme définitifs pour la production.`,
      ] },
    ],
  },
  {
    id: 'refus-suspension',
    title: '7. Droit de refus et suspension',
    blocks: [
      { type: 'p', text: `MCF se réserve le droit, à tout moment :` },
      { type: 'list', items: [
        `de refuser une commande ;`,
        `de suspendre ou supprimer un compte utilisateur ;`,
        `de retirer un contenu ;`,
      ] },
      { type: 'p', text: `notamment en cas de non-respect des présentes CGU, de contenu illicite ou de comportement abusif.` },
    ],
  },
  {
    id: 'donnees-personnelles',
    title: '8. Données personnelles',
    blocks: [
      { type: 'p', text: `MCF collecte et traite des données personnelles, notamment :` },
      { type: 'list', items: [
        `informations familiales et descriptives (prénoms, traits de caractère, passions, lieux, proches, etc.) ;`,
        `coordonnées de contact ;`,
        `données nécessaires à la livraison et au paiement.`,
      ] },
      { type: 'p', text: `MCF s'engage à :` },
      { type: 'list', items: [
        `ne vendre aucune donnée personnelle ;`,
        `ne pas utiliser les données pour entraîner des intelligences artificielles tierces ;`,
        `traiter les données conformément à la réglementation en vigueur (RGPD).`,
      ] },
      { type: 'p', text: `Les modalités détaillées sont précisées dans la politique de confidentialité.` },
    ],
  },
  {
    id: 'responsabilite-mcf',
    title: '9. Responsabilité de MCF',
    blocks: [
      { type: 'p', text: `MCF est tenue à une obligation de moyens, et non de résultat.` },
      { type: 'p', text: `La responsabilité de MCF ne saurait être engagée :` },
      { type: 'list', items: [
        `en cas d'erreur résultant des informations fournies par l'utilisateur ;`,
        `pour des dommages indirects ou immatériels ;`,
        `au-delà du montant effectivement payé par l'utilisateur pour le service concerné.`,
      ] },
    ],
  },
  {
    id: 'indisponibilite',
    title: '10. Indisponibilité du service',
    blocks: [
      { type: 'p', text: `MCF peut être amenée à suspendre temporairement ou définitivement tout ou partie du service, notamment pour :` },
      { type: 'list', items: [
        `maintenance ;`,
        `mise à jour ;`,
        `incident technique ;`,
        `arrêt d'activité.`,
      ] },
      { type: 'p', text: `Dans la mesure du possible, les utilisateurs seront informés à l'avance.` },
      { type: 'p', text: `En cas d'abonnement en cours et d'interruption prolongée, MCF pourra :` },
      { type: 'list', items: [
        `suspendre la facturation ;`,
        `ou proposer un geste commercial adapté.`,
      ] },
    ],
  },
  {
    id: 'modification',
    title: '11. Modification des CGU',
    blocks: [
      { type: 'p', text: `MCF se réserve le droit de modifier les présentes CGU à tout moment.` },
      { type: 'p', text: `Les utilisateurs seront informés de toute modification substantielle.` },
    ],
  },
  {
    id: 'droit-applicable',
    title: '12. Droit applicable et juridiction',
    blocks: [
      { type: 'p', text: `Les présentes CGU sont régies par le droit français.` },
      { type: 'p', text: `Tout litige relatif à leur interprétation ou à leur exécution relève de la compétence exclusive des tribunaux du ressort du siège social de MCF, sauf disposition légale impérative contraire.` },
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

const CGUPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
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
              Conditions générales d'utilisation
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

export default CGUPage;
