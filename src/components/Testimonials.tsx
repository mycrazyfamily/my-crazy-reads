import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  type: 'child' | 'parent' | 'rating' | 'quote';
  content: string;
  author: string;
  age?: string;
  role?: string;
  rating?: number;
}

const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      type: 'child',
      content: "C'est moi qui suis dans le livre ! Avec papa, maman, et même mon doudou. J'ai lu trois fois la même histoire ce soir !",
      author: "Léna",
      age: "5 ans"
    },
    {
      id: 2,
      type: 'parent',
      content: "Ce que j'aime dans My Crazy Family, c'est qu'on ne reçoit pas juste un livre. C'est une surprise pleine d'amour, un moment de complicité qu'on attend chaque mois avec ma fille.",
      author: "Sophie L.",
      role: "maman de Camille (6 ans)"
    },
    {
      id: 3,
      type: 'parent',
      content: "Les histoires sont belles, adaptées à l'âge, et en plus il y a une petite morale à la fin. Mon fils adore, et moi aussi.",
      author: "Karim D.",
      role: "papa de Yanis (4 ans)"
    },
    {
      id: 4,
      type: 'child',
      content: "C'est mon chat Mistigri qui parle dans l'histoire ! J'ai rigolé trop fort. J'ai hâte du prochain livre.",
      author: "Zoé",
      age: "7 ans"
    },
    {
      id: 5,
      type: 'rating',
      content: "Original, tendre et super bien fait. Une super idée de cadeau récurrent !",
      author: "Manon R.",
      age: "35 ans",
      rating: 5
    },
    {
      id: 6,
      type: 'quote',
      content: "Enfin un abonnement où mon enfant est vraiment le héros. Merci pour cette magie mensuelle !",
      author: "Julien C.",
      role: "papa de Maxime (8 ans)"
    }
  ];

  const renderTestimonial = (testimonial: Testimonial) => {
    const baseClasses = "bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1";
    
    switch (testimonial.type) {
      case 'child':
        return (
          <div className={`${baseClasses} border-4 border-mcf-secondary/30`}>
            <div className="flex items-start gap-4 mb-4">
              {/* Emplacement photo enfant */}
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-mcf-secondary/20 to-mcf-mint/20 flex items-center justify-center text-3xl shadow-md">
                👧
              </div>
              <div className="flex-1">
                <div className="text-4xl mb-2 text-mcf-secondary">"</div>
              </div>
            </div>
            <p className="text-base text-mcf-text/90 italic leading-relaxed mb-4">
              {testimonial.content}
            </p>
            <div className="text-right">
              <p className="text-lg font-bold text-mcf-primary">— {testimonial.author}</p>
              <p className="text-sm text-mcf-text/70">{testimonial.age}</p>
            </div>
          </div>
        );
      
      case 'parent':
        return (
          <div className={`${baseClasses} border-2 border-mcf-primary/20`}>
            <div className="flex items-start gap-4 mb-4">
              {/* Emplacement photo adulte */}
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-mcf-primary/20 to-mcf-mint/20 flex items-center justify-center text-2xl shadow-md">
                👤
              </div>
              <div className="flex-1">
                <p className="text-base text-mcf-text/80 leading-relaxed">
                  {testimonial.content}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-mcf-primary/10">
              <p className="text-base font-semibold text-mcf-secondary">— {testimonial.author}</p>
              <p className="text-sm text-mcf-text/70">{testimonial.role}</p>
            </div>
          </div>
        );
      
      case 'rating':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-white/95 to-mcf-mint/10 border-2 border-mcf-mint/30`}>
            <div className="flex items-center gap-4 mb-4">
              {/* Emplacement photo/avatar */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-mcf-mint/30 to-mcf-secondary/20 flex items-center justify-center text-xl shadow-md">
                🙂
              </div>
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-mcf-secondary text-mcf-secondary" />
                ))}
              </div>
            </div>
            <p className="text-base text-mcf-text/90 leading-relaxed mb-4">
              {testimonial.content}
            </p>
            <p className="text-sm font-medium text-mcf-primary">— {testimonial.author}, {testimonial.age}</p>
          </div>
        );
      
      case 'quote':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-mcf-primary/10 to-mcf-secondary/5 border-l-4 border-mcf-primary`}>
            <div className="flex items-start gap-4">
              {/* Emplacement photo adulte */}
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-mcf-primary/30 to-mcf-secondary/20 flex items-center justify-center text-2xl shadow-md">
                👤
              </div>
              <div className="flex-1">
                <p className="text-lg text-mcf-primary font-medium italic leading-relaxed mb-3">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="text-base font-semibold text-mcf-text">— {testimonial.author}</p>
                  <p className="text-sm text-mcf-text/70">{testimonial.role}</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Grid de témoignages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="flex">
            {renderTestimonial(testimonial)}
          </div>
        ))}
      </div>
      
      {/* Éléments décoratifs */}
      <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default Testimonials;
