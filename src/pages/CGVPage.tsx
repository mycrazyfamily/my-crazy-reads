// CGVPage.tsx v1.1
// v1.1: alignement à gauche du contenu (text-left) — neutralise le centrage global hérité
// v1.0: page Conditions générales de vente (contenu fidèle au document MCF), gabarit aligné sur APropos.tsx
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
    id: 'champ-application',
    title: '1. Champ d\u2019application',
    blocks: [
      { type: 'p', text: `Les présentes Conditions Générales de Vente (ci-après les « CGV ») régissent l'ensemble des ventes de produits et services proposés par la société MY CRAZY FAMILY (ci-après « MCF ») via la plateforme My Crazy Family.` },
      { type: 'p', text: `Toute commande implique l'acceptation pleine et entière des présentes CGV, sans réserve.` },
    ],
  },
  {
    id: 'produits-services',
    title: '2. Produits et services proposés',
    blocks: [
      { type: 'p', text: `MCF propose notamment :` },
      { type: 'list', items: [
        `des abonnements donnant droit à la création et à la livraison périodique de contenus personnalisés ;`,
        `des produits personnalisés à l'unité, notamment des livres cadeaux ;`,
        `des produits dérivés physiques ou numériques ;`,
        `des services de personnalisation et de production éditoriale.`,
      ] },
      { type: 'p', text: `Les caractéristiques essentielles des produits et services sont présentées sur la plateforme avant toute commande.` },
    ],
  },
  {
    id: 'commande',
    title: '3. Commande',
    blocks: [
      { type: 'sub', text: `3.1 Processus de commande` },
      { type: 'p', text: `La commande est validée après :` },
      { type: 'list', items: [
        `sélection du produit ou de l'abonnement ;`,
        `fourniture des informations de personnalisation ;`,
        `validation du récapitulatif ;`,
        `acceptation des CGU et CGV ;`,
        `paiement effectif.`,
      ] },
      { type: 'p', text: `Toute commande vaut engagement ferme et définitif.` },
      { type: 'sub', text: `3.2 Personnalisation` },
      { type: 'p', text: `Les produits proposés par MCF sont personnalisés sur mesure à partir des informations fournies par le client.` },
      { type: 'p', text: `Le client est seul responsable de l'exactitude des informations transmises.` },
    ],
  },
  {
    id: 'prix',
    title: '4. Prix',
    blocks: [
      { type: 'p', text: `Les prix sont indiqués en euros, toutes taxes comprises (TTC), sauf indication contraire.` },
      { type: 'p', text: `MCF se réserve le droit de modifier ses prix à tout moment, sans effet rétroactif sur les commandes déjà validées.` },
    ],
  },
  {
    id: 'paiement',
    title: '5. Paiement',
    blocks: [
      { type: 'sub', text: `5.1 Moyens de paiement` },
      { type: 'p', text: `Le paiement s'effectue en ligne par carte bancaire ou tout autre moyen proposé sur la plateforme, via un prestataire de paiement sécurisé.` },
      { type: 'sub', text: `5.2 Abonnements` },
      { type: 'p', text: `Pour les abonnements :` },
      { type: 'list', items: [
        `le paiement est effectué de manière récurrente (mensuelle ou selon la formule choisie) ;`,
        `le client autorise expressément MCF à procéder aux prélèvements correspondants.`,
      ] },
    ],
  },
  {
    id: 'retractation',
    title: '6. Droit de rétractation',
    blocks: [
      { type: 'sub', text: `6.1 Produits personnalisés` },
      { type: 'p', text: `Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux produits personnalisés ou confectionnés selon les spécifications du client.` },
      { type: 'p', text: `Aucun remboursement ne pourra être exigé une fois la production lancée.` },
      { type: 'sub', text: `6.2 Abonnements` },
      { type: 'p', text: `Le client peut se rétracter avant le début de la production du premier contenu personnalisé.` },
      { type: 'p', text: `Une fois la production engagée, l'abonnement est ferme pour la période en cours.` },
    ],
  },
  {
    id: 'livraison',
    title: '7. Livraison',
    blocks: [
      { type: 'sub', text: `7.1 Délais` },
      { type: 'p', text: `Les délais de production et de livraison sont indiqués à titre indicatif.` },
      { type: 'p', text: `MCF ne saurait être tenue responsable des retards imputables :` },
      { type: 'list', items: [
        `aux transporteurs ;`,
        `aux partenaires d'impression ;`,
        `à des circonstances exceptionnelles.`,
      ] },
      { type: 'sub', text: `7.2 Adresse de livraison` },
      { type: 'p', text: `Le client est responsable de l'exactitude de l'adresse fournie.` },
      { type: 'p', text: `En cas d'erreur entraînant un retour ou une non-livraison, les frais de réexpédition pourront être à la charge du client.` },
    ],
  },
  {
    id: 'suspension-resiliation',
    title: '8. Abonnement : suspension, résiliation',
    blocks: [
      { type: 'sub', text: `8.1 Résiliation par le client` },
      { type: 'p', text: `Le client peut résilier son abonnement à tout moment depuis son espace personnel.` },
      { type: 'p', text: `La résiliation prend effet :` },
      { type: 'list', items: [
        `à la fin de la période de facturation en cours ;`,
        `sans remboursement de la période entamée.`,
      ] },
      { type: 'sub', text: `8.2 Suspension par MCF` },
      { type: 'p', text: `MCF se réserve le droit de suspendre ou résilier un abonnement en cas :` },
      { type: 'list', items: [
        `de non-paiement ;`,
        `de non-respect des CGU ou CGV ;`,
        `de comportement abusif.`,
      ] },
    ],
  },
  {
    id: 'interruption',
    title: '9. Interruption du service',
    blocks: [
      { type: 'p', text: `En cas d'interruption temporaire ou prolongée du service empêchant l'exécution des prestations :` },
      { type: 'list', items: [
        `la facturation de l'abonnement pourra être suspendue ;`,
        `ou un geste commercial pourra être proposé.`,
      ] },
      { type: 'p', text: `Aucune indemnité complémentaire ne pourra être exigée.` },
    ],
  },
  {
    id: 'reclamations',
    title: '10. Réclamations',
    blocks: [
      { type: 'p', text: `Toute réclamation doit être adressée par écrit via le service client de MCF, dans un délai raisonnable après réception du produit ou constat du problème.` },
      { type: 'p', text: `MCF s'engage à traiter toute réclamation de bonne foi.` },
    ],
  },
  {
    id: 'responsabilite',
    title: '11. Responsabilité',
    blocks: [
      { type: 'p', text: `MCF est tenue à une obligation de moyens.` },
      { type: 'p', text: `Sa responsabilité ne pourra être engagée :` },
      { type: 'list', items: [
        `en cas d'erreur provenant des informations fournies par le client ;`,
        `pour des dommages indirects ou immatériels ;`,
        `au-delà du montant payé par le client pour la commande concernée.`,
      ] },
    ],
  },
  {
    id: 'force-majeure',
    title: '12. Force majeure',
    blocks: [
      { type: 'p', text: `MCF ne saurait être tenue responsable en cas de force majeure telle que définie par la jurisprudence française (grève, catastrophe naturelle, pandémie, interruption des réseaux, etc.).` },
    ],
  },
  {
    id: 'propriete-intellectuelle',
    title: '13. Propriété intellectuelle',
    blocks: [
      { type: 'p', text: `Les dispositions relatives à la propriété intellectuelle sont définies dans les CGU.` },
    ],
  },
  {
    id: 'donnees-personnelles',
    title: '14. Données personnelles',
    blocks: [
      { type: 'p', text: `Le traitement des données personnelles est effectué conformément à la réglementation en vigueur et détaillé dans la politique de confidentialité.` },
    ],
  },
  {
    id: 'modification',
    title: '15. Modification des CGV',
    blocks: [
      { type: 'p', text: `MCF se réserve le droit de modifier les présentes CGV à tout moment.` },
      { type: 'p', text: `Les CGV applicables sont celles en vigueur au jour de la commande.` },
    ],
  },
  {
    id: 'droit-applicable',
    title: '16. Droit applicable et litiges',
    blocks: [
      { type: 'p', text: `Les présentes CGV sont soumises au droit français.` },
      { type: 'p', text: `En cas de litige, le client est invité à contacter MCF afin de rechercher une solution amiable.` },
      { type: 'p', text: `À défaut, le litige sera porté devant les tribunaux compétents du ressort du siège social, sauf disposition légale impérative contraire.` },
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

const CGVPage: React.FC = () => {
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
              Conditions générales de vente
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

export default CGVPage;
