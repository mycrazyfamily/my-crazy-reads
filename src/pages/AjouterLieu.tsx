// AjouterLieu v1.4
// Changelog v1.4 (chantier D2, suite) : harmonisation de la sortie avec le formulaire enfant.
//   [1] « QUITTER » QUITTE VRAIMENT. Le bouton du haut revenait a l'ecran de selection des
//       enfants quand un formulaire etait ouvert. Confirmer « Quitter sans enregistrer »
//       pour se retrouver a l'etape 1 de la meme page n'a aucun sens : on part maintenant
//       a l'espace famille, comme le fait le formulaire enfant.
//   [2] LE BOUTON « ANNULER » DU BAS declenche la meme modale. Il naviguait directement,
//       sans rien demander, alors qu'il fait exactement la meme chose que le bouton du haut.
//   [3] FLECHE REMPLACEE PAR UNE CROIX + LE MOT « QUITTER », comme sur le formulaire enfant.
//       Un bouton icone seul ne disait pas ce qu'il faisait.
// Changelog D2 : avertissement avant de quitter le formulaire.
//   Le bouton de sortie en haut a gauche fait deux choses selon l'etat : s'il y a un
//   formulaire ouvert il revient a la selection, sinon il retourne a l'espace famille.
//   Dans le premier cas la saisie en cours est PERDUE, aucun brouillon n'existe sur cette
//   page. Une modale previent donc avant, variante 'perte' de LeaveFormDialog.
//   Le garde-fou est ACTIF UNIQUEMENT quand le formulaire est ouvert (showForm) : sur
//   l'ecran de selection il n'y a rien a perdre, avertir serait du bruit. Il couvre aussi
//   le bouton « Précédent » du navigateur, via useLeaveFormGuard.
// AjouterLieu  (chantier C3)
// Changelog C3 : la note « une maison principale est obligatoire » apparait desormais AVANT
//   la saisie, dans l'en-tete du formulaire, et plus seulement dans le toast d'erreur au
//   moment du blocage. Meme note qu'a l'etape Lieux du formulaire enfant (PlacesForm).
// AjouterLieu v1.2
// Changelog v1.2 : le garde-fou « maison principale requise » exige désormais une maison_principale
// ACTIVE (is_active !== false). Un principal INACTIF (on n'y vit plus) ne compte plus → cohérent
// avec PlacesForm (wizard de création). On peut toujours ajouter une nouvelle maison principale.
// AjouterLieu v1.1
// Changelog v1.1 : garde-fou — impossible d'ajouter un lieu non-principal si l'enfant n'a pas
// déjà une maison principale (vérifiée via child_places + places.type, pour chaque enfant
// sélectionné). Ne bloque pas la création de la maison principale elle-même.
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeaveFormDialog from '@/components/childProfile/LeaveFormDialog';
import { useLeaveFormGuard } from '@/hooks/useLeaveFormGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyIdSync } from '@/hooks/useFamilyIdSync';
import { toast } from 'sonner';
import { checkFreeTextFields, forbiddenFieldsError } from '@/utils/nameBlocklist';
import { useInvalidateFamilyData } from '@/hooks/useFamilyData';
import { PlaceForm } from '@/components/childProfile/places/PlaceForm';
import ChildSelectionCard from '@/components/childProfile/ChildSelectionCard';
import FormProgressIndicator from '@/components/FormProgressIndicator';
import type { PlaceData } from '@/types/place';

interface Child {
  id: string;
  firstName: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
}

export default function AjouterLieu() {
  const navigate = useNavigate();

  const invalidateFamilyData = useInvalidateFamilyData();
  const { childId } = useParams<{ childId?: string }>();
  const { user, supabaseSession } = useAuth();
  
  // Synchroniser automatiquement le family_id
  useFamilyIdSync();
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  // D2 : garde-fou de sortie. Actif seulement quand un formulaire est ouvert.
  const {
    confirmationOuverte,
    setConfirmationOuverte,
    demanderSortie,
    confirmerSortie,
  } = useLeaveFormGuard({ actif: showForm });

  const handleSortie = () => {
    // La modale ne s'affiche que si un formulaire est ouvert : sur l'ecran de selection
    // il n'y a rien a perdre. Dans les deux cas on quitte la page, on ne revient plus a
    // l'ecran de selection.
    if (showForm) {
      demanderSortie(() => navigate('/espace-famille'));
    } else {
      navigate('/espace-famille');
    }
  };
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revenir en haut quand on passe de la sélection d'enfant au formulaire (et inversement)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [showForm]);

  useEffect(() => {
    if (supabaseSession?.user) {
      fetchChildren();
    }
  }, [supabaseSession]);

  useEffect(() => {
    // Si childId est fourni en paramètre URL, pré-sélectionner cet enfant
    if (childId && children.length > 0) {
      setSelectedChildIds([childId]);
      setShowForm(true);
    }
  }, [childId, children]);

  const fetchChildren = async () => {
    if (!supabaseSession?.user) return;

    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('id, first_name, birth_date, gender, created_at')
        .eq('user_id', supabaseSession.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedChildren = (data || []).map((profile: any) => ({
        id: profile.id,
        firstName: profile.first_name || 'Enfant',
        lastName: '',
        birthDate: profile.birth_date,
        gender: profile.gender
      }));

      setChildren(mappedChildren);
    } catch (error) {
      console.error('Erreur lors de la récupération des enfants:', error);
      toast.error('Erreur lors de la récupération des enfants');
    } finally {
      setLoading(false);
    }
  };

  const toggleChildSelection = (childId: string) => {
    setSelectedChildIds(prev => 
      prev.includes(childId) 
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const handleContinue = () => {
    if (selectedChildIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un enfant');
      return;
    }
    setShowForm(true);
  };

  const handleAddPlace = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (selectedChildIds.length === 0) {
        toast.error('Veuillez sélectionner au moins un enfant');
        return;
      }


      // v2.0 — blocklist sur les champs libres du lieu. Ces textes partent dans
      // enrich-place-environment puis dans les prompts d'image : un mot interdit
      // s'y glisserait jusque dans le décor du livre.
      // Les clés de `details` varient selon le type de lieu (environnement,
      // activités, souvenir marquant, détails du jardin…) : plutôt que de les
      // énumérer et d'en oublier une au prochain champ ajouté, on balaie toutes
      // les valeurs textuelles de l'objet.
      const champsLibres = checkFreeTextFields({
        'le nom du lieu': currentPlaceData.label,
        'la description': currentPlaceData.description,
        'la ville': currentPlaceData.city,
        'le pays': currentPlaceData.country,
        "l'adresse": currentPlaceData.address,
        'les précisions du lieu': Object.values(currentPlaceData.details || {})
          .filter((v) => typeof v === 'string') as string[],
      });
      if (!champsLibres.ok) {
        toast.error(forbiddenFieldsError(champsLibres));
        return;
      }

      const errors: string[] = [];
      const details = currentPlaceData.details || {};

      if (!currentPlaceData.label?.trim()) errors.push("Nom du lieu");
      if (!currentPlaceData.type) errors.push("Type de lieu");
      if (!currentPlaceData.city || !currentPlaceData.city.trim()) errors.push("Ville");
      if (!currentPlaceData.country || !currentPlaceData.country.trim()) errors.push("Pays");

      if (currentPlaceData.type === 'vacances') {
        if (!details.type_vacances) errors.push("Type de lieu de vacances");
        if (!details.environnement || !details.environnement.trim()) errors.push("Description de l'environnement");
        if (!details.activites || !details.activites.trim()) errors.push("Activités habituelles");
      } else {
        if (!details.habitat_type) errors.push("Type de logement");
        if (details.habitat_type === 'Autre' && (!details.habitat_type_autre || !details.habitat_type_autre.trim())) errors.push("Précision du type de logement");
        if (!details.environnement || !details.environnement.trim()) errors.push("Description de l'environnement autour du logement");
        if (details.jardin === undefined) errors.push("Présence d'un jardin ou d'une cour (oui/non)");
        if (details.jardin && (!details.jardin_elements || !details.jardin_elements.trim())) errors.push("Éléments marquants du jardin");
      }

      if (errors.length > 0) {
        toast.error('Veuillez compléter les champs obligatoires', {
          description: `Champs manquants:\n• ${errors.join('\n• ')}`,
        });
        return;
      }

      // Garde-fou : un enfant doit avoir une maison principale AVANT tout autre type de lieu.
      // On ne bloque QUE si le lieu qu'on ajoute maintenant n'est pas lui-même la principale —
      // sinon on empêcherait justement de la créer.
      if (currentPlaceData.type !== 'maison_principale') {
        const { data: childPlacesLinks, error: checkError } = await supabase
          .from('child_places')
          .select('child_id, places(type, is_active)')
          .in('child_id', selectedChildIds);

        if (checkError) {
          console.error('Error checking maison principale:', checkError);
        } else {
          const childrenWithPrincipal = new Set(
            (childPlacesLinks || [])
              .filter((l: any) => l.places?.type === 'maison_principale' && l.places?.is_active !== false)
              .map((l: any) => l.child_id)
          );
          const missing = selectedChildIds.filter(id => !childrenWithPrincipal.has(id));

          if (missing.length > 0) {
            const names = missing
              .map(id => children.find(c => c.id === id)?.firstName)
              .filter(Boolean)
              .join(', ');
            toast.error(`Ajoutez d'abord une maison principale pour ${names} avant d'ajouter un autre type de lieu`);
            return;
          }
        }
      }

      let familyId: string | null = null;

      // 1. Récupérer le family_id depuis le profil enfant
      const { data: childProfile, error: childError } = await supabase
        .from('child_profiles')
        .select('family_id')
        .eq('id', selectedChildIds[0])
        .maybeSingle();

      if (!childError && childProfile?.family_id) {
        familyId = childProfile.family_id;
        console.log('family_id récupéré depuis child_profiles:', familyId);
      }

      // 2. Si pas de family_id trouvé, vérifier le user_profile
      if (!familyId) {
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', supabaseSession!.user.id)
          .maybeSingle();

        if (profileError) {
          toast.error('Impossible de récupérer les informations de famille');
          return;
        }

        familyId = userProfile.family_id;
      }

      // 3. Si toujours pas de family_id, en créer une nouvelle
      if (!familyId) {
        console.log('Aucune famille trouvée, création en cours...');
        const { data: newFamily, error: familyError } = await supabase
          .from('families')
          .insert([{ 
            name: 'Ma famille',
            created_by: supabaseSession!.user.id 
          }])
          .select()
          .single();

        if (familyError) {
          console.error('Error creating family:', familyError);
          toast.error('Erreur lors de la création de la famille');
          return;
        }

        familyId = newFamily.id;
        console.log('Famille créée avec succès:', familyId);
      }

      // 4. Créer le lieu dans la table places
      const { data: place, error: placeError } = await supabase
        .from('places')
        .insert({
          label: currentPlaceData.label,
          type: currentPlaceData.type,
          description: currentPlaceData.description || null,
          emoji: currentPlaceData.emoji || null,
          address: currentPlaceData.address || null,
          city: currentPlaceData.city || null,
          country: currentPlaceData.country || null,
          details: (currentPlaceData.details || {}) as any,
          created_by: supabaseSession!.user.id,
          family_id: familyId,
          is_active: true
        })
        .select()
        .single();

      if (placeError) throw placeError;

      // 5. Lier le lieu à chaque enfant sélectionné
      const childPlaceRecords = selectedChildIds.map(childProfileId => ({
        child_id: childProfileId,
        place_id: place.id
      }));

      const { error: linkError } = await supabase
        .from('child_places')
        .insert(childPlaceRecords);

      if (linkError) throw linkError;

      toast.success('Lieu de vie ajouté avec succès !');
      invalidateFamilyData();
      navigate('/espace-famille');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du lieu:', error);
      toast.error('Erreur lors de l\'ajout du lieu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [currentPlaceData, setCurrentPlaceData] = useState<PlaceData>({
    label: '',
    type: 'maison_principale' as any,
    details: {}
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcf-orange mx-auto mb-4"></div>
          <p className="text-mcf-orange-dark">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={handleSortie}
            className="flex items-center gap-2 border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10"
          >
            <X className="h-4 w-4" />
            Quitter
          </Button>
          <h1 className="text-3xl font-bold text-mcf-orange-dark">Ajouter un lieu de vie</h1>
        </div>

        <LeaveFormDialog
          open={confirmationOuverte}
          onOpenChange={setConfirmationOuverte}
          onConfirm={confirmerSortie}
          variante="perte"
        />

        <FormProgressIndicator 
          currentStep={showForm ? 1 : 0}
          totalSteps={2}
          stepLabels={['Sélection', 'Informations']}
        />

        {!showForm ? (
          <>
            {children.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-mcf-orange-dark">
                    Sélectionnez le(s) enfant(s) concerné(s)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Vous pouvez sélectionner plusieurs enfants pour leur ajouter le même lieu de vie
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {children.map((child) => (
                      <ChildSelectionCard
                        key={child.id}
                        child={child}
                        selected={selectedChildIds.includes(child.id)}
                        onToggle={toggleChildSelection}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {selectedChildIds.length} enfant(s) sélectionné(s)
                    </p>
                    <Button
                      onClick={handleContinue}
                      disabled={selectedChildIds.length === 0}
                      className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2"
                    >
                      Continuer <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {children.length === 0 && (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <p className="text-lg font-medium text-mcf-orange-dark">
                    Aucun enfant trouvé
                  </p>
                  <p className="text-gray-600">
                    Vous devez d'abord créer le profil d'un enfant pour pouvoir lui ajouter des lieux de vie.
                  </p>
                  <Button 
                    className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2"
                    onClick={() => navigate('/creer-profil-enfant')}
                  >
                    <Plus className="h-4 w-4" /> Créer le profil d'un enfant
                  </Button>
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-mcf-orange-dark flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nouveau lieu de vie
                <span className="text-sm font-normal text-gray-600">
                  pour {selectedChildIds.map(id => children.find(c => c.id === id)?.firstName).join(', ')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* C3 : le garde-fou « maison principale requise » n'etait annonce qu'au moment
                  du blocage. Un parent pouvait saisir plusieurs residences secondaires avant
                  de decouvrir qu'il lui manquait le lieu de reference. */}
              <p className="text-sm text-muted-foreground mb-4 leading-snug">
                <strong>Une maison principale est obligatoire</strong> pour chaque enfant : c'est
                le lieu de référence de ses histoires. Les autres lieux sont facultatifs.
              </p>
              <PlaceForm 
                place={currentPlaceData}
                onChange={setCurrentPlaceData}
              />
              <div className="flex justify-between mt-6">
                <Button 
                  type="button" 
                  onClick={handleSortie}
                  variant="outline"
                >
                  Annuler
                </Button>
                
                <Button 
                  type="button"
                  onClick={handleAddPlace}
                  disabled={isSubmitting}
                  className="bg-mcf-primary hover:bg-mcf-primary-dark text-white"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
