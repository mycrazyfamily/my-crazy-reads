// PhysicalDetailsInput v3.0
// Changelog v3.0 (chantier C1a) : le systeme d'etiquettes est remplace par une zone de
//   texte libre. Quatre raisons, toutes venues du test utilisateur.
//   [1] PLUS DE VALIDATION PAR ENTREE. La testeuse a saisi « cicatrices a droite » puis est
//       passee a la suite sans cliquer sur +, et sa saisie a ete perdue. C'etait le seul
//       champ du parcours qui demandait une validation explicite, et sur mobile la petite
//       croix du clavier n'aide pas. Une zone de texte n'a rien a valider : ce qui est
//       ecrit est enregistre.
//   [2] SUGGESTIONS SUPPRIMEES. « Cicatrice », « Grain de beaute », « Tache de naissance »
//       ne portent ni emplacement ni taille. Elles produisaient des prompts inexploitables
//       tout en donnant au parent le sentiment d'avoir repondu. Les retirer force la
//       description utile.
//   [3] CONSIGNE DE PRECISION EXPLICITE. Le libelle demande maintenant l'endroit et la
//       taille, avec un exemple avant/apres.
//   [4] CASE « AUCUN DETAIL » SUPPRIMEE, et le champ devient facultatif. Elle ne servait
//       qu'a debloquer le bouton Suivant (validation recopiee dans quatre fichiers, toutes
//       retirees dans ce meme lot). Le drapeau noPhysicalDetails n'etait deja plus persiste
//       en base, cf. l'en-tete de useChildProfileSubmit.
//
//   FORMAT DE STOCKAGE INCHANGE : toujours un string[], donc rien ne bouge en base ni dans
//   les prompts n8n. La zone de texte est stockee comme un tableau a un seul element.
//   Une zone vide produit [] et NON [""] : c'est ce [""] qui fabriquait le « signes
//   particuliers: » suivi de rien dans 3_Build_Master_Prompt. Dette reglee au passage.
//
//   COMPATIBILITE ASCENDANTE : un profil existant qui porte plusieurs etiquettes les voit
//   reunies en une phrase separee par des virgules, sans perte.
//
//   Les props onNoDetailsChange et noDetailsValue sont conservees dans la signature pour ne
//   pas casser les appelants, mais ne sont plus utilisees.
//
// PhysicalDetailsInput v2.0
// Changelog v2.0 :
//   (a) BLOCKLIST À LA SAISIE. Un mot interdit est refusé AVANT l'enregistrement,
//       avec le mot fautif nommé. Sans ça, le parent attendait une trentaine de
//       secondes pour apprendre que sa description était refusée, et un appel
//       Gemini partait pour rien. Le champ n'est pas vidé : il corrige sur place.
//   (b) La liste de suggestions vient de @/constants/physicalDetailsOptions, aux
//       côtés des listes animales, pour qu'on ne puisse plus en modifier une sans
//       voir les autres.
// PhysicalDetailsInput v1.1  ⚠️ Composant ENFANT + PROCHE (l'ANIMAL a son propre fichier :
//   pets/PetPhysicalDetailsInput.tsx). Importé par BasicInfoForm ('./PhysicalDetailsInput') et par
//   relatives/RelativeAppearanceSection ('../PhysicalDetailsInput').
// Changelog v1.1 : (a) B4 — placeholder raccourci (l'exemple était coupé sur mobile) ; (b) B5 —
//   après l'ajout d'un détail personnalisé, le champ se vide alors que la chip apparaît plus haut
//   dans « Détails sélectionnés » : on affiche désormais un « ✓ … ajouté à la liste » ~2,5 s sous
//   le champ (couvre aussi le « ✓ » du clavier iOS, qui déclenche onBlur) ; (c) nom interne du
//   composant corrigé (il s'appelait PetPhysicalDetailsInput par héritage d'un copier-coller, ce
//   qui prêtait à confusion avec le composant animal) — export default inchangé, aucun impact.
import React, { useState, useRef, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { findForbiddenWords, forbiddenContentError } from '@/utils/nameBlocklist';

type PhysicalDetailsInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  /** @deprecated v3.0 : la case « Aucun détail » n'existe plus, le champ est facultatif. */
  onNoDetailsChange?: (hasNoDetails: boolean) => void;
  /** @deprecated v3.0 : voir onNoDetailsChange. */
  noDetailsValue?: boolean;
};

// 200 caractères : assez pour « grande cicatrice sur la joue droite, tache de naissance dans
// le cou », trop court pour un paragraphe qui noierait le prompt d'image.
const MAX_CARACTERES = 200;

const PhysicalDetailsInput: React.FC<PhysicalDetailsInputProps> = ({
  value = [],
  onChange,
}) => {
  // Le texte affiché vit en local pour que la frappe reste fluide (espaces, virgules).
  // Il est initialisé depuis value, ce qui reprend sans perte les anciens profils à étiquettes.
  const [texte, setTexte] = useState<string>(() => (value ?? []).join(', '));
  const [erreurMot, setErreurMot] = useState<string | null>(null);
  // Mémorise ce qu'on a émis en dernier, pour distinguer un changement venu du parent
  // (réinitialisation du formulaire, chargement d'un profil) d'un simple aller-retour.
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

    // Blocklist conservée depuis la v2.0 : on refuse à la saisie plutôt qu'après une
    // trentaine de secondes d'attente et un appel Gemini parti pour rien.
    const interdits = findForbiddenWords(propre);
    if (interdits.length > 0) {
      setErreurMot(forbiddenContentError(interdits));
      // Rien de fautif ne part dans le formulaire tant que la saisie n'est pas corrigée.
      dernierEmis.current = '';
      onChange([]);
      return;
    }

    setErreurMot(null);
    dernierEmis.current = propre;
    // Tableau vide et non [""] quand il n'y a rien : voir l'en-tête.
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
          Écrivez « grande cicatrice sur la joue droite » plutôt que « cicatrice ».
          Laissez vide s'il n'y a rien de particulier.
        </p>
      </div>

      <div>
        <Textarea
          value={texte}
          onChange={(e) => handleChange(e.target.value)}
          maxLength={MAX_CARACTERES}
          rows={3}
          placeholder="Ex : grande cicatrice sur la joue droite, tache de naissance dans le cou"
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

export default PhysicalDetailsInput;
