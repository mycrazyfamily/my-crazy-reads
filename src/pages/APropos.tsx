// APropos.tsx v2.0
// Changelog v2.0 (chantier B, refonte de la page) : quatre changements.
//   [1] CORRECTIF DE CENTRAGE. Le sous-titre paraissait decale a gauche. Cause reelle : le
//       paragraphe portait `max-w-2xl` SANS `mx-auto`, donc le bloc restait colle a gauche du
//       conteneur, pendant que son texte etait centre par heritage de `#root { text-align:
//       center }` (App.css, reste du modele Vite). Un texte centre dans une boite decalee.
//       Correctif : l'en-tete est explicitement centre (`text-center` + `mx-auto`) et le corps
//       du recit est explicitement aligne a gauche (`text-left`), ce qui le rend independant
//       de l'heritage de App.css. Le chantier global sur `#root` reste a faire, cette page n'en
//       depend plus.
//   [2] SUPPRESSION des sections « Notre mission » et « Nos valeurs ». Elles repetaient ce que
//       la page d'accueil dit deja. La page A propos sert a etablir la confiance, pas a redire
//       l'argumentaire produit.
//   [3] AJOUT de la section « Notre histoire » : le recit d'origine, les personnes derriere le
//       projet, et le constat qui fonde la personnalisation. L'IA n'est jamais nommee, par
//       choix : elle reste mentionnee la ou c'est obligatoire, dans les CGU et la politique de
//       confidentialite.
//   [4] Cartes « Notre equipe » conservees, elles resument le recit. Titre de Violaine aligne
//       sur sa demande : « Psychologue clinicienne ».
//
//   A METTRE A JOUR APRES LA NAISSANCE (section Notre histoire, 3e paragraphe) :
//   remplacer  « il attend lui-meme une petite fille pour septembre 2026 »
//   par        « il est lui-meme papa d'une petite fille »
//   Le reste de la phrase ne bouge pas.
//
// APropos.tsx v1.2
// Changelog v1.2 (chantier icones IA, lot 1) : retrait de l'icone Sparkles de lucide-react.
//   [1] en-tete « Notre mission » -> BookOpen. La mission est d'editer des livres : le sens
//       porte est le produit lui-meme.
//   [2] portrait de Robin -> Feather. Le texte parle de narration et de vision : le sens porte
//       est l'ecriture. Violaine garde Heart, l'ecoute et le soin.
// APropos.tsx v1.1
// v1.1: ajout d'une phrase (section Notre équipe) sur le collège de relecteurs (professeurs des écoles + auteurs jeunesse)
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart, Users, BookOpen, Feather, ArrowLeft } from 'lucide-react';

const APropos: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Header, centrage explicite. `mx-auto` sur le sous-titre est ce qui manquait en
              v1.2 : sans lui, `max-w-2xl` laissait le bloc colle a gauche. */}
          <div className="mb-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-mcf-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-mcf-primary mb-4">
              À propos de nous
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              My Crazy Family crée des livres personnalisés qui transforment chaque enfant en héros de sa propre histoire.
            </p>
          </div>

          {/* Notre histoire */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-mcf-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-mcf-primary" />
              </div>
              <h2 className="text-2xl font-bold text-mcf-primary">Notre histoire</h2>
            </div>

            {/* `text-left` explicite : neutralise l'heritage de `#root { text-align: center }`.
                Un recit long centre est penible a lire, chaque ligne demarrant a une abscisse
                differente. */}
            <div className="text-left space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Tous les parents le disent, et beaucoup s'y épuisent : redonner au livre sa place
                face aux écrans est devenu très difficile. Poser un album sur la table basse ne
                suffit pas. Pour qu'un enfant ait envie d'ouvrir un livre, il faut d'abord qu'il
                ait envie d'y entrer.
              </p>
              <p>
                My Crazy Family est né d'un cadeau. Pour le premier anniversaire de la fille de
                son meilleur ami, Robin du Fayet a fabriqué un livre personnalisé, de la première
                page à la dernière. En voyant l'enfant s'y reconnaître, il a compris qu'il ne
                tenait pas un cadeau isolé, mais une idée.
              </p>
              <p>
                À 33 ans, entouré de jeunes parents, il attend lui-même une petite fille pour
                septembre 2026. Ce sont les livres qu'il veut lui lire qu'il fabrique aujourd'hui.
              </p>
              <p>
                Pour que ces livres tiennent leur promesse, il s'est entouré. Violaine Lallour,
                psychologue clinicienne, accompagne les tout-petits et leurs familles depuis plus
                de vingt ans : elle relit chaque thème avant qu'il n'entre en production. Un
                collège de professeurs des écoles et d'auteurs jeunesse veille sur la justesse
                pédagogique et sur la qualité du récit.
              </p>
              <p>
                Le constat qui guide tout le reste est simple. Ce qui accroche un enfant, c'est de
                se reconnaître. Quand il retrouve son prénom, sa maison, son chien, sa grand-mère
                ou son doudou au fil des pages, il ne lit plus une histoire, il y participe. Ces
                personnages familiers reviennent d'un livre à l'autre et deviennent des repères.
                C'est par ces repères qu'il apprend, qu'il s'identifie et qu'il grandit.
              </p>
              <p>
                Chaque mois, un nouveau livre arrive, écrit pour l'âge qu'a l'enfant ce mois-là et
                construit autour de ceux qui comptent pour lui. Les parents répondent à quelques
                questions une seule fois, l'aventure démarre, et la collection se souvient ensuite
                de tout : les amis, la famille, les animaux, les lieux traversés. D'année en année,
                elle raconte une enfance.
              </p>
              <p>
                Un moment à passer ensemble le soir, un cadeau à offrir, et un bel objet à ranger
                dans la bibliothèque et à garder toute une vie.
              </p>
            </div>
          </section>

          {/* Notre équipe */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-mcf-secondary/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-mcf-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-mcf-primary">Notre équipe</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-left">
              {/* Violaine Lallour */}
              <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-mcf-primary/10 flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-mcf-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      Violaine Lallour
                    </h3>
                    <p className="text-sm text-mcf-secondary font-medium mb-2">
                      Psychologue clinicienne
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Experte du développement de l'enfant, Violaine assure la pertinence éducative
                      et psychologique de chaque histoire pour qu'elle accompagne sainement la croissance de vos enfants.
                    </p>
                  </div>
                </div>
              </div>

              {/* Robin du Fayet */}
              <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-mcf-secondary/10 flex items-center justify-center shrink-0">
                    <Feather className="w-6 h-6 text-mcf-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      Robin du Fayet
                    </h3>
                    <p className="text-sm text-mcf-secondary font-medium mb-2">
                      Fondateur
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Passionné par l'éducation et la narration, Robin porte la vision de My Crazy Family :
                      rendre chaque enfant acteur de son histoire et créer des moments magiques pour toute la famille.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-left text-muted-foreground mt-6">
              Au-delà de notre équipe, chaque livre est relu par un collège de professeurs des écoles
              et d'auteurs jeunesse, gage de sa justesse pédagogique et de sa richesse narrative.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default APropos;
