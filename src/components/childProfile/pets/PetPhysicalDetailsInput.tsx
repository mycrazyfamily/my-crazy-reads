// PetPhysicalDetailsInput v3.0
// Changelog v3.0 (chantier C1b) : meme refonte que PhysicalDetailsInput v3.0, cote animal.
//   Le systeme d'etiquettes est remplace par une zone de texte libre, pour les memes raisons.
//   [1] PLUS DE VALIDATION PAR ENTREE. C'etait le seul champ du parcours a exiger un clic sur
//       + ou la touche Entree. Une saisie non validee etait perdue en silence.
//   [2] SUGGESTIONS SUPPRIMEES. « Oreilles tombantes », « Museau blanc », « Cicatrice » ne
//       portent ni emplacement ni taille. Elles donnaient au parent le sentiment d'avoir
//       repondu tout en produisant des prompts inexploitables.
//   [3] CONSIGNE DE PRECISION EXPLICITE, avec un exemple avant/apres adapte a l'animal.
//   [4] CASE « AUCUN DETAIL » SUPPRIMEE, champ facultatif.
//
//   FORMAT DE STOCKAGE INCHANGE : toujours un string[]. La zone de texte est stockee comme un
//   tableau a un seul element, vide quand rien n'est saisi. C'est la convention que PetForm
//   applique deja depuis sa v2.x et que 2C3_Merge_Pets_Logic documente cote n8n : un tableau
//   VIDE veut dire « aucun detail », le drapeau noPhysicalDetails n'est plus persiste.
//
//   COMPATIBILITE ASCENDANTE : une fiche existante a plusieurs etiquettes les voit reunies en
//   une phrase separee par des virgules, sans perte.
//
//   La prop petType devient inutile : elle ne servait qu'a choisir la liste de suggestions.
//   Elle reste dans la signature pour ne pas casser PetForm, mais n'est plus utilisee.
//   Idem pour onNoDetailsChange et noDetailsValue.
//
// PetPhysicalDetailsInput v2.1
// Changelog v2.1 : le SOUS-TITRE suit lui aussi l'espèce. Il annonçait encore
//   « taches de rousseur, grain de beauté, fossettes » sous des suggestions
//   devenues animales.
// PetPhysicalDetailsInput v2.0
// Changelog v2.0 :
//   (a) SUGGESTIONS ENFIN ANIMALES. Ce composant était un copier-coller du
//       composant humain : il proposait « fossettes », « appareil dentaire » et
//       « boucles d'oreilles » pour décrire un chien. Seul le placeholder avait
//       été corrigé en v1.3. La liste dépend désormais de l'ESPÈCE, via la prop
//       petType (chien, chat, ou générique pour lapin, oiseau, poisson, reptile).
//   (b) BLOCKLIST À LA SAISIE, identique au composant humain.
//
//   petType est OPTIONNEL : sans lui, la liste générique s'applique, déjà bien
//   plus juste que la liste humaine. Passez pets.type depuis PetForm pour obtenir
//   les listes chien et chat.
// PetPhysicalDetailsInput v1.3
// Changelog v1.3 : exemple adapté à l'ANIMAL (« Ex : cicatrice à la patte ») — ce composant est
//   celui utilisé par PetForm ; l'exemple précédent (« cicatrice au menton ») venait du gabarit
//   humain et n'avait pas de sens sur une fiche animal.
// PhysicalDetailsInput v1.2
// Changelog v1.2 (B4) : placeholder raccourci + « … » retiré (ne débordait plus mais restait long).
// PhysicalDetailsInput v1.1
// Changelog v1.1 : (a) B4 — exemple (placeholder) raccourci ; (b) B5 — après l'ajout d'un détail
//   personnalisé (le champ se vide alors que la chip apparaît plus haut dans « Détails
//   sélectionnés »), on affiche un « ✓ ajouté » ~2,5 s sous le champ, pour que l'utilisateur voie
//   que sa saisie a bien été prise en compte (notamment au « ✓ » du clavier iOS = onBlur).
import React, { useState, useRef, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { findForbiddenWords, forbiddenContentError } from '@/utils/nameBlocklist';

type PetPhysicalDetailsInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  /** @deprecated v3.0 : la case « Aucun détail » n'existe plus, le champ est facultatif. */
  onNoDetailsChange?: (hasNoDetails: boolean) => void;
  /** @deprecated v3.0 : voir onNoDetailsChange. */
  noDetailsValue?: boolean;
  /** @deprecated v3.0 : ne servait qu'à choisir la liste de suggestions, désormais supprimée. */
  petType?: string | null;
};

// Même plafond que le composant humain, pour que les deux formulaires se comportent pareil.
const MAX_CARACTERES = 200;

const PetPhysicalDetailsInput: React.FC<PetPhysicalDetailsInputProps> = ({
  value = [],
  onChange,
}) => {
  const [texte, setTexte] = useState<string>(() => (value ?? []).join(', '));
  const [erreurMot, setErreurMot] = useState<string | null>(null);
  const dernierEmis = useRef<string>((value ?? []).join(', '));

  useEffect(() => {
    const entrant = (value ?? []).join(', ');
    if (entrant !== dernierEmis.current) {
      setTexte(entrant);
      dernierEmis.current = entrant;
    }
  }, [value]);

  const handleChange = (nouveau: string) => {
    setTexte(nouveau);

    const propre = nouveau.trim();

    // Blocklist conservée depuis la v2.0 : refus à la saisie plutôt qu'après une trentaine
    // de secondes d'attente et un appel Gemini parti pour rien.
    const interdits = findForbiddenWords(propre);
    if (interdits.length > 0) {
      setErreurMot(forbiddenContentError(interdits));
      dernierEmis.current = '';
      onChange([]);
      return;
    }

    setErreurMot(null);
    dernierEmis.current = propre;
    onChange(propre ? [propre] : []);
  };

  const restants = MAX_CARACTERES - texte.length;

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">
          Des détails physiques marquants ?
        </Label>
        <p className="text-sm text-muted-foreground mt-1 leading-snug">
          Soyez précis : dites <strong>où</strong> et <strong>de quelle taille</strong>.
          Écrivez « grande tache blanche sur le poitrail » plutôt que « tache ».
          Laissez vide s'il n'y a rien de particulier.
        </p>
      </div>

      <div>
        <Textarea
          value={texte}
          onChange={(e) => handleChange(e.target.value)}
          maxLength={MAX_CARACTERES}
          rows={3}
          placeholder="Ex : grande tache blanche sur le poitrail, oreille gauche repliée"
          className="resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          {erreurMot ? (
            <p className="text-sm text-destructive leading-snug" role="alert">
              {erreurMot}
            </p>
          ) : (
            <span />
          )}
          <span
            className={`text-xs shrink-0 ml-2 ${restants <= 20 ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            {texte.length}/{MAX_CARACTERES}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PetPhysicalDetailsInput;
