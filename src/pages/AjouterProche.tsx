// AjouterProche v1.7 (08/10/2026)
// Changelog v1.7 : VERROU ANTI DOUBLE CLIC.
//   Test du 08/10 : un double tap sur mobile lancait DEUX enregistrements, donc deux
//   generations d'avatar. Le garde existant lisait un etat React, qui ne change qu'au
//   rafraichissement suivant : un second tap rapide passait. Un ref, lu et ecrit sans attendre,
//   bloque desormais des le premier tap. En cas de succes, le bouton RESTE verrouille jusqu'au
//   depart de la page (avant, il se reactivait pendant la navigation). En cas d'erreur ou de
//   saisie refusee, il se libere pour permettre de corriger.
// AjouterProche v1.6
// Changelog v1.6 : plus d'alerte « Quitter le site ? » apres l'enregistrement. Le garde-fou
//   de sortie (useLeaveFormGuard v1.2) est libere juste avant le rechargement vers l'espace
//   famille. Avant, Chrome affichait son avertissement alors que le proche etait bien
//   enregistre, et « Annuler » puis un nouvel enregistrement creait un doublon.
// AjouterProche v1.5
// Changelog v1.5 (chantier D2, suite) : harmonisation de la sortie avec le formulaire enfant.
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
// AjouterProche v1.3
// Changelog v1.3 (chantier C1a, correctif) : ecriture directe de physical_details. La branche
//   pilotee par noPhysicalDetails ecrivait [""] quoi que le parent saisisse. Voir ModifierProche v1.9.
// AjouterProche v1.2
// Changelog v1.2 (chantier C1a) : retrait de la validation « au moins un detail physique OU
//   case cochee ». Voir PhysicalDetailsInput v3.0 et BasicInfoForm v1.3. Details physiques
//   desormais facultatifs.
// AjouterProche v1.1
// (la version d'origine ne portait pas de banniere, consideree v1.0)
// Changelog v1.1 :
//   LOT F3 — fin du double encodage des colonnes jsonb. physical_details et clothing_style, sur
//   child_profiles, family_members et pets, sont toutes de type jsonb. Passer une CHAINE produite
//   par JSON.stringify fait stocker a Postgres une valeur JSON de type chaine et non un tableau :
//   la base contenait "[\"Collier bleu\"]" au lieu de ["Collier bleu"]. Le client Supabase
//   serialise deja, il faut lui donner la valeur NATIVE.
//   ORIGINE : la migration 20251104184653 a converti ces colonnes de text vers jsonb. Le code
//   etait CORRECT avant : on stockait une chaine dans une colonne texte. La migration l'a rendu
//   faux sans rien casser visiblement, donc sans que personne le voie.
//   Consequence mesuree : 4D2_Enrich_Context du Book Factory utilise clothing_style en fallback
//   direct quand clothing_style_resolved manque, SANS le deballer : le livre recevait la chaine
//   brute avec ses guillemets et ses antislashs.
//   Les lectures qui deballent jusqu'a 3 niveaux sont volontairement CONSERVEES : les lignes deja
//   en base restent doublement encodees et doivent rester lisibles.
//   Deux ecritures corrigees ici : physical_details et clothing_style sur family_members.

import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import LeaveFormDialog from '@/components/childProfile/LeaveFormDialog';
import { useLeaveFormGuard } from '@/hooks/useLeaveFormGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyIdSync } from '@/hooks/useFamilyIdSync';
import { splitCamelCase } from '@/utils/nameFormatter';
import { toast } from 'sonner';
import { useInvalidateFamilyData } from '@/hooks/useFamilyData';
import { signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';
import RelativeForm from '@/components/childProfile/RelativeForm';
import { FORBIDDEN_NAME_ERROR, checkFreeTextFields, containsForbiddenWord, forbiddenFieldsError } from '@/utils/nameBlocklist';
import ErrorBoundary from '@/components/util/ErrorBoundary';
import ChildSelectionCard from '@/components/childProfile/ChildSelectionCard';
import FormProgressIndicator from '@/components/FormProgressIndicator';
import type { RelativeData } from '@/types/childProfile';
import { v4 as uuidv4 } from 'uuid';

interface Child {
  id: string;
  firstName: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
}

export default function AjouterProche() {
  const navigate = useNavigate();

  const invalidateFamilyData = useInvalidateFamilyData();
  const queryClient = useQueryClient();
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
    libererSortie, // v1.6
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
  const [relativeKey, setRelativeKey] = useState(0); // Pour forcer la réinitialisation du formulaire
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false); // v1.7 : verrou synchrone anti double clic

  // Fonction pour créer un formulaire vide pour un nouveau proche
  const createEmptyRelative = (): RelativeData => ({
    id: '',
    type: 'grandfather',
    firstName: '',
    age: '',
    job: '',
    gender: 'male',
    nickname: { type: 'none' },
    skinColor: { type: 'light' },
    hairColor: { type: 'brown' },
    hairType: 'straight',
    glasses: false,
    traits: [],
    customTraits: {}
  });

  useEffect(() => {
    if (supabaseSession?.user) {
      fetchChildren();
    }
  }, [supabaseSession]);

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
    setRelativeKey(prev => prev + 1); // Force la réinitialisation du formulaire
    setShowForm(true);
  };

  const handleAddRelative = async (relativeData: RelativeData) => {
    if (isSubmittingRef.current) return; // v1.7 : verrou synchrone
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    let reussi = false; // v1.7
    try {
      // Validation des champs obligatoires
      const errors: string[] = [];

      if (!relativeData.firstName?.trim()) errors.push("le prénom");

      // Blocklist : prénom et surnom personnalisé
      if (containsForbiddenWord(relativeData.firstName)) {
        toast.error(FORBIDDEN_NAME_ERROR);
        return;
      }
      if (relativeData.nickname?.type === 'custom' && containsForbiddenWord(relativeData.nickname.custom)) {
        toast.error(FORBIDDEN_NAME_ERROR);
        return;
      }

      // v2.0 — blocklist sur TOUS les champs libres, pas seulement le prénom.
      // Un seul appel ici plutôt qu'une garde par champ : c'est le seul endroit
      // de l'écran où ils sont tous réunis.
      const champsLibres = checkFreeTextFields({
        'les détails physiques': relativeData.physicalDetails,
        'la tenue': relativeData.clothingStyle,
        'le métier': relativeData.job,
        'le type de relation': relativeData.otherTypeName,
        'le type de cheveux': relativeData.hairTypeCustom,
        'la couleur des cheveux': relativeData.hairColor?.custom,
        'la couleur de peau': relativeData.skinColor?.custom,
        'la couleur des yeux': (relativeData.eyeColor as any)?.custom,
        'les traits de caractère': Object.values(relativeData.customTraits || {})
          .filter((v) => typeof v === 'string') as string[],
      });
      if (!champsLibres.ok) {
        toast.error(forbiddenFieldsError(champsLibres));
        return;
      }

      if (!relativeData.type) errors.push("le type de relation");
      if (relativeData.type === 'other' && !relativeData.otherTypeName?.trim()) {
        errors.push("la description du type de relation personnalisé");
      }
      
      // Gender must always be male or female
      if (relativeData.gender !== 'male' && relativeData.gender !== 'female') {
        errors.push("le genre (Homme / Femme)");
      }

      // Date de naissance
      if (!relativeData.birthDate) {
        errors.push("la date de naissance");
      }
      
      if (relativeData.nickname.type === 'custom' && !relativeData.nickname.custom?.trim()) {
        errors.push("le surnom personnalisé");
      }
      if (relativeData.skinColor.type === 'custom' && !relativeData.skinColor.custom?.trim()) {
        errors.push("la couleur de peau personnalisée");
      }
      if (relativeData.hairColor.type === 'custom' && !relativeData.hairColor.custom?.trim()) {
        errors.push("la couleur des cheveux personnalisée");
      }
      if (relativeData.hairType === 'custom' && !relativeData.hairTypeCustom?.trim()) {
        errors.push("le type de cheveux personnalisé");
      }

      // Validation des traits personnalisés
      if (relativeData.customTraits) {
        for (const traitKey of Object.keys(relativeData.customTraits)) {
          if (!relativeData.customTraits[traitKey]?.trim()) {
            errors.push(`le trait personnalisé "${traitKey}"`);
          }
        }
      }

      // Vérifier les détails physiques : au moins un détail OU la case "aucun détail" cochée
      // v3.0 (chantier C1a) : détails physiques facultatifs, voir PhysicalDetailsInput v3.0.

      if (selectedChildIds.length === 0) {
        errors.push("au moins un enfant sélectionné");
      }

      if (errors.length > 0) {
        toast.error(`Veuillez renseigner : ${errors.join(', ')}`);
        return;
      }

      // Récupérer le family_id du premier enfant sélectionné
      const { data: firstChild } = await supabase
        .from('child_profiles')
        .select('family_id')
        .eq('id', selectedChildIds[0])
        .single();
      
      if (!firstChild?.family_id) {
        toast.error('Family ID non trouvé');
        return;
      }

      // 1. Créer le membre de famille
      const { data: familyMember, error: familyError } = await supabase
        .from('family_members')
        .insert({
          family_id: firstChild.family_id,
          name: splitCamelCase(relativeData.firstName),
          role: relativeData.type,
          avatar: null,
          // v1.3 : ecriture directe, voir ModifierProche v1.9.
          physical_details: (relativeData.physicalDetails && relativeData.physicalDetails.length > 0)
            ? relativeData.physicalDetails
            : [],
          clothing_style: relativeData.clothingStyle 
            ? [relativeData.clothingStyle] 
            : [],
          // Persist remaining relative profile for edit prefill
          details: {
            nickname: relativeData.nickname
              ? {
                  ...relativeData.nickname,
                  custom: relativeData.nickname.custom
                    ? splitCamelCase(relativeData.nickname.custom)
                    : relativeData.nickname.custom,
                }
              : relativeData.nickname,
            skinColor: relativeData.skinColor, // Already an object with type/custom
            eyeColor: relativeData.eyeColor,
            hairColor: relativeData.hairColor, // Already an object with type/custom
            hairType: relativeData.hairType,
            hairTypeCustom: relativeData.hairTypeCustom,
            hairLength: relativeData.hairLength,
            glasses: relativeData.glasses,
            traits: relativeData.traits,
            customTraits: relativeData.customTraits || {},
            age: relativeData.age,
            birthDate: relativeData.birthDate ? relativeData.birthDate.toISOString().split('T')[0] : null,
            job: relativeData.job,
            gender: relativeData.gender,
            otherTypeName: relativeData.otherTypeName,
            noPhysicalDetails: relativeData.noPhysicalDetails
          }
        } as any)
        .select()
        .single();

      if (familyError) throw familyError;

      // 2. Lier le proche à chaque enfant sélectionné
      const childFamilyMemberRecords = selectedChildIds.map(childId => ({
        child_id: childId,
        family_member_id: familyMember.id,
        relation_label: relativeData.type
      }));

      const { error: linkError } = await supabase
        .from('child_family_members')
        .insert(childFamilyMemberRecords);

      if (linkError) throw linkError;

      // L'avatar est généré côté n8n (trigger à l'INSERT). On signale la régénération pour que la
      // carte du dashboard affiche « en création » jusqu'à l'arrivée du nouvel avatar. Le flag est
      // persistant (localStorage) → il survit au window.location.href ci-dessous.
      signalAvatarRegeneration(familyMember.id);

      toast.success('Proche ajouté avec succès !');
      invalidateFamilyData();
      queryClient.invalidateQueries({ queryKey: ['book-timeline'] });
      libererSortie(); // v1.6 : enregistrement reussi, on part sans avertissement
      reussi = true; // v1.7 : verrou garde pendant le rechargement de la page
      window.location.href = '/espace-famille';
    } catch (error) {
      console.error('Erreur lors de l\'ajout du proche:', error);
      toast.error('Erreur lors de l\'ajout du proche');
    } finally {
      if (!reussi) { // v1.7
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

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
          <h1 className="text-3xl font-bold text-mcf-orange-dark">Ajouter un proche</h1>
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
            {/* Sélection des enfants */}
            {children.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-mcf-orange-dark">
                    Sélectionnez le(s) enfant(s) concerné(s)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Vous pouvez sélectionner plusieurs enfants pour leur ajouter le même proche
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
                    Vous devez d'abord créer le profil d'un enfant pour pouvoir lui ajouter des proches.
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
                Nouveau proche
                <span className="text-sm font-normal text-gray-600">
                  pour {selectedChildIds.map(id => children.find(c => c.id === id)?.firstName).join(', ')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary fallback={<div>Erreur dans la fiche proche</div>}>
                <RelativeForm 
                  key={relativeKey}
                  relative={createEmptyRelative()}
                  onSave={handleAddRelative} 
                  onCancel={handleSortie}
                  isDisabled={isSubmitting}
                />
              </ErrorBoundary>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
