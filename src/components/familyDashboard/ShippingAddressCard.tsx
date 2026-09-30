// ShippingAddressCard v1.0 — 29/09/2026 (chantier adresse de livraison)
// Bloc « Adresse de livraison » de la section « Gerer mes abonnements » (espace famille).
//
// UNE ADRESSE PAR FAMILLE (table shipping_addresses, adresse_livraison_v1.sql) : elle
// vaut pour tous les enfants abonnes. Remplie a l'abonnement par stripe-webhook v2.4
// (adresse saisie chez Stripe), puis consultable et modifiable ici.
// Les livres partent a l'adresse presente AU MOMENT DE L'EXPEDITION : une modification
// vaut pour les prochains envois, jamais pour un livre deja parti.
//
// CONTROLES
//   · France metropolitaine et Corse uniquement : code postal a 5 chiffres, ni 97xxx
//     (DOM) ni 98xxx (Monaco, TOM). La base refuse de toute facon ces codes.
//   · VILLE COHERENTE AVEC LE CODE POSTAL. Stripe ne verifie pas ce point : un test du
//     29/09 a enregistre « 75004 Londres ». Dans le formulaire, la ville se choisit
//     dans la liste des communes du code postal (API publique geo.api.gouv.fr, gratuite,
//     sans cle). Pour une adresse deja enregistree, une incoherence est signalee au
//     parent. Si l'API ne repond pas, la ville redevient un champ libre et aucune
//     alerte n'est affichee : on ne bloque jamais un parent sur une panne externe.
//   · Telephone obligatoire (decision du 29/09), format souple.
//
// La table n'est pas dans les types generes (src/integrations/supabase/types.ts) : elle
// est lue et ecrite sans typage, a travers tableAdresses().
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { AlertTriangle, Loader2, MapPin, Pencil } from 'lucide-react';

type Adresse = {
  family_id: string;
  full_name: string;
  line1: string;
  line2: string | null;
  postal_code: string;
  city: string;
  country: string;
  phone: string | null;
};

type Formulaire = {
  full_name: string;
  line1: string;
  line2: string;
  postal_code: string;
  city: string;
  phone: string;
};

const FORMULAIRE_VIDE: Formulaire = { full_name: '', line1: '', line2: '', postal_code: '', city: '', phone: '' };

// Table absente des types generes : acces non type, limite a ces deux usages.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableAdresses = () => (supabase as any).from('shipping_addresses');

// Compare deux noms de ville sans tenir compte des accents, tirets, apostrophes,
// abreviations St / Ste ni d'une mention CEDEX.
const normaliser = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-'’]/g, ' ')
    // Abreviations courantes : « St Etienne » vaut « Saint-Étienne ».
    .replace(/\bste\b/g, 'sainte')
    .replace(/\bst\b/g, 'saint')
    .replace(/\bcedex\b.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();

// « Paris 4e » est accepte pour la commune « Paris » : le nom de la commune suffit.
const villeCorrespond = (ville: string, communes: string[]) => {
  const v = normaliser(ville);
  return communes.some((c) => {
    const n = normaliser(c);
    return v === n || v.startsWith(n + ' ');
  });
};

// Communes d'un code postal. null = reponse indisponible (panne, reseau).
const communesDuCodePostal = async (cp: string): Promise<string[] | null> => {
  try {
    const r = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${cp}&fields=nom&format=json`);
    if (!r.ok) return null;
    const data = await r.json();
    if (!Array.isArray(data)) return null;
    return Array.from(new Set(data.map((c: { nom: string }) => c.nom))).sort((a, b) => a.localeCompare(b, 'fr'));
  } catch {
    return null;
  }
};

const CP_VALIDE = /^[0-9]{5}$/;
const cpHorsZone = (cp: string) => cp.startsWith('97') || cp.startsWith('98');
const telephoneValide = (t: string) => /^[+0-9 .()-]+$/.test(t) && t.replace(/[^0-9]/g, '').length >= 9;

const ShippingAddressCard: React.FC = () => {
  const { supabaseSession } = useAuth();
  const userId = supabaseSession?.user?.id ?? null;

  const [familyId, setFamilyId] = useState<string | null>(null);
  const [adresse, setAdresse] = useState<Adresse | null>(null);
  const [chargement, setChargement] = useState(true);
  const [incoherence, setIncoherence] = useState(false);

  const [edition, setEdition] = useState(false);
  const [form, setForm] = useState<Formulaire>(FORMULAIRE_VIDE);
  // null : communes inconnues (code postal incomplet ou API indisponible).
  const [communes, setCommunes] = useState<string[] | null>(null);
  const [rechercheCommunes, setRechercheCommunes] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);

  // Famille de l'utilisateur, puis son adresse.
  useEffect(() => {
    if (!userId) return;
    let annule = false;
    (async () => {
      const { data: profil } = await supabase.from('user_profiles').select('family_id').eq('id', userId).maybeSingle();
      const fid = profil?.family_id ?? null;
      if (annule) return;
      setFamilyId(fid);
      if (fid) {
        const { data } = await tableAdresses().select('*').eq('family_id', fid).maybeSingle();
        if (!annule) setAdresse((data as Adresse | null) ?? null);
      }
      if (!annule) setChargement(false);
    })();
    return () => {
      annule = true;
    };
  }, [userId]);

  // Coherence ville / code postal de l'adresse enregistree (saisie chez Stripe, par exemple).
  useEffect(() => {
    if (!adresse) {
      setIncoherence(false);
      return;
    }
    let annule = false;
    (async () => {
      const liste = await communesDuCodePostal(adresse.postal_code);
      if (!annule) setIncoherence(!!liste && liste.length > 0 && !villeCorrespond(adresse.city, liste));
    })();
    return () => {
      annule = true;
    };
  }, [adresse]);

  // Communes du code postal saisi dans le formulaire.
  const cpSaisi = form.postal_code;
  useEffect(() => {
    if (!edition) return;
    if (!CP_VALIDE.test(cpSaisi) || cpHorsZone(cpSaisi)) {
      setCommunes(null);
      return;
    }
    let annule = false;
    setRechercheCommunes(true);
    (async () => {
      const liste = await communesDuCodePostal(cpSaisi);
      if (annule) return;
      setRechercheCommunes(false);
      setCommunes(liste);
      if (liste && liste.length > 0) {
        setForm((f) => {
          // La ville deja saisie est gardee si elle correspond, sous le nom officiel.
          const trouvee = liste.find((c) => villeCorrespond(f.city, [c]));
          if (trouvee) return { ...f, city: trouvee };
          return { ...f, city: liste.length === 1 ? liste[0] : '' };
        });
      }
    })();
    return () => {
      annule = true;
    };
  }, [cpSaisi, edition]);

  const ouvrirEdition = () => {
    setForm(
      adresse
        ? {
            full_name: adresse.full_name,
            line1: adresse.line1,
            line2: adresse.line2 ?? '',
            postal_code: adresse.postal_code,
            city: adresse.city,
            phone: adresse.phone ?? '',
          }
        : FORMULAIRE_VIDE
    );
    setCommunes(null);
    setEdition(true);
  };

  const changer = (champ: keyof Formulaire) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [champ]: e.target.value }));

  const erreurCodePostal =
    form.postal_code && !CP_VALIDE.test(form.postal_code)
      ? 'Le code postal comporte 5 chiffres.'
      : form.postal_code && cpHorsZone(form.postal_code)
      ? 'Nous livrons uniquement en France métropolitaine et en Corse.'
      : communes && communes.length === 0
      ? 'Ce code postal est introuvable.'
      : null;

  const enregistrer = async () => {
    if (!familyId) return;
    const f = {
      full_name: form.full_name.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim(),
      postal_code: form.postal_code.trim(),
      city: form.city.trim(),
      phone: form.phone.trim(),
    };
    if (!f.full_name || !f.line1 || !f.city) {
      toast.error('Merci de compléter le nom, l\'adresse et la ville.');
      return;
    }
    if (!CP_VALIDE.test(f.postal_code) || cpHorsZone(f.postal_code) || (communes && communes.length === 0)) {
      toast.error(erreurCodePostal ?? 'Code postal invalide.');
      return;
    }
    if (communes && communes.length > 0 && !villeCorrespond(f.city, communes)) {
      toast.error('Choisissez la ville correspondant à votre code postal.');
      return;
    }
    if (!telephoneValide(f.phone)) {
      toast.error('Merci d\'indiquer un numéro de téléphone valide.');
      return;
    }

    setEnregistrement(true);
    const ligne = {
      family_id: familyId,
      full_name: f.full_name,
      line1: f.line1,
      line2: f.line2 || null,
      postal_code: f.postal_code,
      city: f.city,
      country: 'FR',
      phone: f.phone,
      source: 'espace_famille',
    };
    const { error } = await tableAdresses().upsert(ligne, { onConflict: 'family_id' });
    setEnregistrement(false);
    if (error) {
      console.error('Enregistrement de l\'adresse :', error);
      toast.error('Impossible d\'enregistrer l\'adresse. Vérifiez les champs et réessayez.');
      return;
    }
    setAdresse({ ...ligne });
    setEdition(false);
    toast.success('Adresse enregistrée. Vos prochains livres partiront à cette adresse.');
  };

  if (chargement || !familyId) return null;

  return (
    <Card className="border-mcf-mint shadow-lg">
      <CardHeader>
        <CardTitle className="text-mcf-primary text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Adresse de livraison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!edition && (
          <>
            {adresse ? (
              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="font-semibold">{adresse.full_name}</p>
                <p>{adresse.line1}</p>
                {adresse.line2 && <p>{adresse.line2}</p>}
                <p>
                  {adresse.postal_code} {adresse.city}
                </p>
                <p>France</p>
                {adresse.phone && <p className="mt-2 text-gray-500">Téléphone : {adresse.phone}</p>}
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Ajoutez votre adresse de livraison pour recevoir vos livres.</span>
              </div>
            )}

            {adresse && incoherence && (
              <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  La ville ne correspond pas au code postal. Vérifiez votre adresse pour que vos livres arrivent bien.
                </span>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Livraison en France métropolitaine et en Corse. Vos livres partent à l'adresse enregistrée au moment de
              leur expédition.
            </p>
            <Button variant="outline" onClick={ouvrirEdition} className="border-mcf-primary text-mcf-primary">
              <Pencil className="h-4 w-4 mr-2" />
              {adresse ? 'Modifier' : 'Ajouter mon adresse'}
            </Button>
          </>
        )}

        {edition && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="adr-nom">Nom et prénom</Label>
              <Input id="adr-nom" value={form.full_name} onChange={changer('full_name')} maxLength={120} autoComplete="name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="adr-ligne1">Adresse</Label>
              <Input id="adr-ligne1" value={form.line1} onChange={changer('line1')} maxLength={200} autoComplete="address-line1" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="adr-ligne2">Complément d'adresse (facultatif)</Label>
              <Input
                id="adr-ligne2"
                value={form.line2}
                onChange={changer('line2')}
                maxLength={200}
                placeholder="Bâtiment, étage, digicode…"
                autoComplete="address-line2"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="adr-cp">Code postal</Label>
                <Input
                  id="adr-cp"
                  value={form.postal_code}
                  onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="adr-ville">Ville</Label>
                {communes && communes.length > 0 ? (
                  <Select value={form.city} onValueChange={(v) => setForm((f) => ({ ...f, city: v }))}>
                    <SelectTrigger id="adr-ville">
                      <SelectValue placeholder="Choisissez votre commune" />
                    </SelectTrigger>
                    <SelectContent>
                      {communes.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input id="adr-ville" value={form.city} onChange={changer('city')} maxLength={120} autoComplete="address-level2" />
                )}
              </div>
            </div>
            {rechercheCommunes && <p className="text-xs text-gray-500">Recherche des communes…</p>}
            {erreurCodePostal && <p className="text-xs text-red-600">{erreurCodePostal}</p>}
            <div className="space-y-1">
              <Label htmlFor="adr-tel">Téléphone</Label>
              <Input id="adr-tel" value={form.phone} onChange={changer('phone')} maxLength={30} inputMode="tel" autoComplete="tel" />
              <p className="text-xs text-gray-500">Utile au transporteur pour la livraison.</p>
            </div>
            <p className="text-xs text-gray-500">Pays : France (métropole et Corse).</p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEdition(false)} disabled={enregistrement}>
                Annuler
              </Button>
              <Button onClick={enregistrer} disabled={enregistrement} className="bg-mcf-primary hover:bg-mcf-primary-dark text-white">
                {enregistrement && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingAddressCard;
