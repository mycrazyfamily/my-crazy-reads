// HowItWorks v1.1
// Changelog v1.1 (MOBILE) : les 3 étapes occupaient ~2 100px empilées — pastille de 80px, icône,
//   titre, description et accroche, tout centré — soit un écran entier par étape. Le message de la
//   section (« c'est simple, il n'y a que 3 étapes ») ne pouvait donc pas passer : l'utilisateur
//   arrivé à l'étape 3 ne voyait plus la 1.
//   Mobile : les étapes deviennent une FRISE VERTICALE — pastille numérotée de 44px à gauche,
//   reliée à la suivante par un trait continu, contenu aligné à gauche. Environ 550px au total,
//   les trois étapes visibles ensemble, et le trait matérialise le parcours.
//   Les icônes sont masquées sur mobile : elles font doublon avec le numéro et coûtent ~50px par
//   étape. Elles restent affichées sur desktop. (Faciles à remettre : voir le commentaire dans le
//   bloc mobile.)
//   Desktop : la grille 3 colonnes d'origine est conservée à l'identique, dans un bloc séparé
//   `hidden md:grid` — aucune de ses classes n'a été modifiée.
//   Corrigé au passage : « vous pouvez y ajoutez » → « ajouter ».
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, PenLine, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const HowItWorks: React.FC = () => {
  const { user } = useAuth();

  // Détermine la destination selon l'état de connexion
  const getDestinationPath = () => {
    return user ? '/espace-famille' : '/creer-profil-enfant';
  };

  // Détermine le texte du bouton selon l'état de connexion
  const getButtonText = () => {
    return user ? 'Gérer mon abonnement' : 'J\'abonne ma famille';
  };

  const steps = [
    {
      number: "1",
      icon: <Users className="w-10 h-10 text-mcf-primary" />,
      title: "Créez votre famille",
      description: "Personnalisez les profils de vos enfants, proches, animaux ou amis. Chaque histoire s'ajuste aux liens qui l'entourent, pour des aventures riches de sens.",
      highlight: "Un héros qu'il connaît, c'est un héros qui l'aide à grandir."
    },
    {
      number: "2",
      icon: <PenLine className="w-10 h-10 text-mcf-primary" />,
      title: "Personnalisez l'histoire",
      description: "Chaque livre repose sur une trame conçue par des spécialistes de l'enfance. Chaque mois, vous pouvez y ajouter des éléments, ce qui rend l'histoire vraiment unique à ses et vos yeux.",
      highlight: "Plus vous partagez, plus l'histoire devient la sienne."
    },
    {
      number: "3",
      icon: <BookOpen className="w-10 h-10 text-mcf-primary" />,
      title: "Recevez votre livre chaque mois",
      description: "Un vrai beau livre, personnalisé à chaque détail, imprimé en France 🇫🇷 avec des finitions haut de gamme et livré directement chez vous.",
      highlight: "Illustré, durable, pensé pour être relu encore et encore même 15 ans plus tard."
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-mcf-primary mb-6">
            Comment ça marche
          </h2>
          <p className="text-lg md:text-xl text-mcf-text/70 max-w-3xl mx-auto">
            Trois étapes simples pour offrir à votre enfant des histoires qui lui ressemblent et qui l'aident à grandir.
          </p>
        </div>

        {/* ===================== MOBILE : frise verticale ===================== */}
        {/* Le trait relie les pastilles entre elles : c'est lui qui donne à lire la séquence
            d'un seul coup d'œil, sans avoir à faire défiler d'une étape à l'autre. */}
        <div className="md:hidden max-w-xl mx-auto mb-10 text-left">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <div key={index} className="flex gap-4">
                {/* Colonne de gauche : pastille + trait de liaison */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-11 h-11 rounded-full bg-mcf-primary text-white text-lg font-bold flex items-center justify-center shadow-md">
                    {step.number}
                  </div>
                  {/* flex-1 : le trait occupe toute la hauteur restante de la rangée, donc il
                      rejoint exactement la pastille suivante quelle que soit la longueur du texte */}
                  {!isLast && <div className="w-0.5 flex-1 bg-mcf-secondary/40 my-2" />}
                </div>

                {/* Contenu.
                    L'icône de l'étape n'est volontairement pas reprise ici (doublon avec le
                    numéro). Pour la remettre, insérer avant le titre :
                    <span className="[&_svg]:w-5 [&_svg]:h-5">{step.icon}</span> */}
                <div className={`min-w-0 ${isLast ? 'pb-0' : 'pb-8'}`}>
                  <h3 className="text-lg font-bold text-mcf-text leading-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-mcf-text/70 leading-relaxed mb-2">
                    {step.description}
                  </p>
                  <p className="text-sm text-mcf-primary font-semibold leading-snug">
                    {step.highlight}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===================== DESKTOP : grille d'origine, inchangée ===================== */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto mb-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              {/* Numéro de l'étape */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-mcf-primary text-white text-2xl font-bold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                {/* Ligne de connexion (sauf pour le dernier) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-32 h-0.5 bg-mcf-secondary transform translate-x-full"></div>
                )}
              </div>

              {/* Icône */}
              <div className="flex justify-center mb-4">{step.icon}</div>

              {/* Titre */}
              <h3 className="text-xl md:text-2xl font-bold text-mcf-text mb-4">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-mcf-text/70 leading-relaxed mb-4">
                {step.description}
              </p>

              {/* Highlight text */}
              <p className="text-mcf-primary font-semibold text-sm">
                {step.highlight}
              </p>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div className="text-center">
          <Link 
            to={getDestinationPath()} 
            className="bg-mcf-primary hover:bg-mcf-secondary text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-lg shadow-lg"
          >
            {getButtonText()}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
