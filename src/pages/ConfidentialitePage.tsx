// ConfidentialitePage.tsx v1.1
// v1.1: retrait de la mention "traitement IA dans l'UE" (endpoint Vertex encore global) ; transferts hors UE formulés honnêtement ; hébergeur n8n France-Paris + stockage GCS France précisés
// v1.0: politique de confidentialité (RGPD) rédigée d'après les infos validées ; gabarit aligné sur APropos.tsx
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
const CONTACT_EMAIL = 'robin@mycrazyfamily.com';

const sections: Section[] = [
  {
    id: 'responsable',
    title: '1. Responsable du traitement',
    blocks: [
      { type: 'p', text: `Le responsable du traitement est la société MY CRAZY FAMILY, éditrice de la plateforme My Crazy Family, dont le siège social est situé au 12 rue de la Part-Dieu, 69003 Lyon.` },
      { type: 'p', text: `Pour toute question relative à vos données personnelles, vous pouvez nous contacter à l'adresse : ${CONTACT_EMAIL}.` },
    ],
  },
  {
    id: 'donnees-collectees',
    title: '2. Données que nous collectons',
    blocks: [
      { type: 'p', text: `Nous ne collectons que les données nécessaires à la création de vos livres personnalisés et à la gestion de votre abonnement.` },
      { type: 'sub', text: `Données de compte` },
      { type: 'list', items: [
        `adresse e-mail et mot de passe (stocké de façon chiffrée) ;`,
        `nom du parent ou de l'adulte responsable.`,
      ] },
      { type: 'sub', text: `Données de personnalisation (fournies par l'adulte responsable)` },
      { type: 'list', items: [
        `informations sur l'enfant : prénom, date de naissance, description physique (couleur des yeux, des cheveux, etc.) ;`,
        `univers créatif : passions, traits de caractère, défis, univers préférés ;`,
        `proches, animaux et doudous de l'enfant (prénom, lien, description) ;`,
        `lieux de vie (ville, pays).`,
      ] },
      { type: 'p', text: `Aucune photo de votre enfant n'est collectée : les illustrations sont générées uniquement à partir des descriptions que vous fournissez.` },
      { type: 'sub', text: `Données de livraison et de paiement` },
      { type: 'list', items: [
        `nom et adresse postale de livraison ;`,
        `les paiements sont traités par notre prestataire Stripe : nous ne stockons jamais vos coordonnées bancaires.`,
      ] },
      { type: 'sub', text: `Données techniques` },
      { type: 'list', items: [
        `données de connexion (adresse IP, journaux de connexion) ;`,
        `cookies strictement nécessaires au fonctionnement du service.`,
      ] },
    ],
  },
  {
    id: 'finalites',
    title: '3. Finalités et bases légales',
    blocks: [
      { type: 'p', text: `Nous traitons vos données pour les finalités suivantes :` },
      { type: 'list', items: [
        `créer, produire et livrer vos livres personnalisés (exécution du contrat) ;`,
        `gérer votre compte et votre abonnement (exécution du contrat) ;`,
        `traiter les paiements et respecter nos obligations comptables (obligation légale) ;`,
        `assurer la sécurité et le bon fonctionnement de la plateforme (intérêt légitime) ;`,
        `répondre à vos demandes via le service client (intérêt légitime).`,
      ] },
    ],
  },
  {
    id: 'ia',
    title: '4. Personnalisation par intelligence artificielle',
    blocks: [
      { type: 'p', text: `La création de vos livres implique un traitement automatisé de vos informations par des technologies d'intelligence artificielle (Google Vertex AI), afin de générer les textes et les illustrations.` },
      { type: 'p', text: `Google s'engage contractuellement à ne pas utiliser vos données pour entraîner ses modèles d'intelligence artificielle.` },
      { type: 'p', text: `Ce traitement sert uniquement à produire le contenu de vos livres. Il ne constitue pas une décision automatisée produisant des effets juridiques à votre égard au sens de l'article 22 du RGPD.` },
    ],
  },
  {
    id: 'destinataires',
    title: '5. Destinataires et sous-traitants',
    blocks: [
      { type: 'p', text: `Vos données ne sont jamais vendues. Elles sont partagées uniquement avec les prestataires strictement nécessaires à la fourniture du service, dans le cadre d'accords de traitement des données (DPA) conformes au RGPD :` },
      { type: 'list', items: [
        `Supabase — hébergement de la base de données et authentification (région Union européenne, Paris) ;`,
        `Google Vertex AI — génération des textes et des illustrations par intelligence artificielle ;`,
        `Google Cloud Storage — stockage des fichiers et illustrations générés (région France) ;`,
        `Stripe — traitement sécurisé des paiements ;`,
        `Google (Gmail) — envoi des e-mails transactionnels (confirmation, connexion) ;`,
        `notre hébergeur d'automatisation (serveur situé en France, à Paris) ;`,
        `un imprimeur partenaire situé en France (Yvelines) — impression des livres ;`,
        `La Poste — livraison des livres.`,
      ] },
    ],
  },
  {
    id: 'transferts',
    title: '6. Transferts hors de l\u2019Union européenne',
    blocks: [
      { type: 'p', text: `La majorité de vos données sont hébergées et traitées au sein de l'Union européenne. Toutefois, certains de nos prestataires (notamment Google et Stripe) peuvent être amenés à traiter des données en dehors de l'Union européenne. Ces transferts sont encadrés par les clauses contractuelles types adoptées par la Commission européenne, qui garantissent un niveau de protection adéquat de vos données.` },
    ],
  },
  {
    id: 'conservation',
    title: '7. Durées de conservation',
    blocks: [
      { type: 'list', items: [
        `données de compte et de personnalisation : conservées tant que votre compte est actif ;`,
        `en cas de suppression de votre compte : supprimées sous 30 jours, hors obligations légales ;`,
        `en cas d'inactivité prolongée : supprimées après 3 ans sans connexion ;`,
        `livres générés (fichiers et illustrations) : conservés tant que le compte est actif, puis supprimés sous 90 jours après la suppression du compte ;`,
        `données de facturation : conservées 10 ans, conformément à nos obligations comptables légales ;`,
        `journaux de connexion : conservés 12 mois.`,
      ] },
    ],
  },
  {
    id: 'droits',
    title: '8. Vos droits',
    blocks: [
      { type: 'p', text: `Conformément au RGPD, vous disposez des droits suivants sur vos données et celles de vos enfants :` },
      { type: 'list', items: [
        `droit d'accès ;`,
        `droit de rectification ;`,
        `droit à l'effacement ;`,
        `droit à la limitation du traitement ;`,
        `droit d'opposition ;`,
        `droit à la portabilité de vos données.`,
      ] },
      { type: 'p', text: `Pour exercer ces droits, contactez-nous à ${CONTACT_EMAIL}. Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).` },
    ],
  },
  {
    id: 'enfants',
    title: '9. Protection des données des enfants',
    blocks: [
      { type: 'p', text: `My Crazy Family est un service destiné aux familles. Les données relatives aux enfants sont fournies exclusivement par un adulte responsable, sous sa responsabilité. Aucune donnée n'est collectée directement auprès d'un enfant, et les enfants ne disposent d'aucun compte personnel.` },
      { type: 'p', text: `Nous accordons une attention particulière à la protection de ces données et ne les utilisons que pour créer les livres personnalisés.` },
    ],
  },
  {
    id: 'cookies',
    title: '10. Cookies',
    blocks: [
      { type: 'p', text: `Notre site utilise uniquement des cookies strictement nécessaires à son fonctionnement (par exemple, le maintien de votre session de connexion). Ces cookies ne nécessitent pas de consentement préalable.` },
      { type: 'p', text: `Nous n'utilisons aucun cookie publicitaire ni traceur à des fins de suivi ou de mesure d'audience.` },
    ],
  },
  {
    id: 'securite',
    title: '11. Sécurité',
    blocks: [
      { type: 'p', text: `Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des mots de passe, hébergement sécurisé au sein de l'Union européenne et accès restreint aux données.` },
    ],
  },
  {
    id: 'modification',
    title: '12. Modification de la politique',
    blocks: [
      { type: 'p', text: `Nous pouvons être amenés à modifier la présente politique de confidentialité. En cas de modification substantielle, vous en serez informé. La version applicable est celle en vigueur au moment de votre utilisation du service.` },
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

const ConfidentialitePage: React.FC = () => {
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
              Politique de confidentialité
            </h1>
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : {LAST_UPDATED}
            </p>
          </div>

          {/* Intro */}
          <p className="text-muted-foreground leading-relaxed mb-8">
            My Crazy Family attache une grande importance à la protection de vos données personnelles
            et de celles de vos enfants. La présente politique explique quelles données nous
            collectons, pourquoi, combien de temps nous les conservons et quels sont vos droits,
            conformément au Règlement général sur la protection des données (RGPD).
          </p>

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

export default ConfidentialitePage;
