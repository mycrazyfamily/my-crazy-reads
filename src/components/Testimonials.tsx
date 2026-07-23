// Testimonials v1.2
// Changelog v1.2 (CRÉDIBILITÉ) : les portraits sont remplacés par des pastilles d'initiales.
//   Les photos utilisées étaient des visuels générés (lumière et cadrage identiques, arrière-plans
//   génériques) : un visiteur qui les identifie comme fausses en déduit mécaniquement que les avis
//   le sont aussi, ce qui détruit la réassurance construite sur le reste de la page. Une pastille
//   d'initiales n'affirme rien de faux, reste élégante, et c'est déjà le bon format pour quand ces
//   textes seront remplacés par de vrais retours.
//   PAS d'étoiles, volontairement : une note chiffrée est l'élément le plus encadré par l'article
//   L111-7-2 du Code de la consommation, et six notations identiques se lisent comme un gabarit.
//   À ajouter le jour où les avis seront réels et collectés via un tiers (Trustpilot ou
//   équivalent).
//   Le champ `image` a été retiré de l'interface : il n'était plus utilisé. Les fichiers
//   /lovable-uploads/testimonials/*.png peuvent être supprimés du dépôt.
//   ⚠️ RAPPEL : ces six textes sont des placeholders, à remplacer par de vrais témoignages.
// Testimonials v1.1
// Changelog v1.1 (C5, MOBILE) : le carrousel fonctionnait déjà, mais rien n'indiquait qu'on pouvait
//   faire défiler — les flèches sont masquées sous md: et chaque carte occupait 100% de la largeur,
//   donc l'écran ressemblait à une carte unique et figée. Deux affordances ajoutées, mobile seulement :
//   (a) les cartes passent à 85% de largeur → la suivante « dépasse » sur le bord, signal universel
//       qu'il y a du contenu à droite ;
//   (b) des points indicateurs cliquables sous le carrousel, avec le point actif allongé.
//   Le suivi de position utilise l'API embla exposée par le composant shadcn (setApi). Le state est
//   typé `any` volontairement : selon la version du composant carousel.tsx, le type CarouselApi
//   n'est pas toujours exporté — un import de type manquant casserait le build, alors qu'ici, dans
//   le pire des cas (setApi non supporté), les points ne s'affichent simplement pas (garde count>1).
//   Desktop strictement inchangé : largeurs md:/lg: identiques, flèches identiques, points masqués.
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
interface Testimonial {
  id: number;
  content: string;
  author: string;
  subtitle: string;
}

/** « Sophie L. » → « SL », « Léna » → « L ». Deux caractères maximum. */
const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
const Testimonials: React.FC = () => {
  const [api, setApi] = React.useState<any>(null);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on('select', onSelect);
    return () => {
      api.off?.('select', onSelect);
    };
  }, [api]);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      content: "C'est moi qui suis dans le livre ! Avec papa, maman, et même mon doudou. J'ai lu trois fois la même histoire ce soir !",
      author: "Léna",
      subtitle: "5 ans"
    },
    {
      id: 2,
      content: "Ce que j'aime dans My Crazy Family, c'est qu'on ne reçoit pas juste un livre. C'est une surprise pleine d'amour, un moment de complicité qu'on attend chaque mois avec ma fille.",
      author: "Sophie L.",
      subtitle: "maman de Camille (6 ans)"
    },
    {
      id: 3,
      content: "Les histoires sont belles, adaptées à l'âge, et en plus il y a une petite morale à la fin. Mon fils adore, et moi aussi.",
      author: "Karim D.",
      subtitle: "papa de Yanis (4 ans)"
    },
    {
      id: 4,
      content: "C'est mon chat Mistigri qui parle dans l'histoire ! J'ai rigolé trop fort. J'ai hâte du prochain livre.",
      author: "Zoé",
      subtitle: "7 ans"
    },
    {
      id: 5,
      content: "Original, tendre et super bien fait. Une super idée de cadeau récurrent !",
      author: "Manon R.",
      subtitle: "35 ans"
    },
    {
      id: 6,
      content: "Enfin un abonnement où mon enfant est vraiment le héros. Merci pour cette magie mensuelle !",
      author: "Julien C.",
      subtitle: "papa de Maxime (8 ans)"
    }
  ];
  return (
    <div className="relative w-full">
      {/* Carousel */}
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-7xl mx-auto"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3">
              <div className="bg-white rounded-xl border border-[#E0E0E0] p-6 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Pastille d'initiales — remplace le portrait (voir bannière v1.2) */}
                <div className="flex justify-center mb-6">
                  <div
                    className="w-28 h-28 rounded-full bg-mcf-secondary/15 border-2 border-mcf-secondary/30 flex items-center justify-center shadow-sm select-none"
                    aria-hidden="true"
                  >
                    <span className="text-3xl font-bold text-mcf-primary tracking-wide">
                      {getInitials(testimonial.author)}
                    </span>
                  </div>
                </div>
                {/* Citation */}
                <div className="flex-1 mb-6">
                  <p className="text-[#333] text-base md:text-lg leading-relaxed text-center">
                    "{testimonial.content}"
                  </p>
                </div>
                {/* Auteur */}
                <div className="text-center">
                  <p className="text-[#2272e4] font-semibold text-base mb-1">
                    {testimonial.author}
                  </p>
                  <p className="text-[#777] text-sm">
                    {testimonial.subtitle}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" aria-label="Témoignage précédent" />
        <CarouselNext className="hidden md:flex" aria-label="Témoignage suivant" />
      </Carousel>

      {/* Points indicateurs — mobile uniquement (le desktop a déjà ses flèches). */}
      {count > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2 md:hidden">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => api?.scrollTo(index)}
              aria-label={`Aller au témoignage ${index + 1}`}
              aria-current={index === current}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === current ? 'w-6 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default Testimonials;
