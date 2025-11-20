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

const Testimonials: React.FC = () => {
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
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-7xl mx-auto"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="bg-white rounded-xl border border-[#E0E0E0] p-6 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Photo placeholder */}
                <div className="flex justify-center mb-6">
                  <div 
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-border flex items-center justify-center"
                    aria-label={`Photo de ${testimonial.author}`}
                  >
                    <div className="w-16 h-16 rounded-full bg-muted" />
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
                    — {testimonial.author}
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
    </div>
  );
};

export default Testimonials;
