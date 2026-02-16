import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type ProfileType = 'child' | 'relative' | 'pet';

type TableName = 'child_profiles' | 'family_members' | 'pets';

const TABLE_MAP: Record<ProfileType, TableName> = {
  child: 'child_profiles',
  relative: 'family_members',
  pet: 'pets',
};

const FACTORY_WEBHOOK_URL =
  'https://mcf-automation-n8n.jnow9f.easypanel.host/webhook/factory-avatar-mcf';

interface ResetAvatarButtonProps {
  profileId: string;
  profileType: ProfileType;
  profileName?: string;
}

const ResetAvatarButton: React.FC<ResetAvatarButtonProps> = ({
  profileId,
  profileType,
  profileName,
}) => {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      // Fetch current avatar URL before triggering factory
      const table = TABLE_MAP[profileType];
      const { data: row } = await supabase
        .from(table)
        .select('avatar_url')
        .eq('id', profileId)
        .maybeSingle();

      await fetch(FACTORY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          type: profileType,
          current_avatar_url: row?.avatar_url || null,
        }),
      });

      toast.success('Création de votre nouvel avatar en cours… ✨', {
        description: 'Cela peut prendre quelques instants.',
        duration: 5000,
      });
    } catch (err) {
      console.error('Factory webhook error:', err);
      toast.error("Erreur lors de la demande de regénération de l'avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          className="text-muted-foreground hover:text-mcf-orange gap-1.5 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création en cours…
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Recommencer l'avatar de zéro
            </>
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-mcf-orange" />
            Recommencer l'avatar de zéro ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr ? Cela remplacera l'avatar actuel
            {profileName ? ` de ${profileName}` : ''} par une création
            entièrement nouvelle.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            className="bg-mcf-orange hover:bg-mcf-orange/90 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Oui, recommencer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetAvatarButton;
