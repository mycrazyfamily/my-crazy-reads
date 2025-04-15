
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

type SupabaseAuthData = {
  supabaseAuthUser: any;
  supabaseSession: any;
}

export const AuthStatus = ({ supabaseAuthUser, supabaseSession }: SupabaseAuthData) => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <>
      <div className="p-4 border rounded-md bg-gray-50">
        <h3 className="font-medium mb-2">Statut d'authentification :</h3>
        <p>
          {isAuthenticated 
            ? `Connecté en tant que : ${user?.email || 'Utilisateur inconnu'}`
            : 'Non connecté'}
        </p>
      </div>
      
      <div className="p-4 border rounded-md bg-gray-50">
        <h3 className="font-medium mb-2">Statut d'authentification Supabase :</h3>
        {supabaseAuthUser ? (
          <div>
            <p><strong>Email:</strong> {supabaseAuthUser.email}</p>
            <p><strong>ID:</strong> {supabaseAuthUser.id}</p>
            <p><strong>Session active:</strong> {supabaseSession ? 'Oui' : 'Non'}</p>
          </div>
        ) : (
          <p>Aucune session Supabase active</p>
        )}
      </div>
    </>
  );
};
