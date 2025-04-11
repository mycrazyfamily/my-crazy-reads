
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type UserProfile = {
  id: string;
  first_name: string | null;
  created_at: string;
  family_id: string;
  role: string | null;
}

const DebugSupabase: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching user profiles...');
      console.log('Authentication status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
      console.log('Current user:', user);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching user profiles:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        setError(error.message);
        toast.error(`Erreur lors de la récupération des profils : ${error.message}`);
      } else {
        console.log('User profiles fetched successfully:', data);
        setUserProfiles(data || []);
        toast.success(`${data?.length || 0} profil(s) récupéré(s)`);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      console.error('Error details:', err instanceof Error ? err.stack : JSON.stringify(err));
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      toast.error('Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Log initial authentication state on component mount
    console.log('Initial auth state:', { 
      isAuthenticated, 
      user,
      // Use the Supabase URL from the environment or directly
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://rjbmhcoctpwmlqndzybm.supabase.co'
    });
  }, [isAuthenticated, user]);

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
            <div className="p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Statut d'authentification :</h3>
              <p>
                {isAuthenticated 
                  ? `Connecté en tant que : ${user?.email || 'Utilisateur inconnu'}`
                  : 'Non connecté'}
              </p>
            </div>

            <Button 
              onClick={fetchUserProfiles} 
              disabled={isLoading || !isAuthenticated}
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

            {userProfiles.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Résultats :</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Famille</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date création</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userProfiles.map((profile) => (
                        <tr key={profile.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{profile.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{profile.first_name || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{profile.role || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{profile.family_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(profile.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugSupabase;
