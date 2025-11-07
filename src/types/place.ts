export type PlaceType = 'maison_principale' | 'maison_secondaire' | 'autre_parent' | 'vacances';

export interface PlaceDetails {
  // Common fields
  habitat_type?: string;
  nombre_pieces?: string;
  enfants_dans_meme_chambre?: boolean;
  bruit_sol?: boolean;
  jardin?: boolean;
  jardin_piscine?: boolean;
  jardin_ping_pong?: boolean;
  jardin_cabane?: boolean;
  jardin_autres?: string;
  piscine?: boolean;
  animaux_present?: string;
  salon_details?: string;
  television?: boolean;
  television_ou?: string;
  piece_jeu?: boolean;
  environnement?: string;
  frequence_utilisation?: string;
  habitat_type_autre?: string;
  enfants_chambre_avec_qui?: string;
  luminosite?: 'lumineux' | 'sombre';
  
  // For vacation places
  type_vacances?: string;
  frequence_annuelle?: string;
  hebergement_attitre?: boolean;
  famille_complete?: boolean;
  espace_partage?: boolean;
  activites?: string;
  repas_ou?: string;
  propre_lit?: boolean;
  objets_familiers?: boolean;
  objets_familiers_description?: string;
  souvenir_marquant?: string;
}

export interface PlaceData {
  id?: string;
  label: string;
  type: PlaceType;
  description?: string;
  emoji?: string;
  address?: string;
  city?: string;
  country?: string;
  details?: PlaceDetails;
  childLabel?: string; // Label for child_places pivot
}
