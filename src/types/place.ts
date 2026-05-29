export type PlaceType = 'maison_principale' | 'maison_secondaire' | 'autre_parent' | 'vacances';

export interface PlaceDetails {

  // Maison — champs actifs

  habitat_type?: string;

  habitat_type_autre?: string;

  environnement?: string;

  environnement_auto?: string; // généré par Edge Function enrich-place-environment

  jardin?: boolean;

  jardin_elements?: string; // nouveau — remplace piscine/ping-pong/cabane séparés

  // Vacances — champs actifs

  type_vacances?: string;

  activites?: string;

  // environnement réutilisé pour vacances aussi

  // Champs legacy (conservés pour compatibilité données existantes en base — non affichés en front)

  nombre_pieces?: string;

  enfants_dans_meme_chambre?: boolean;

  enfants_chambre_avec_qui?: string;

  bruit_sol?: boolean;

  jardin_piscine?: boolean;

  jardin_ping_pong?: boolean;

  jardin_cabane?: boolean;

  jardin_autres?: string;

  jardin_autres_1?: string;

  jardin_autres_2?: string;

  jardin_autres_3?: string;

  noJardinDetails?: boolean;

  piscine?: boolean;

  animaux_present?: string;

  salon_details?: string;

  television?: boolean;

  television_ou?: string;

  piece_jeu?: boolean;

  frequence_utilisation?: string;

  autre_detail_1?: string;

  autre_detail_2?: string;

  autre_detail_3?: string;

  noAutreDetails?: boolean;

  luminosite?: 'lumineux' | 'sombre';

  // Vacances legacy

  frequence_annuelle?: string;

  hebergement_attitre?: boolean;

  famille_complete?: boolean;

  espace_partage?: boolean;

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

  childLabel?: string;

  linkedChildrenIds?: string[];

}
