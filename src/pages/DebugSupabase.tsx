
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthStatus } from '@/components/debug/AuthStatus';
import { UserProfilesTable } from '@/components/debug/UserProfilesTable';
import { useSupabaseDebug } from '@/hooks/useSupabaseDebug';

const DebugSupabase: React.FC = () => {
  const {
    userProfiles,
    isLoading,
    error,
    supabaseAuthUser,
    supabaseSession,
    fetchUserProfiles
  } = useSupabaseDebug();

  return (
    <div className="container mx-auto px-4 py-20">
      <Link to="/" className="inline-flex items-center mb-6 text-mcf-orange hover:text-mcf-orange-dark transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à l'accueil
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Supabase - user_profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AuthStatus 
              supabaseAuthUser={supabaseAuthUser} 
              supabaseSession={supabaseSession} 
            />

            <Button 
              onClick={fetchUserProfiles} 
              disabled={isLoading}
              className="bg-mcf-orange hover:bg-mcf-orange-dark"
            >
              {isLoading ? 'Chargement...' : 'Tester la connexion à user_profiles'}
            </Button>

            {error && (
              <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800">
                <h3 className="font-medium mb-2">Erreur :</h3>
                <p>{error}</p>
                <p className="mt-2 text-xs">Vérifiez la console pour plus de détails.</p>
              </div>
            )}

            <UserProfilesTable userProfiles={userProfiles} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugSupabase;
