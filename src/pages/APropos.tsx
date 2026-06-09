import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart, Users, Sparkles, ArrowLeft } from 'lucide-react';

const APropos: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Header */}
          <div className="mb-12">
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
            <p className="text-lg text-muted-foreground max-w-2xl">
              My Crazy Family crée des livres personnalisés qui transforment chaque enfant en héros de sa propre histoire.
            </p>
          </div>

          {/* Notre mission */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-mcf-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-mcf-primary" />
              </div>
              <h2 className="text-2xl font-bold text-mcf-primary">Notre mission</h2>
            </div>
            <div className="prose prose-lg text-muted-foreground max-w-none">
              <p>
                Chez My Crazy Family, nous croyons que chaque enfant mérite de se voir comme le héros d'une belle aventure.
                Notre mission est de créer des livres personnalisés de qualité qui nourrissent l'imaginaire,
                renforcent la confiance en soi et créent des souvenirs familiaux précieux.
              </p>
              <p>
                Chaque mois, nous proposons un nouveau thème éducatif et ludique — de l'écologie aux émotions,
                en passant par la culture et la créativité — pour accompagner l'épanouissement de votre enfant de 0 à 10 ans.
              </p>
            </div>
          </section>

          {/* Notre équipe */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-mcf-secondary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-mcf-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-mcf-primary">Notre équipe</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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
                      Psychologue pour enfants
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
                    <Sparkles className="w-6 h-6 text-mcf-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      Robin du Fayet
                    </h3>
                    <p className="text-sm text-mcf-secondary font-medium mb-2">
                      CEO
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Passionné par l'éducation et la narration, Robin porte la vision de My Crazy Family :
                      rendre chaque enfant acteur de son histoire et créer des moments magiques pour toute la famille.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Valeurs */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-mcf-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-mcf-primary" />
              </div>
              <h2 className="text-2xl font-bold text-mcf-primary">Nos valeurs</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: 'Personnalisation', desc: 'Chaque livre est unique, façonné autour de l\'enfant et de sa famille.' },
                { title: 'Éducation', desc: 'Des thèmes riches et variés pour apprendre en s\'amusant.' },
                { title: 'Qualité', desc: 'Des ouvrages imprimés avec soin, conçus pour durer dans le temps.' },
              ].map((value) => (
                <div
                  key={value.title}
                  className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default APropos;
